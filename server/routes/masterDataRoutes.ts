import { Router } from 'express';
import { storage } from '../services/storage';
import { authenticateToken, requireDashboardUser } from '../middleware/auth';

const router = Router();

// Get all master roles
router.get('/roles', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const roles = await storage.getMasterRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching master roles:', error);
    res.status(500).json({ error: 'Failed to fetch master roles' });
  }
});

// Create master role
router.post('/roles', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const role = await storage.createMasterRole(name);
    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating master role:', error);
    res.status(500).json({ error: 'Failed to create master role' });
  }
});

// Update master role
router.put('/roles/:id', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const { name } = req.body;
    const roleId = parseInt(req.params.id);
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const role = await storage.updateMasterRole(roleId, name);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error updating master role:', error);
    res.status(500).json({ error: 'Failed to update master role' });
  }
});

// Delete master role
router.delete('/roles/:id', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const success = await storage.deleteMasterRole(roleId);
    
    if (!success) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting master role:', error);
    res.status(500).json({ error: 'Failed to delete master role' });
  }
});

// Get all master cities
router.get('/cities', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const cities = await storage.getMasterCities();
    res.json(cities);
  } catch (error) {
    console.error('Error fetching master cities:', error);
    res.status(500).json({ error: 'Failed to fetch master cities' });
  }
});

// Create master city
router.post('/cities', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const city = await storage.createMasterCity(name);
    res.status(201).json(city);
  } catch (error) {
    console.error('Error creating master city:', error);
    res.status(500).json({ error: 'Failed to create master city' });
  }
});

// Update master city
router.put('/cities/:id', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const { name } = req.body;
    const cityId = parseInt(req.params.id);
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const city = await storage.updateMasterCity(cityId, name);
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    res.json(city);
  } catch (error) {
    console.error('Error updating master city:', error);
    res.status(500).json({ error: 'Failed to update master city' });
  }
});

// Delete master city
router.delete('/cities/:id', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const cityId = parseInt(req.params.id);
    const success = await storage.deleteMasterCity(cityId);
    
    if (!success) {
      return res.status(404).json({ error: 'City not found' });
    }
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting master city:', error);
    res.status(500).json({ error: 'Failed to delete master city' });
  }
});

// Get all master clusters
router.get('/clusters', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const clusters = await storage.getMasterClusters();
    res.json(clusters);
  } catch (error) {
    console.error('Error fetching master clusters:', error);
    res.status(500).json({ error: 'Failed to fetch master clusters' });
  }
});

// Create master cluster
router.post('/clusters', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const { name, cityId } = req.body;
    if (!name || !cityId) {
      return res.status(400).json({ error: 'Name and cityId are required' });
    }
    const cluster = await storage.createMasterCluster(name, parseInt(cityId));
    res.status(201).json(cluster);
  } catch (error) {
    console.error('Error creating master cluster:', error);
    res.status(500).json({ error: 'Failed to create master cluster' });
  }
});

// Update master cluster
router.put('/clusters/:id', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const { name, cityId } = req.body;
    const clusterId = parseInt(req.params.id);
    
    if (!name || !cityId) {
      return res.status(400).json({ error: 'Name and cityId are required' });
    }
    
    const cluster = await storage.updateMasterCluster(clusterId, name, parseInt(cityId));
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }
    res.json(cluster);
  } catch (error) {
    console.error('Error updating master cluster:', error);
    res.status(500).json({ error: 'Failed to update master cluster' });
  }
});

// Delete master cluster
router.delete('/clusters/:id', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const clusterId = parseInt(req.params.id);
    const success = await storage.deleteMasterCluster(clusterId);
    
    if (!success) {
      return res.status(404).json({ error: 'Cluster not found' });
    }
    res.json({ message: 'Cluster deleted successfully' });
  } catch (error) {
    console.error('Error deleting master cluster:', error);
    res.status(500).json({ error: 'Failed to delete master cluster' });
  }
});

// Get audit logs
router.get('/audit-logs', authenticateToken, requireDashboardUser, async (req, res) => {
  try {
    const logs = await storage.getMasterAuditLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;