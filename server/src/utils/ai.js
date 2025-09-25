export async function getTaskGuidance({ title, description, priority, skillLevel }) {
  // Simple heuristic guidance; if OPENAI_API_KEY is set, we could integrate, but keep it stubbed for now
  const suggestions = [];
  if (priority === 'Critical' || priority === 'High') suggestions.push('Break the task into smaller sub-tasks and tackle the riskiest part first.');
  if ((description || '').toLowerCase().includes('api')) suggestions.push('Verify API contracts and add request/response examples.');
  if ((description || '').toLowerCase().includes('ui')) suggestions.push('Create wireframes or sketches before implementation.');
  if (skillLevel === 'beginner') suggestions.push('Search for official documentation and complete a quick tutorial on the core topic.');
  suggestions.push('Define a clear definition of done and write acceptance criteria.');
  return {
    guidance: `Here is a recommended approach for: ${title}`,
    steps: [
      'Clarify requirements and constraints with your mentor/project manager.',
      'Draft a simple plan with milestones and estimations.',
      'Implement iteratively, testing after each step.',
      'Request a peer review before marking as Completed.'
    ],
    suggestions
  };
}
