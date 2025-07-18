import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, RotateCcw, X, Trash2, Upload, Download, Edit, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import EmployeeBulkUpload from '@/components/EmployeeBulkUpload';

// Types for our data
interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  empId: string;          // Employee ID like EMP001
  userId: number;         // Internal User ID (numeric)
  city: string;
  cluster: string;
  manager: string;
  role: string;
  dateOfJoining: string;
  dateOfBirth: string;
  bloodGroup: string;
  accountNumber: string;
  ifscCode: string;
}

interface MasterCity {
  id: number;
  name: string;
}

interface MasterCluster {
  id: number;
  name: string;
  cityId: number;
}

interface MasterRole {
  id: number;
  name: string;
}

// Bulk upload interfaces
interface BulkUploadRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  empId: string;
  city: string;
  cluster: string;
  manager: string;
  role: string;
  dateOfJoining: string;
  dateOfBirth: string;
  bloodGroup: string;
  accountNumber: string;
  ifscCode: string;
  password: string;
  isValid: boolean;
  errors: string[];
  isEditing: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Form schema for adding new users
const addUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  city: z.string().min(1, 'City is required'),
  cluster: z.string().min(1, 'Cluster is required'),
  manager: z.string().min(1, 'Manager is required'),
  role: z.string().min(1, 'Role is required'),
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  bloodGroup: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

const Users = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Master data states
  const [masterCities, setMasterCities] = useState<MasterCity[]>([]);
  const [masterClusters, setMasterClusters] = useState<MasterCluster[]>([]);
  const [masterRoles, setMasterRoles] = useState<MasterRole[]>([]);
  const [filteredClusters, setFilteredClusters] = useState<MasterCluster[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  
  // Bulk upload state
  const [bulkUploadData, setBulkUploadData] = useState<BulkUploadRow[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<'file' | 'validate' | 'edit' | 'confirm'>('file');
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      userId: '',
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      city: '',
      cluster: '',
      manager: '',
      role: '',
      dateOfJoining: '',
      dateOfBirth: '',
      bloodGroup: '',
      accountNumber: '',
      ifscCode: '',
      password: '',
    },
  });

  // Fetch employees data
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response: any = await apiClient.getEmployees();
      const employeeData = response.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone || '',
        empId: emp.empId || `EMP${emp.id.toString().padStart(3, '0')}`,
        userId: emp.userId || 0,
        city: emp.city || '',
        cluster: emp.cluster || '',
        manager: emp.manager || '',
        role: emp.role || '',
        dateOfJoining: emp.dateOfJoining || '',
        dateOfBirth: emp.dateOfBirth || '',
        bloodGroup: emp.bloodGroup || '',
        accountNumber: emp.accountNumber || '',
        ifscCode: emp.ifscCode || '',
      }));
      setEmployees(employeeData);
      setFilteredEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employee data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      const [citiesResponse, clustersResponse, rolesResponse]: any[] = await Promise.all([
        apiClient.getMasterCities(),
        apiClient.getMasterClusters(),
        apiClient.getMasterRoles(),
      ]);
      
      setMasterCities(citiesResponse);
      setMasterClusters(clustersResponse);
      setMasterRoles(rolesResponse);
    } catch (error) {
      console.error('Error fetching master data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch master data',
        variant: 'destructive',
      });
    }
  };

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone.includes(searchTerm)
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  // Handle city change and filter clusters
  const handleCityChange = (cityName: string) => {
    const selectedCity = masterCities.find(city => city.name === cityName);
    if (selectedCity) {
      setSelectedCityId(selectedCity.id);
      const filtered = masterClusters.filter(cluster => cluster.cityId === selectedCity.id);
      setFilteredClusters(filtered);
      // Reset cluster value in form
      form.setValue('cluster', '');
    }
  };

  // Handle form submission
  const onSubmit = async (data: AddUserFormData) => {
    try {
      await apiClient.createEmployee({
        name: data.name,
        email: data.email,
        phone: data.phone,
        empId: data.employeeId,  // Map employeeId to empId for backend schema
        userId: parseInt(data.userId), // Include userId field as integer
        city: data.city,
        cluster: data.cluster,
        manager: data.manager,
        role: data.role,
        dateOfJoining: data.dateOfJoining,
        dateOfBirth: data.dateOfBirth,
        bloodGroup: data.bloodGroup,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        password: data.password,
      });

      toast({
        title: 'Success',
        description: 'User added successfully',
      });

      setIsAddUserModalOpen(false);
      form.reset();
      fetchEmployees();
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: 'Failed to add user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await apiClient.deleteEmployee(userId.toString());
        
        // Delete successful (204 status)
        setEmployees(employees.filter(emp => emp.id !== userId));
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: error.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    }
  };

  // Bulk upload functions
  const downloadTemplate = () => {
    const csvTemplate = `name,email,phone,empId,city,cluster,manager,role,dateOfJoining,dateOfBirth,bloodGroup,accountNumber,ifscCode,password
John Doe,john.doe@yulu.bike,9876543210,EMP999,Bangalore,Koramangala,Manager Name,Mechanic,2024-01-15,1990-05-20,O+,1234567890,SBIN0001234,password123
Jane Smith,jane.smith@yulu.bike,9876543211,EMP998,Mumbai,Andheri,Manager Name,Pilot,2024-01-20,1992-08-15,A+,9876543210,HDFC0001234,password456`;
    
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (csvText: string): BulkUploadRow[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const rows: BulkUploadRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: BulkUploadRow = {
        id: `row-${i}`,
        name: values[0] || '',
        email: values[1] || '',
        phone: values[2] || '',
        empId: values[3] || '',
        city: values[4] || '',
        cluster: values[5] || '',
        manager: values[6] || '',
        role: values[7] || '',
        dateOfJoining: values[8] || '',
        dateOfBirth: values[9] || '',
        bloodGroup: values[10] || '',
        accountNumber: values[11] || '',
        ifscCode: values[12] || '',
        password: values[13] || '',
        isValid: true,
        errors: [],
        isEditing: false,
      };
      
      rows.push(row);
    }
    
    return rows;
  };

  const validateRow = (row: BulkUploadRow): ValidationResult => {
    const errors: string[] = [];
    
    if (!row.name) errors.push('Name is required');
    if (!row.email) errors.push('Email is required');
    if (!row.phone) errors.push('Phone is required');
    if (!row.empId) errors.push('Employee ID is required');
    if (!row.city) errors.push('City is required');
    if (!row.cluster) errors.push('Cluster is required');
    if (!row.manager) errors.push('Manager is required');
    if (!row.role) errors.push('Role is required');
    if (!row.dateOfJoining) errors.push('Date of joining is required');
    if (!row.dateOfBirth) errors.push('Date of birth is required');
    if (!row.password) errors.push('Password is required');
    
    // Email validation
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push('Invalid email format');
    }
    
    // Phone validation
    if (row.phone && !/^\d{10}$/.test(row.phone)) {
      errors.push('Phone must be 10 digits');
    }
    
    // City validation using master data
    if (row.city) {
      const validCity = masterCities.find(c => c.name.toLowerCase() === row.city.toLowerCase());
      if (!validCity) {
        errors.push(`Invalid city: ${row.city}. Valid options are: ${masterCities.map(c => c.name).join(', ')}`);
      }
    }
    
    // Cluster validation using master data 
    if (row.city && row.cluster) {
      const validCity = masterCities.find(c => c.name.toLowerCase() === row.city.toLowerCase());
      if (validCity) {
        const validClusters = masterClusters.filter(cluster => cluster.cityId === validCity.id);
        const isValidCluster = validClusters.some(cluster => cluster.name.toLowerCase() === row.cluster.toLowerCase());
        if (!isValidCluster) {
          const availableClusters = validClusters.map(cluster => cluster.name);
          errors.push(`Invalid cluster: ${row.cluster} for city: ${row.city}. Valid options are: ${availableClusters.join(', ')}`);
        }
      }
    }
    
    // Role validation using master data
    if (row.role) {
      const validRole = masterRoles.find(r => r.name.toLowerCase() === row.role.toLowerCase());
      if (!validRole) {
        errors.push(`Invalid role: ${row.role}. Valid options are: ${masterRoles.map(r => r.name).join(', ')}`);
      }
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/csv') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }
    
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsedData = parseCSV(csvText);
      
      // Validate all rows
      const validatedData = parsedData.map(row => {
        const validation = validateRow(row);
        return {
          ...row,
          isValid: validation.isValid,
          errors: validation.errors,
        };
      });
      
      setBulkUploadData(validatedData);
      setUploadStep('validate');
    };
    reader.readAsText(file);
  };

  const updateRowField = (rowId: string, field: keyof BulkUploadRow, value: string) => {
    setBulkUploadData(prevData => 
      prevData.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value };
          const validation = validateRow(updatedRow);
          return {
            ...updatedRow,
            isValid: validation.isValid,
            errors: validation.errors,
          };
        }
        return row;
      })
    );
  };

  const toggleRowEdit = (rowId: string) => {
    setBulkUploadData(prevData => 
      prevData.map(row => 
        row.id === rowId 
          ? { ...row, isEditing: !row.isEditing }
          : row
      )
    );
  };

  const handleBulkUpload = async () => {
    if (!acceptedDisclaimer) {
      toast({
        title: 'Please accept the disclaimer',
        description: 'You must accept the disclaimer before uploading',
        variant: 'destructive',
      });
      return;
    }
    
    const validRows = bulkUploadData.filter(row => row.isValid);
    if (validRows.length === 0) {
      toast({
        title: 'No valid rows',
        description: 'Please fix all validation errors before uploading',
        variant: 'destructive',
      });
      return;
    }
    
    setBulkUploadLoading(true);
    
    try {
      const employeesData = validRows.map(row => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        empId: row.empId,
        city: row.city,
        cluster: row.cluster,
        manager: row.manager,
        role: row.role,
        dateOfJoining: row.dateOfJoining,
        dateOfBirth: row.dateOfBirth,
        bloodGroup: row.bloodGroup,
        accountNumber: row.accountNumber,
        ifscCode: row.ifscCode,
        password: row.password,
      }));
      
      const response = await apiClient.bulkCreateEmployees(employeesData);
      const result = response as any;
      
      setBulkUploadLoading(false);
      
      toast({
        title: 'Upload completed',
        description: `${result.successCount || 0} employees created successfully${result.errorCount > 0 ? `, ${result.errorCount} failed` : ''}`,
      });
      
      // Reset bulk upload state
      setBulkUploadData([]);
      setCsvFile(null);
      setUploadStep('file');
      setAcceptedDisclaimer(false);
      
      // Refresh employees list
      fetchEmployees();
      
    } catch (error: any) {
      setBulkUploadLoading(false);
      console.error('Error in bulk upload:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload employees. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetBulkUpload = () => {
    setBulkUploadData([]);
    setCsvFile(null);
    setUploadStep('file');
    setAcceptedDisclaimer(false);
    setValidationErrors([]);
  };

  useEffect(() => {
    fetchEmployees();
    fetchMasterData();
  }, []);

  return (
    <AdminLayout title="Users" requiredPermission="manage:users">
      <div className="space-y-4">
        {/* Header with search and actions */}
        <div className="flex items-center justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchEmployees}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh Users
            </Button>
            <Button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.userId}</TableCell>
                    <TableCell>{employee.empId}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{employee.city}</TableCell>
                    <TableCell>{employee.cluster}</TableCell>
                    <TableCell>{employee.manager}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(employee.id, employee.name)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add User Modal */}
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Add New User</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* User ID */}
                      <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User ID *</FormLabel>
                            <FormControl>
                              <Input placeholder="Numeric User ID (e.g. 1001)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Employee ID */}
                      <FormField
                        control={form.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee ID *</FormLabel>
                            <FormControl>
                              <Input placeholder="Employee ID (e.g. YL001)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Full Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* City */}
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleCityChange(value);
                                }}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                                <SelectContent>
                                  {masterCities.map((city) => (
                                    <SelectItem key={city.id} value={city.name}>
                                      {city.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Cluster */}
                      <FormField
                        control={form.control}
                        name="cluster"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cluster</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedCityId ? "Select cluster" : "Select a city first"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredClusters.map((cluster) => (
                                    <SelectItem key={cluster.id} value={cluster.name}>
                                      {cluster.name}
                                    </SelectItem>
                                  ))}
                                  {filteredClusters.length === 0 && selectedCityId && (
                                    <SelectItem value="" disabled>No clusters available for this city</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Manager */}
                      <FormField
                        control={form.control}
                        name="manager"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manager</FormLabel>
                            <FormControl>
                              <Input placeholder="Manager name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Role */}
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role *</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {masterRoles.map((role) => (
                                    <SelectItem key={role.id} value={role.name}>
                                      {role.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Date of Joining */}
                      <FormField
                        control={form.control}
                        name="dateOfJoining"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Joining</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Date of Birth */}
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Blood Group */}
                      <FormField
                        control={form.control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                            <FormControl>
                              <Input placeholder="A+, B-, O+, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Account Number */}
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Account Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* IFSC Code */}
                      <FormField
                        control={form.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IFSC Code</FormLabel>
                            <FormControl>
                              <Input placeholder="IFSC Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Password */}
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddUserModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Add User
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4">
                <EmployeeBulkUpload 
                  onUploadSuccess={() => {
                    setIsAddUserModalOpen(false);
                    fetchEmployees();
                  }}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Users;
