import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

export const ProjectManagerController = {
  // Get project overview with team and tasks
  async getProjectOverview(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const project = await Project.findById(projectId)
        .populate('projectManager', 'firstName lastName email role')
        .populate('teamMembers.userId', 'firstName lastName email role')
        .populate('teamLeaders', 'firstName lastName email');

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      // Verify user is project manager (either explicit projectManager or legacy managers contains user)
      const isPM = (project.projectManager && project.projectManager._id?.toString() === userId) ||
                   (Array.isArray(project.managers) && project.managers.map(id => id.toString()).includes(userId));
      if (!isPM) {
        return res.status(403).json({ success: false, message: 'Access denied. Project Manager only.' });
      }

      // Get task statistics
      const taskStats = await Task.aggregate([
        { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalWeightage: { $sum: { $ifNull: ['$taskWeightage', 0] } }
          }
        }
      ]);

      // Get main tasks with subtask counts
      const mainTasks = await Task.find({ projectId, taskType: 'Main Task' })
        .populate('assigneeId', 'firstName lastName email')
        .populate('subTasks')
        .sort({ priority: -1, dueDate: 1 })
        .lean();

      const projObj = project.toObject();
      // Provide projectName alias for UI convenience
      projObj.projectName = projObj.name;
      projObj.mainTasks = mainTasks;

      return res.json({ success: true, project: projObj, taskStats });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Add team member to project
  async addTeamMember(req, res) {
    try {
      const { projectId } = req.params;
      const { userId, role, hourlyRate, maxHoursPerWeek } = req.body;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      // Check if user already in project
      const exists = (project.teamMembers || []).find(m => m.userId?.toString() === userId);
      if (exists) {
        return res.status(400).json({ success: false, message: 'User already in project' });
      }

      project.teamMembers = project.teamMembers || [];
      project.teamMembers.push({ userId, role, hourlyRate, maxHoursPerWeek: maxHoursPerWeek || 40 });
      project.teamLeaders = project.teamLeaders || [];
      if (role === 'Team Leader') {
        // Avoid duplicates
        if (!project.teamLeaders.map(id => id.toString()).includes(userId)) {
          project.teamLeaders.push(userId);
        }
      }

      await project.save();
      await project.populate('teamMembers.userId', 'firstName lastName email');

      const projObj = project.toObject();
      projObj.projectName = projObj.name;

      return res.json({ success: true, message: 'Team member added successfully', project: projObj });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Remove team member from project
  async removeTeamMember(req, res) {
    try {
      const { projectId, memberId } = req.params;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      project.teamMembers = (project.teamMembers || []).filter(m => m.userId?.toString() !== memberId);
      project.teamLeaders = (project.teamLeaders || []).filter(id => id.toString() !== memberId);

      // Reassign tasks if member had tasks
      await Task.updateMany(
        { projectId, assigneeId: memberId },
        { $unset: { assigneeId: '' }, $set: { status: 'Not Started' } }
      );

      await project.save();

      return res.json({ success: true, message: 'Team member removed successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Create main task and assign to team leader
  async createMainTask(req, res) {
    try {
      const { projectId } = req.params;
      const { taskName, taskDescription, assigneeId, dueDate, priority, estimatedHours, taskWeightage, requiredSkills } = req.body;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const teamLeaders = (project.teamLeaders || []).map(id => id.toString());
      if (!teamLeaders.includes(assigneeId)) {
        return res.status(400).json({ success: false, message: 'Main tasks can only be assigned to Team Leaders' });
      }

      const mainTask = new Task({
        taskName,
        taskDescription,
        taskType: 'Main Task',
        taskLevel: 1,
        projectId,
        assignedBy: req.user.id,
        assigneeId,
        dueDate,
        priority: priority || 'Medium',
        estimatedHours,
        taskWeightage: taskWeightage || 5,
        requiredSkills: requiredSkills || []
      });

      await mainTask.save();
      await mainTask.populate('assigneeId', 'firstName lastName email');

      project.totalTasks = (project.totalTasks || 0) + 1;
      await project.save();

      return res.status(201).json({ success: true, message: 'Main task created and assigned successfully', task: mainTask });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get project workload analysis
  async getWorkloadAnalysis(req, res) {
    try {
      const { projectId } = req.params;
      const project = await Project.findById(projectId).populate('teamMembers.userId', 'firstName lastName email');
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      const workloadAnalysis = await Promise.all(
        (project.teamMembers || []).map(async (member) => {
          const tasks = await Task.find({ projectId, assigneeId: member.userId._id, status: { $in: ['Not Started', 'In Progress'] } });
          const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
          const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
          const util = member.maxHoursPerWeek ? (totalHours / member.maxHoursPerWeek) * 100 : 0;
          return {
            member: member.userId,
            role: member.role,
            maxHoursPerWeek: member.maxHoursPerWeek,
            currentWorkload: totalHours,
            utilizationRate: util,
            activeTasks: tasks.length,
            overdueTasks,
            status: totalHours > member.maxHoursPerWeek ? 'Overloaded' : totalHours > member.maxHoursPerWeek * 0.8 ? 'High' : totalHours > member.maxHoursPerWeek * 0.5 ? 'Moderate' : 'Low'
          };
        })
      );

      return res.json({ success: true, workloadAnalysis });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update project timeline and deadlines
  async updateProjectTimeline(req, res) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate, milestones } = req.body;

      const project = await Project.findByIdAndUpdate(
        projectId,
        { startDate, endDate, ...(milestones && { milestones }) },
        { new: true }
      );

      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      const projObj = project.toObject();
      projObj.projectName = projObj.name;

      return res.json({ success: true, message: 'Project timeline updated successfully', project: projObj });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};

export default ProjectManagerController;
