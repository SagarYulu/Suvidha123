import { User } from "@/types";
import { apiClient } from "./apiClient";

// Keep a local cache of users for faster access
let users: User[] = [];

// Function to map API employee to User type
const mapEmployeeToUser = (employee: any): User => {
  return {
    id: employee.id, // Integer ID from PostgreSQL serial
    userId: employee.userId || 0, // Manual numeric ID for internal use
    name: employee.name,
    email: employee.email,
    phone: employee.phone || "",
    employeeId: employee.empId || "",
    city: employee.city || "",
    cluster: employee.cluster || "",
    manager: employee.manager || "",
    role: employee.role || "",
    password: employee.password || "",
    dateOfJoining: employee.dateOfJoining || "",
    bloodGroup: employee.bloodGroup || "",
    dateOfBirth: employee.dateOfBirth || "",
    accountNumber: employee.accountNumber || "",
    ifscCode: employee.ifscCode || ""
  };
};

// Initialize: Load users from API
const initializeUsers = async (): Promise<void> => {
  try {
    const employeesResponse = await apiClient.getEmployees();
    const employees = Array.isArray(employeesResponse) ? employeesResponse : [];
    
    if (employees && employees.length > 0) {
      users = employees.map(mapEmployeeToUser);
      console.log(`Loaded ${users.length} users from API employees table`);
    } else {
      // If no employees in database, initialize with empty array
      console.log("No employees found in database");
      users = [];
    }
  } catch (error) {
    console.error("Error initializing users from API:", error);
  }
};

// Note: Users will be initialized when needed after authentication

export const getUsers = async (): Promise<User[]> => {
  try {
    console.log("Fetching users from API...");
    
    const employeesResponse = await apiClient.getEmployees();
    const employees = Array.isArray(employeesResponse) ? employeesResponse : [];
    
    if (employees && employees.length > 0) {
      console.log(`Successfully fetched ${employees.length} users from database:`, employees);
      
      const mappedUsers = employees.map(mapEmployeeToUser);
      console.log("Mapped users:", mappedUsers);
      
      // Update cache
      users = mappedUsers;
      return mappedUsers;
    }
    
    console.log("No users found in the database");
    return [];
  } catch (error) {
    console.error("Error in getUsers:", error);
    console.error("Falling back to cached users, count:", users.length);
    // Fall back to cached users if there's an error with fetching
    return users;
  }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    console.log(`Getting employee by ID: ${id}`);
    const employee = await apiClient.getEmployeeById(id);
    console.log(`Employee data received:`, employee);
    
    if (employee) {
      const mappedUser = mapEmployeeToUser(employee);
      console.log(`Mapped user:`, mappedUser);
      return mappedUser;
    }
    
    return undefined;
  } catch (error) {
    console.error("Error in getUserById:", error);
    console.error("Error details:", error);
    // Fall back to local cache - convert string id to number for comparison
    const numericId = parseInt(id);
    return users.find(user => user.id === numericId);
  }
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  try {
    const newEmployee = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      empId: user.employeeId,
      city: user.city,
      cluster: user.cluster,
      manager: user.manager,
      role: user.role,
      password: user.password,
      dateOfJoining: user.dateOfJoining,
      dateOfBirth: user.dateOfBirth,
      bloodGroup: user.bloodGroup,
      accountNumber: user.accountNumber,
      ifscCode: user.ifscCode
    };
    
    const employee = await apiClient.createEmployee(newEmployee);
    
    const newUser = mapEmployeeToUser(employee);
    // Update local cache
    users = [...users, newUser];
    
    return newUser;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | undefined> => {
  try {
    // Convert User type to employee API schema
    const employeeUpdate: any = {};
    
    if (userData.name) employeeUpdate.name = userData.name;
    if (userData.email) employeeUpdate.email = userData.email;
    if (userData.phone) employeeUpdate.phone = userData.phone;
    if (userData.employeeId) employeeUpdate.empId = userData.employeeId;
    if (userData.city) employeeUpdate.city = userData.city;
    if (userData.cluster) employeeUpdate.cluster = userData.cluster;
    if (userData.manager) employeeUpdate.manager = userData.manager;
    if (userData.role) employeeUpdate.role = userData.role;
    if (userData.password) employeeUpdate.password = userData.password;
    if (userData.dateOfJoining) employeeUpdate.dateOfJoining = userData.dateOfJoining;
    if (userData.dateOfBirth) employeeUpdate.dateOfBirth = userData.dateOfBirth;
    if (userData.bloodGroup) employeeUpdate.bloodGroup = userData.bloodGroup;
    if (userData.accountNumber) employeeUpdate.accountNumber = userData.accountNumber;
    if (userData.ifscCode) employeeUpdate.ifscCode = userData.ifscCode;
    
    const employee = await apiClient.updateEmployee(id, employeeUpdate);
    
    if (!employee) {
      throw new Error("Failed to update employee");
    }
    
    const updatedUser = mapEmployeeToUser(employee);
    
    // Update local cache
    const numericId = parseInt(id);
    users = users.map(user => {
      if (user.id === numericId) {
        return updatedUser;
      }
      return user;
    });
    
    return updatedUser;
  } catch (error) {
    console.error("Error in updateUser:", error);
    
    // Fall back to in-memory update
    const numericId = parseInt(id);
    users = users.map(user => {
      if (user.id === numericId) {
        return { ...user, ...userData };
      }
      return user;
    });
    
    return users.find(user => user.id === numericId);
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const success = await apiClient.deleteEmployee(id);
    
    if (success) {
      // Update local cache
      users = users.filter(user => user.id !== id);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    
    // Fall back to in-memory delete
    const initialLength = users.length;
    users = users.filter(user => user.id !== id);
    return users.length < initialLength;
  }
};

// Export the users cache for direct access when needed
export const getUsersCache = (): User[] => users;