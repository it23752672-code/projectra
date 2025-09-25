import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import {
  getCompaniesNetwork,
  createCompany,
  updateCompany,
  deleteCompany,
  listCollaborationRequests,
  createCollaborationRequest,
  updateCollaborationRequest,
  deleteCollaborationRequest,
  getEmployeesAvailability,
  updateEmployeeAvailability,
  getNetworkAnalytics,
} from '../controllers/network.controller.js';

const router = Router();

router.use(requireAuth);

// Companies (Partners)
router.get('/companies/network', getCompaniesNetwork);
router.post('/companies/network', requireRoles('Admin', 'ProjectManager'), createCompany);
router.put('/companies/network/:id', requireRoles('Admin', 'ProjectManager'), updateCompany);
router.delete('/companies/network/:id', requireRoles('Admin'), deleteCompany);

// Collaboration Requests
router.get('/collaboration-requests', listCollaborationRequests);
router.post('/collaboration-requests', requireRoles('Admin', 'ProjectManager'), createCollaborationRequest);
router.put('/collaboration-requests/:id', requireRoles('Admin', 'ProjectManager'), updateCollaborationRequest);
router.delete('/collaboration-requests/:id', requireRoles('Admin', 'ProjectManager'), deleteCollaborationRequest);

// Employees availability
router.get('/employees/availability', getEmployeesAvailability);
router.put('/employees/availability/:id', requireRoles('Admin', 'ProjectManager'), updateEmployeeAvailability);

// Network analytics
router.get('/network/analytics', getNetworkAnalytics);

export default router;
