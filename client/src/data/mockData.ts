
import { Issue, User } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "1",
    userId: "1001",  // Add userId (numeric string)
    name: "Admin User",
    email: "admin@yulu.com",
    phone: "9876543210",
    employeeId: "YL001",
    city: "Bangalore",
    cluster: "HQ",
    manager: "",
    role: "admin",
    password: "admin123"
  },
  {
    id: "2",
    userId: "1002",  // Add userId (numeric string)
    name: "Rahul Kumar",
    email: "rahul@yulu.com",
    phone: "9876543211",
    employeeId: "YL002",
    city: "Mumbai",
    cluster: "Western",
    manager: "Amit Sharma",
    role: "employee",
    password: "employee123"
  },
  {
    id: "3",
    userId: "1003",  // Add userId (numeric string)
    name: "Priya Singh",
    email: "priya@yulu.com",
    phone: "9876543212",
    employeeId: "YL003",
    city: "Delhi",
    cluster: "Northern",
    manager: "Neha Verma",
    role: "employee",
    password: "employee123"
  }
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: "1",
    employeeUuid: "2",
    typeId: "salary",
    subTypeId: "salary-not-received",
    description: "I haven't received my salary for the month of March 2025.",
    status: "open",
    priority: "high",
    createdAt: "2025-03-28T10:30:00Z",
    updatedAt: "2025-03-28T10:30:00Z",
    assignedTo: "1",
    comments: [
      {
        id: "1",
        employeeUuid: "2",
        content: "Please resolve this urgently as I need to pay my rent.",
        createdAt: "2025-03-28T10:35:00Z",
      }
    ]
  },
  {
    id: "2",
    employeeUuid: "3",
    typeId: "facility",
    subTypeId: "no-water",
    description: "There has been no water in the workshop for the past 3 days.",
    status: "in_progress",
    priority: "medium",
    createdAt: "2025-03-25T09:15:00Z",
    updatedAt: "2025-03-26T11:20:00Z",
    assignedTo: "1",
    comments: [
      {
        id: "2",
        employeeUuid: "3",
        content: "It's becoming difficult to work in these conditions.",
        createdAt: "2025-03-25T09:20:00Z",
      },
      {
        id: "3",
        employeeUuid: "1",
        content: "We've contacted the facility management. They will fix it by tomorrow.",
        createdAt: "2025-03-26T11:20:00Z",
      }
    ]
  }
];
