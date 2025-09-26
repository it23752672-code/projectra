import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';

export const TeamLeaderController = {
  // Get assigned main tasks
  async getAssignedMainTasks(req, res) {
    try {
      const userId = req.user.id;

      const mainTasks = await Task.find({ assigneeId: userId, taskType: 'Main Task' })
        .populate('projectId', 'name projectWeightage priority')
        .populate('assignedBy', 'firstName lastName')
        .populate('subTasks')
        .sort({ dueDate: 1 })
        .lean();

      // Provide projectName alias in populated project
      const transformed = mainTasks.map(t => {
        if (t.projectId && t.projectId.name) {
          t.projectId.projectName = t.projectId.name;
        }
        return t;
      });

      return res.json({ success: true, mainTasks: transformed });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Break main task into subtasks
  async createSubTasks(req, res) {
    try {
      const { mainTaskId } = req.params;
      const { subTasks } = req.body; // Array of subtask objects

      const mainTask = await Task.findById(mainTaskId);
      if (!mainTask) return res.status(404).json({ success: false, message: 'Main task not found' });

      if (mainTask.assigneeId?.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not assigned to this task.' });
      }

      const createdSubTasks = [];
      for (const st of (subTasks || [])) {
        const subTask = new Task({
          taskName: st.taskName,
          taskDescription: st.taskDescription,
          taskType: 'Sub Task',
          taskLevel: 2,
          parentTaskId: mainTaskId,
          projectId: mainTask.projectId,
          assignedBy: req.user.id,
          assigneeId: st.assigneeId,
          dueDate: st.dueDate,
          priority: st.priority || 'Medium',
          estimatedHours: st.estimatedHours,
          taskWeightage: st.taskWeightage || 3,
          requiredSkills: st.requiredSkills || []
        });
        await subTask.save();
        await subTask.populate('assigneeId', 'firstName lastName email');
        createdSubTasks.push(subTask);
      }

      mainTask.subTasks = (mainTask.subTasks || []).concat(createdSubTasks.map(t => t._id));
      await mainTask.save();

      await Project.findByIdAndUpdate(mainTask.projectId, { $inc: { totalTasks: createdSubTasks.length } });

      return res.status(201).json({ success: true, message: 'Subtasks created successfully', subTasks: createdSubTasks });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get available contributors for task assignment
  async getAvailableContributors(req, res) {
    try {
      const { projectId } = req.params;

      const project = await Project.findById(projectId).populate('teamMembers.userId', 'firstName lastName email role');
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      const contributors = (project.teamMembers || []).filter(m => m.role !== 'Team Leader' && m.role !== 'Project Manager');

      const availableContributors = await Promise.all(contributors.map(async (member) => {
        const activeTasks = await Task.countDocuments({ assigneeId: member.userId._id, status: { $in: ['Not Started', 'In Progress'] } });

        const hoursAgg = await Task.aggregate([
          { $match: { assigneeId: new mongoose.Types.ObjectId(member.userId._id), status: { $in: ['Not Started', 'In Progress'] } } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$estimatedHours', 0] } } } }
        ]);
        const totalHours = hoursAgg.length ? hoursAgg[0].total : 0;

        return {
          ...member.toObject(),
          activeTasks,
          currentWorkload: totalHours,
          availability: (member.maxHoursPerWeek - totalHours) > 0 ? 'Available' : 'Busy'
        };
      }));

      return res.json({ success: true, contributors: availableContributors });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};

export default TeamLeaderController;
