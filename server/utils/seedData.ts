import { storage } from "../services/storage";

export async function seedDatabase() {
  try {
    console.log("Seeding database with demo data...");

    // Create demo dashboard users
    const adminUser = await storage.createDashboardUser({
      name: "Admin User",
      email: "admin@yulu.com",
      password: "admin123",
      role: "admin",
      phone: "+91-9876543210",
      city: "Bangalore",
      cluster: "Central"
    });

    const hrAdmin = await storage.createDashboardUser({
      name: "HR Admin",
      email: "hr@yulu.com", 
      password: "hr123",
      role: "HR Admin",
      phone: "+91-9876543211",
      city: "Bangalore",
      cluster: "South"
    });

    // Create demo employees
    const employee1 = await storage.createEmployee({
      name: "Raj Kumar",
      email: "raj.kumar@yulu.bike",
      password: "EMP001",
      empId: "EMP001",
      phone: "+91-9876543212",
      city: "Bangalore",
      cluster: "Central",
      role: "employee",
      manager: "John Doe",
      dateOfJoining: "2023-01-15",
      bloodGroup: "B+",
      dateOfBirth: "1990-05-20"
    });

    const employee2 = await storage.createEmployee({
      name: "Priya Singh",
      email: "priya.singh@yulu.bike", 
      password: "EMP002",
      empId: "EMP002",
      phone: "+91-9876543213",
      city: "Delhi",
      cluster: "North",
      role: "employee",
      manager: "Jane Smith",
      dateOfJoining: "2023-03-10",
      bloodGroup: "O+",
      dateOfBirth: "1992-08-15"
    });

    // Create demo issues
    const issue1 = await storage.createIssue({
      description: "Salary not credited for the month of December",
      status: "open",
      priority: "high",
      typeId: "salary",
      subTypeId: "delay",
      employeeId: employee1.id,
      assignedTo: hrAdmin.id
    });

    const issue2 = await storage.createIssue({
      description: "PF account number update required",
      status: "in_progress", 
      priority: "medium",
      typeId: "pf",
      subTypeId: "update",
      employeeId: employee2.id,
      assignedTo: hrAdmin.id
    });

    // Create demo comments
    await storage.createIssueComment({
      issueId: issue1.id,
      content: "Looking into the salary credit issue. Will update within 24 hours.",
      employeeId: hrAdmin.id
    });

    await storage.createIssueComment({
      issueId: issue2.id,
      content: "Please provide the new PF account number details.",
      employeeId: hrAdmin.id
    });

    await storage.createIssueComment({
      issueId: issue2.id,
      content: "My new PF account number is 123456789012",
      employeeId: employee2.id
    });

    console.log("✅ Database seeded successfully with demo data");
    return {
      dashboardUsers: [adminUser, hrAdmin],
      employees: [employee1, employee2],
      issues: [issue1, issue2]
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}