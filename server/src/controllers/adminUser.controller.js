import { User } from '../models/User.js';
import { hashPassword } from '../utils/auth.js';

class AdminUserController {
  // Get all users with pagination and filtering (Admin gated at router)
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const search = (req.query.search || '').trim();
      const roleFilter = (req.query.role || '').trim();
      const statusFilter = (req.query.status || '').trim();
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

      const query = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }
      if (roleFilter) query.role = roleFilter;
      if (statusFilter) query.status = statusFilter;

      const [users, total, statsAgg, roleDistribution] = await Promise.all([
        User.find(query)
          .populate('planId', 'name features priceMonthly')
          .sort({ [sortBy]: sortOrder })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(query),
        User.aggregate([
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
              inactiveUsers: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
              suspendedUsers: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
              adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'Admin'] }, 1, 0] } },
            },
          },
        ]),
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      ]);

      const stats = statsAgg?.[0] || {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        suspendedUsers: 0,
        adminUsers: 0,
      };

      res.json({
        success: true,
        users,
        stats,
        roleDistribution,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create new user (Admin gated at router)
  async createUser(req, res) {
    try {
      const { firstName, lastName, email, password, role, status, planId } = req.body || {};

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ success: false, message: 'firstName, lastName and email are required' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'User with this email already exists' });
      }

      const passwordHash = await hashPassword(password || Math.random().toString(36).slice(2, 10));

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        passwordHash,
        role: role || 'Contributor',
        status: status || 'active',
        planId: planId || undefined,
      });

      const userResponse = await User.findById(newUser._id)
        .select('-passwordHash')
        .populate('planId', 'name features priceMonthly');

      res.status(201).json({ success: true, message: 'User created successfully', user: userResponse });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get single user by ID
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId)
        .select('-passwordHash')
        .populate('planId', 'name features priceMonthly');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { firstName, lastName, email, role, status, planId, password } = req.body || {};

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (email && email !== user.email) {
        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ success: false, message: 'Email already exists' });
      }

      const updateData = {
        firstName: firstName ?? user.firstName,
        lastName: lastName ?? user.lastName,
        email: email ?? user.email,
        role: role ?? user.role,
        status: status ?? user.status,
        planId: planId ?? user.planId,
        updatedAt: new Date(),
      };

      if (password) {
        updateData.passwordHash = await hashPassword(password);
      }

      const updated = await User.findByIdAndUpdate(userId, updateData, { new: true })
        .select('-passwordHash')
        .populate('planId', 'name features priceMonthly');

      res.json({ success: true, message: 'User updated successfully', user: updated });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete user (prevent self-delete)
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      if (userId === req.user?.id) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
      }
      const deleted = await User.findByIdAndDelete(userId);
      if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Bulk operations
  async bulkUpdateUsers(req, res) {
    try {
      const { userIds = [], action, data = {} } = req.body || {};
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ success: false, message: 'userIds must be a non-empty array' });
      }

      let result;
      switch (action) {
        case 'activate':
          result = await User.updateMany({ _id: { $in: userIds } }, { status: 'active', updatedAt: new Date() });
          break;
        case 'deactivate':
          result = await User.updateMany({ _id: { $in: userIds } }, { status: 'inactive', updatedAt: new Date() });
          break;
        case 'suspend':
          result = await User.updateMany({ _id: { $in: userIds } }, { status: 'suspended', updatedAt: new Date() });
          break;
        case 'delete':
          if (req.user && userIds.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
          }
          result = await User.deleteMany({ _id: { $in: userIds } });
          break;
        case 'updateRole':
          if (!data.role) return res.status(400).json({ success: false, message: 'role is required for updateRole' });
          result = await User.updateMany({ _id: { $in: userIds } }, { role: data.role, updatedAt: new Date() });
          break;
        default:
          return res.status(400).json({ success: false, message: 'Invalid bulk action' });
      }

      res.json({ success: true, message: `Bulk ${action} completed successfully`, affected: result.modifiedCount || result.deletedCount || 0 });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Export users data
  async exportUsers(req, res) {
    try {
      const users = await User.find({}, '-passwordHash')
        .populate('planId', 'name features priceMonthly')
        .lean();

      const csvData = users.map((u) => ({
        ID: u._id.toString(),
        'First Name': u.firstName,
        'Last Name': u.lastName,
        Email: u.email,
        Role: u.role,
        Status: u.status,
        Plan: u.planId?.name || 'None',
        'Price Monthly': u.planId?.priceMonthly ?? '',
        'Created At': u.createdAt ? new Date(u.createdAt).toISOString() : '',
      }));

      res.json({ success: true, data: csvData, filename: `users_export_${new Date().toISOString().split('T')[0]}.csv` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new AdminUserController();
