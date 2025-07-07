import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getCities,
  createCity,
  updateCity,
  deleteCity,
  getClusters,
  createCluster,
  updateCluster,
  deleteCluster,
  getAuditLogs
} from '@/services/masterDataService';
import { Role, City, Cluster, AuditLog } from '@/types/admin';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  bulkUploadHolidays,
  defaultHolidays2025,
  type Holiday
} from '@/services/holidayService';
import { Calendar, Upload } from 'lucide-react';
import { format } from 'date-fns';

const Settings = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("roles");
  const userId = auth.user?.id || '';

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Cities state
  const [cities, setCities] = useState<City[]>([]);
  const [newCityName, setNewCityName] = useState('');
  const [editCity, setEditCity] = useState<City | null>(null);
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);

  // Clusters state
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [newClusterName, setNewClusterName] = useState('');
  const [newClusterCity, setNewClusterCity] = useState('');
  const [editCluster, setEditCluster] = useState<Cluster | null>(null);
  const [isClusterDialogOpen, setIsClusterDialogOpen] = useState(false);
  const [isClusterLoading, setIsClusterLoading] = useState(false);
  const [clusterToDelete, setClusterToDelete] = useState<Cluster | null>(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // Holidays state
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name: '',
    date: '',
    type: 'government',
    recurring: false,
    description: ''
  });
  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isHolidayLoading, setIsHolidayLoading] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "roles") {
      loadRoles();
    } else if (activeTab === "cities") {
      loadCities();
    } else if (activeTab === "clusters") {
      loadClusters();
    } else if (activeTab === "holidays") {
      loadHolidays();
    } else if (activeTab === "audit") {
      loadAuditLogs();
    }
  }, [activeTab]);

  // Fetch cities on initial load for cluster dropdown
  useEffect(() => {
    loadCities();
  }, []);

  // Roles functions
  const loadRoles = async () => {
    setIsRoleLoading(true);
    const data = await getRoles();
    setRoles(data);
    setIsRoleLoading(false);
  };

  const handleRoleSave = async () => {
    setIsRoleLoading(true);
    
    try {
      if (editRole) {
        const updated = await updateRole(editRole.id, newRoleName, userId);
        if (updated) {
          toast({
            title: "Success",
            description: "Role updated successfully",
          });
          loadRoles();
        }
      } else {
        const created = await createRole(newRoleName, userId);
        if (created) {
          toast({
            title: "Success",
            description: "Role created successfully",
          });
          loadRoles();
        }
      }
      setIsRoleDialogOpen(false);
      setNewRoleName('');
      setEditRole(null);
    } catch (error) {
      console.error("Error saving role:", error);
      toast({
        title: "Error",
        description: "Failed to save role",
        variant: "destructive",
      });
    }
    
    setIsRoleLoading(false);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    setIsRoleLoading(true);
    try {
      const success = await deleteRole(roleToDelete.id, userId);
      if (success) {
        // Remove the deleted role from state immediately
        setRoles(prev => prev.filter(role => role.id !== roleToDelete.id));
        toast({
          title: "Success",
          description: "Role deleted successfully",
        });
        // Also refresh from server to ensure consistency
        setTimeout(() => loadRoles(), 100);
      } else {
        throw new Error("Failed to delete role");
      }
      setRoleToDelete(null);
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: "Failed to delete role. It may be in use.",
        variant: "destructive",
      });
    }
    setIsRoleLoading(false);
  };

  // Cities functions
  const loadCities = async () => {
    setIsCityLoading(true);
    const data = await getCities();
    setCities(data);
    setIsCityLoading(false);
  };

  const handleCitySave = async () => {
    setIsCityLoading(true);
    
    try {
      if (editCity) {
        const updated = await updateCity(editCity.id, newCityName, userId);
        if (updated) {
          toast({
            title: "Success",
            description: "City updated successfully",
          });
          loadCities();
        }
      } else {
        const created = await createCity(newCityName, userId);
        if (created) {
          toast({
            title: "Success",
            description: "City created successfully",
          });
          loadCities();
        }
      }
      setIsCityDialogOpen(false);
      setNewCityName('');
      setEditCity(null);
    } catch (error) {
      console.error("Error saving city:", error);
      toast({
        title: "Error",
        description: "Failed to save city",
        variant: "destructive",
      });
    }
    
    setIsCityLoading(false);
  };

  const handleDeleteCity = async () => {
    if (!cityToDelete) return;
    
    setIsCityLoading(true);
    try {
      const success = await deleteCity(cityToDelete.id, userId);
      if (success) {
        // Remove the deleted city from state immediately
        setCities(prev => prev.filter(city => city.id !== cityToDelete.id));
        toast({
          title: "Success",
          description: "City deleted successfully",
        });
        // Also refresh from server to ensure consistency
        setTimeout(() => loadCities(), 100);
      } else {
        throw new Error("Failed to delete city");
      }
      setCityToDelete(null);
    } catch (error) {
      console.error("Error deleting city:", error);
      toast({
        title: "Error",
        description: "Failed to delete city. It may be in use.",
        variant: "destructive",
      });
    }
    setIsCityLoading(false);
  };

  // Clusters functions
  const loadClusters = async () => {
    setIsClusterLoading(true);
    const data = await getClusters();
    setClusters(data);
    setIsClusterLoading(false);
  };

  const handleClusterSave = async () => {
    setIsClusterLoading(true);
    
    try {
      if (editCluster) {
        const updated = await updateCluster(
          editCluster.id, 
          newClusterName, 
          newClusterCity, 
          userId
        );
        if (updated) {
          toast({
            title: "Success",
            description: "Cluster updated successfully",
          });
          loadClusters();
        }
      } else {
        const created = await createCluster(newClusterName, newClusterCity, userId);
        if (created) {
          toast({
            title: "Success",
            description: "Cluster created successfully",
          });
          loadClusters();
        }
      }
      setIsClusterDialogOpen(false);
      setNewClusterName('');
      setNewClusterCity('');
      setEditCluster(null);
    } catch (error) {
      console.error("Error saving cluster:", error);
      toast({
        title: "Error",
        description: "Failed to save cluster",
        variant: "destructive",
      });
    }
    
    setIsClusterLoading(false);
  };

  const handleDeleteCluster = async () => {
    if (!clusterToDelete) return;
    
    setIsClusterLoading(true);
    try {
      const success = await deleteCluster(clusterToDelete.id, userId);
      if (success) {
        // Remove the deleted cluster from state immediately
        setClusters(prev => prev.filter(cluster => cluster.id !== clusterToDelete.id));
        toast({
          title: "Success",
          description: "Cluster deleted successfully",
        });
        // Also refresh from server to ensure consistency
        setTimeout(() => loadClusters(), 100);
      } else {
        throw new Error("Failed to delete cluster");
      }
      setClusterToDelete(null);
    } catch (error) {
      console.error("Error deleting cluster:", error);
      toast({
        title: "Error",
        description: "Failed to delete cluster. It may be in use.",
        variant: "destructive",
      });
    }
    setIsClusterLoading(false);
  };

  // Audit logs functions
  const loadAuditLogs = async () => {
    setIsAuditLoading(true);
    const data = await getAuditLogs();
    setAuditLogs(data);
    setIsAuditLoading(false);
  };

  // Holidays functions
  const loadHolidays = async () => {
    setIsHolidayLoading(true);
    try {
      const data = await getHolidays();
      setHolidays(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading holidays:", error);
      setHolidays([]);
      toast({
        title: "Error",
        description: "Failed to load holidays",
        variant: "destructive",
      });
    }
    setIsHolidayLoading(false);
  };

  const handleHolidaySave = async () => {
    setIsHolidayLoading(true);
    
    try {
      if (editHoliday) {
        const updated = await updateHoliday(editHoliday.id!, {
          name: newHoliday.name,
          date: newHoliday.date,
          type: newHoliday.type,
          recurring: newHoliday.recurring,
          description: newHoliday.description
        });
        if (updated) {
          toast({
            title: "Success",
            description: "Holiday updated successfully",
          });
          loadHolidays();
        }
      } else {
        const created = await createHoliday({
          name: newHoliday.name!,
          date: newHoliday.date!,
          type: newHoliday.type as 'government' | 'restricted',
          recurring: newHoliday.recurring!,
          description: newHoliday.description
        });
        if (created) {
          toast({
            title: "Success",
            description: "Holiday created successfully",
          });
          loadHolidays();
        }
      }
      setIsHolidayDialogOpen(false);
      setNewHoliday({
        name: '',
        date: '',
        type: 'government',
        recurring: false,
        description: ''
      });
      setEditHoliday(null);
    } catch (error) {
      console.error("Error saving holiday:", error);
      toast({
        title: "Error",
        description: "Failed to save holiday",
        variant: "destructive",
      });
    }
    
    setIsHolidayLoading(false);
  };

  const handleDeleteHoliday = async () => {
    if (!holidayToDelete) return;
    
    setIsHolidayLoading(true);
    try {
      const success = await deleteHoliday(holidayToDelete.id!);
      if (success) {
        setHolidays(prev => prev.filter(holiday => holiday.id !== holidayToDelete.id));
        toast({
          title: "Success",
          description: "Holiday deleted successfully",
        });
        setTimeout(() => loadHolidays(), 100);
      } else {
        throw new Error("Failed to delete holiday");
      }
      setHolidayToDelete(null);
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast({
        title: "Error",
        description: "Failed to delete holiday",
        variant: "destructive",
      });
    }
    setIsHolidayLoading(false);
  };

  const handleBulkUpload = async () => {
    setIsHolidayLoading(true);
    try {
      const result = await bulkUploadHolidays(defaultHolidays2025);
      if (result) {
        toast({
          title: "Success",
          description: result.message,
        });
        loadHolidays();
        setIsBulkUploadDialogOpen(false);
      }
    } catch (error) {
      console.error("Error bulk uploading holidays:", error);
      toast({
        title: "Error",
        description: "Failed to bulk upload holidays",
        variant: "destructive",
      });
    }
    setIsHolidayLoading(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Format changes for display
  const formatChanges = (changes: any): string => {
    try {
      if (typeof changes === 'object') {
        return JSON.stringify(changes, null, 2);
      }
      return String(changes);
    } catch (e) {
      return 'Unable to display changes';
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="clusters">Clusters</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Manage Roles</span>
                  <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setNewRoleName('');
                          setEditRole(null);
                        }}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editRole ? 'Edit Role' : 'Add New Role'}
                        </DialogTitle>
                        <DialogDescription>
                          {editRole 
                            ? 'Update the role details below.' 
                            : 'Enter the details for the new role.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="roleName" className="text-sm font-medium">
                            Role Name
                          </label>
                          <Input
                            id="roleName"
                            placeholder="Enter role name"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsRoleDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleRoleSave} 
                          disabled={!newRoleName.trim() || isRoleLoading}
                        >
                          {isRoleLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editRole ? 'Update Role' : 'Add Role'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  Manage the available roles in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isRoleLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : roles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No roles found</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Get started by adding a new role.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell>{role.name}</TableCell>
                          <TableCell>{formatDate(role.createdAt)}</TableCell>
                          <TableCell>{formatDate(role.updatedAt)}</TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditRole(role);
                                setNewRoleName(role.name);
                                setIsRoleDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the role "{role.name}"? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setRoleToDelete(role);
                                      handleDeleteRole();
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {isRoleLoading && roleToDelete?.id === role.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Manage Cities</span>
                  <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setNewCityName('');
                          setEditCity(null);
                        }}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add City
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editCity ? 'Edit City' : 'Add New City'}
                        </DialogTitle>
                        <DialogDescription>
                          {editCity 
                            ? 'Update the city details below.' 
                            : 'Enter the details for the new city.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="cityName" className="text-sm font-medium">
                            City Name
                          </label>
                          <Input
                            id="cityName"
                            placeholder="Enter city name"
                            value={newCityName}
                            onChange={(e) => setNewCityName(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCityDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCitySave} 
                          disabled={!newCityName.trim() || isCityLoading}
                        >
                          {isCityLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editCity ? 'Update City' : 'Add City'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  Manage the available cities in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isCityLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : cities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No cities found</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Get started by adding a new city.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>City Name</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cities.map((city) => (
                        <TableRow key={city.id}>
                          <TableCell>{city.name}</TableCell>
                          <TableCell>{formatDate(city.createdAt)}</TableCell>
                          <TableCell>{formatDate(city.updatedAt)}</TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditCity(city);
                                setNewCityName(city.name);
                                setIsCityDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete City</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the city "{city.name}"? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setCityToDelete(city);
                                      handleDeleteCity();
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {isCityLoading && cityToDelete?.id === city.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clusters Tab */}
          <TabsContent value="clusters">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Manage Clusters</span>
                  <Dialog open={isClusterDialogOpen} onOpenChange={setIsClusterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setNewClusterName('');
                          setNewClusterCity('');
                          setEditCluster(null);
                        }}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Cluster
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editCluster ? 'Edit Cluster' : 'Add New Cluster'}
                        </DialogTitle>
                        <DialogDescription>
                          {editCluster 
                            ? 'Update the cluster details below.' 
                            : 'Enter the details for the new cluster.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="clusterName" className="text-sm font-medium">
                            Cluster Name
                          </label>
                          <Input
                            id="clusterName"
                            placeholder="Enter cluster name"
                            value={newClusterName}
                            onChange={(e) => setNewClusterName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="city" className="text-sm font-medium">
                            City
                          </label>
                          <Select 
                            value={newClusterCity} 
                            onValueChange={setNewClusterCity}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsClusterDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleClusterSave} 
                          disabled={!newClusterName.trim() || !newClusterCity || isClusterLoading}
                        >
                          {isClusterLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editCluster ? 'Update Cluster' : 'Add Cluster'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  Manage the available clusters in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isClusterLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : clusters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No clusters found</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Get started by adding a new cluster.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cluster Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clusters.map((cluster) => (
                        <TableRow key={cluster.id}>
                          <TableCell>{cluster.name}</TableCell>
                          <TableCell>{cluster.cityName}</TableCell>
                          <TableCell>{formatDate(cluster.createdAt)}</TableCell>
                          <TableCell>{formatDate(cluster.updatedAt)}</TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditCluster(cluster);
                                setNewClusterName(cluster.name);
                                setNewClusterCity(cluster.cityId);
                                setIsClusterDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Cluster</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the cluster "{cluster.name}"? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setClusterToDelete(cluster);
                                      handleDeleteCluster();
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {isClusterLoading && clusterToDelete?.id === cluster.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>
                  View the history of changes to roles, cities, and clusters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAuditLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No audit logs found</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Audit logs will appear here as changes are made.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Changes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(auditLogs) && auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDate(log.createdAt)}</TableCell>
                          <TableCell>{log.userName || log.createdBy}</TableCell>
                          <TableCell className="capitalize">{log.action}</TableCell>
                          <TableCell className="capitalize">{log.entityType}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {formatChanges(log.changes)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={loadAuditLogs}
                  disabled={isAuditLoading}
                >
                  {isAuditLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Refresh Logs
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Holidays Tab */}
          <TabsContent value="holidays">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Holidays Management
                  </span>
                  <div className="space-x-2">
                    <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload 2025 Holidays
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Default Holidays</DialogTitle>
                          <DialogDescription>
                            This will upload all Indian national holidays for 2025. 
                            The following holidays will be added:
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-60 overflow-y-auto">
                          <ul className="space-y-1 text-sm">
                            {defaultHolidays2025.map((holiday, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{holiday.name}</span>
                                <span className="text-gray-500">{holiday.date}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsBulkUploadDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleBulkUpload} disabled={isHolidayLoading}>
                            {isHolidayLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Upload Holidays
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setEditHoliday(null);
                          setNewHoliday({
                            name: '',
                            date: '',
                            type: 'government',
                            recurring: false,
                            description: ''
                          });
                        }}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Holiday
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editHoliday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
                          <DialogDescription>
                            {editHoliday ? 'Update the holiday details.' : 'Create a new holiday for SLA tracking.'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Holiday Name</label>
                            <Input
                              value={newHoliday.name || ''}
                              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                              placeholder="e.g., Independence Day"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Date</label>
                            <Input
                              type="date"
                              value={newHoliday.date || ''}
                              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Type</label>
                            <Select
                              value={newHoliday.type}
                              onValueChange={(value) => setNewHoliday({ ...newHoliday, type: value as 'government' | 'restricted' })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="government">Government Holiday</SelectItem>
                                <SelectItem value="restricted">Restricted Holiday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="recurring"
                              checked={newHoliday.recurring || false}
                              onChange={(e) => setNewHoliday({ ...newHoliday, recurring: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="recurring" className="text-sm font-medium">
                              Recurring Annual Holiday
                            </label>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Description (Optional)</label>
                            <Input
                              value={newHoliday.description || ''}
                              onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                              placeholder="Additional details about the holiday"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsHolidayDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleHolidaySave} disabled={isHolidayLoading}>
                            {isHolidayLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {editHoliday ? 'Update' : 'Create'} Holiday
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
                <CardDescription>
                  Manage holidays for accurate SLA and business hours calculation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isHolidayLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : holidays.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No holidays found</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Add holidays to ensure accurate SLA tracking.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Holiday Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Recurring</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holidays.map((holiday) => (
                        <TableRow key={holiday.id}>
                          <TableCell>{format(new Date(holiday.date), 'dd MMM yyyy')}</TableCell>
                          <TableCell className="font-medium">{holiday.name}</TableCell>
                          <TableCell className="capitalize">{holiday.type}</TableCell>
                          <TableCell>{holiday.recurring ? 'Yes' : 'No'}</TableCell>
                          <TableCell className="max-w-xs truncate">{holiday.description || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditHoliday(holiday);
                                setNewHoliday({
                                  name: holiday.name,
                                  date: holiday.date,
                                  type: holiday.type as 'government' | 'restricted',
                                  recurring: holiday.recurring,
                                  description: holiday.description
                                });
                                setIsHolidayDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setHolidayToDelete(holiday)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{holiday.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteHoliday}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
