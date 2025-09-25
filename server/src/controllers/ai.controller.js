import { GoogleGenerativeAI } from '@google/generative-ai';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { AIInteraction } from '../models/AIInteraction.js';

// In-memory conversation context (per-process)
const HISTORY_LIMIT = Number(process.env.AI_CONTEXT_MEMORY_LIMIT || 10);
const conversationHistory = new Map(); // userId -> array of { user, assistant }

function isAIEnabled() {
  return process.env.AI_ASSISTANT_ENABLED !== 'false' && !!process.env.GEMINI_API_KEY;
}

function buildModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
}

function pushHistory(userId, userMsg, aiMsg) {
  const list = conversationHistory.get(userId) || [];
  list.push({ user: userMsg, assistant: aiMsg });
  // keep last HISTORY_LIMIT exchanges
  if (list.length > HISTORY_LIMIT) list.splice(0, list.length - HISTORY_LIMIT);
  conversationHistory.set(userId, list);
}

function historyToText(userId) {
  const list = conversationHistory.get(userId) || [];
  if (!list.length) return '';
  return list
    .map((m) => `User: ${m.user}\nAssistant: ${m.assistant}`)
    .join('\n');
}

function baseSystemPrompt(user, context, isIntern) {
  const base = `You are ProJectra AI Assistant, an intelligent helper for a multi-company collaborative project management platform. You specialize in helping employees, especially interns and new team members, with project management, task completion, and professional development.\n\nUser Profile:\n- Name: ${user.firstName} ${user.lastName}\n- Role: ${user.role}\n- CompanyId: ${user.companyId || 'N/A'}\n- Experience Level: ${isIntern ? 'Intern/Junior' : 'Experienced'}\n\nCurrent Context: ${JSON.stringify(context || {})}\n\nYour Capabilities:\n1. Task Analysis & Guidance\n2. Project Management Advice\n3. Skill Development\n4. Cross-Company Collaboration\n5. Tool Usage (ProJectra)\n6. Career Development\n\nGuidelines:\n- Be encouraging and supportive\n- Provide actionable, specific advice with concrete next steps\n- Reference relevant ProJectra features when appropriate\n- Ask clarifying questions when needed\n- Keep responses concise but comprehensive (max ~300 words)\n- Professional yet friendly tone`;
  if (isIntern) {
    return base + `\n\nSpecial Focus for Interns:\n- Explain concepts clearly with examples\n- Step-by-step guidance\n- Suggest learning resources\n- Encourage questions and exploration\n- Connect tasks to skill development opportunities`;
  }
  return base;
}

function mockResponse(message) {
  // A deterministic friendly fallback when GEMINI_API_KEY is not configured
  return (
    `Thanks for reaching out! Here's a helpful plan based on your message:\n\n` +
    `• Next steps: break the work into 2–4 small subtasks and set due dates.\n` +
    `• Potential challenges: clarify requirements, identify blockers early.\n` +
    `• Resources: check your project docs and previous tasks for examples.\n` +
    `• Tip: keep updates short and frequent.\n\n` +
    `You asked: "${String(message).slice(0, 200)}"\n` +
    `If you can share a task or project, I can tailor advice further.`
  );
}

export async function chat(req, res) {
  const start = Date.now();
  try {
    const { message, context } = req.body || {};
    if (!message || !String(message).trim()) return res.status(400).json({ message: 'message is required' });

    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isIntern = String(user.role).toLowerCase().includes('intern') || String(user.role).toLowerCase().includes('junior');

    const sys = baseSystemPrompt(user, context, isIntern);
    const hist = historyToText(String(user._id));
    const fullPrompt = `${sys}\n\nConversation so far (if any):\n${hist}\n\nUser: ${message}\nAssistant:`;

    let text;
    if (isAIEnabled()) {
      const model = buildModel();
      const result = await model.generateContent(fullPrompt);
      text = result?.response?.text?.() || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'I can help with that.';
    } else {
      text = mockResponse(message);
    }

    pushHistory(String(user._id), message, text);

    try {
      await AIInteraction.create({
        userId: user._id,
        query: message,
        response: text,
        context: context || {},
        responseTime: Date.now() - start,
      });
    } catch (e) {
      // ignore logging errors
    }

    return res.json({ success: true, response: text, suggestions: [
      'How should I prioritize my tasks?',
      'What are the next steps for my project?',
      'Which skills should I focus on improving?',
      'How do I collaborate with a partner company?'
    ], resources: [] });
  } catch (err) {
    console.error('AI chat error', err);
    return res.status(500).json({ success: false, error: 'Failed to get AI response', fallback: mockResponse(req.body?.message || '') });
  }
}

export async function taskAssistance(req, res) {
  try {
    const { taskId, question } = req.body || {};
    if (!taskId) return res.status(400).json({ message: 'taskId is required' });
    const task = await Task.findById(taskId).populate('projectId').lean();
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const taskCtx = {
      taskName: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      deadline: task.dueDate,
      projectName: task.projectId?.name,
    };

    const prompt = `Help with this task:\n\n- Name: ${taskCtx.taskName}\n- Description: ${taskCtx.description || 'No description'}\n- Status: ${taskCtx.status}\n- Priority: ${taskCtx.priority}\n- Deadline: ${taskCtx.deadline || '—'}\n- Project: ${taskCtx.projectName || '—'}\n\nUser Question: ${question || 'Provide guidance to complete this task efficiently.'}\n\nPlease provide:\n1) Clear next steps\n2) Potential risks and solutions\n3) Helpful resources\n4) Time management tips if relevant`;

    let text;
    if (isAIEnabled()) {
      const model = buildModel();
      const result = await model.generateContent(prompt);
      text = result?.response?.text?.() || 'Here are some steps you can take...';
    } else {
      text = mockResponse(question || taskCtx.taskName);
    }

    return res.json({ success: true, response: text, taskContext: taskCtx });
  } catch (err) {
    console.error('Task Assistance Error', err);
    return res.status(500).json({ error: 'Failed to get task assistance' });
  }
}

export async function projectOnboarding(req, res) {
  try {
    const { projectId } = req.body || {};
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });
    const project = await Project.findById(projectId).lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const proj = {
      name: project.name,
      description: project.description || '',
      deadline: project.endDate || null,
      teamSize: Array.isArray(project.members) ? project.members.length : 0,
      status: project.health || 'On Track',
    };

    const prompt = `Create a welcoming onboarding guide for a new member joining this project.\n\nProject:\n- Name: ${proj.name}\n- Description: ${proj.description}\n- Deadline: ${proj.deadline || '—'}\n- Team Size: ${proj.teamSize}\n- Current Status: ${proj.status}\n\nInclude:\n1) Overview & objectives\n2) Team structure & key contacts\n3) First-week tasks\n4) Milestones & timelines\n5) Docs/resources to review\n6) Communication practices\n7) Success metrics`;

    let text;
    if (isAIEnabled()) {
      const model = buildModel();
      const result = await model.generateContent(prompt);
      text = result?.response?.text?.() || 'Welcome aboard! Here is how to get started...';
    } else {
      text = mockResponse('onboarding');
    }

    return res.json({ success: true, response: text, projectInfo: proj });
  } catch (err) {
    console.error('Project Onboarding Error', err);
    return res.status(500).json({ error: 'Failed to generate onboarding guide' });
  }
}

export async function skillDevelopment(req, res) {
  try {
    const { skillArea, currentLevel } = req.body || {};
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const prompt = `Create a personalized ${skillArea || 'general'} skill development plan for a ${currentLevel || 'beginner'}.\n\nUser Role: ${user.role}\n\nProvide:\n- Learning pathway (beginner → intermediate → advanced)\n- Specific skills to focus on\n- Recommended resources (courses, tutorials, books)\n- Practice exercises or mini-projects\n- Timeline & milestones\n- How to apply these in ProJectra projects\n- Ways to demonstrate progress`;

    let text;
    if (isAIEnabled()) {
      const model = buildModel();
      const result = await model.generateContent(prompt);
      text = result?.response?.text?.() || 'Here is a structured plan...';
    } else {
      text = mockResponse(skillArea || 'skills');
    }

    return res.json({ success: true, response: text, skillArea, currentLevel });
  } catch (err) {
    console.error('Skill Development Error', err);
    return res.status(500).json({ error: 'Failed to generate skill development plan' });
  }
}


export function aiHealth(req, res) {
  try {
    const aiEnabled = isAIEnabled();
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    const modelName = 'gemini-1.5-pro';
    const rateLimitPerHour = Number(process.env.AI_RATE_LIMIT_PER_HOUR || 100);
    return res.json({ ok: true, aiEnabled, hasApiKey, model: modelName, contextMemoryLimit: HISTORY_LIMIT, rateLimitPerHour });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Health check failed' });
  }
}
