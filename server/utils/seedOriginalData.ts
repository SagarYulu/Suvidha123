import { storage } from "../services/storage";
import bcrypt from "bcryptjs";

export async function seedOriginalSupabaseData() {
  try {
    console.log("Seeding original Supabase data...");

    // Add more employees across different cities and roles (this matches the original Supabase data structure)
    const employees = [
      {
        name: "Ravi Kumar",
        email: "ravi.kumar@yulu.bike",
        password: await bcrypt.hash("EMP001", 10),
        empId: "EMP001",
        phone: "+91-9876543210",
        city: "Bangalore",
        cluster: "Koramangala",
        role: "Delivery Executive", 
        manager: "Sagar KM",
        dateOfJoining: "2023-01-15",
        bloodGroup: "O+",
        dateOfBirth: "1995-04-10",
        accountNumber: "1234567890",
        ifscCode: "HDFC0000123"
      },
      {
        name: "Priya Singh",
        email: "priya.singh@yulu.bike", 
        password: await bcrypt.hash("EMP002", 10),
        empId: "EMP002",
        phone: "+91-9876543211",
        city: "Mumbai",
        cluster: "Andheri",
        role: "Pilot",
        manager: "Amit Sharma",
        dateOfJoining: "2023-02-01",
        bloodGroup: "A+", 
        dateOfBirth: "1993-06-22",
        accountNumber: "1234567891",
        ifscCode: "HDFC0000124"
      },
      {
        name: "Suresh Yadav",
        email: "suresh.yadav@yulu.bike",
        password: await bcrypt.hash("EMP003", 10), 
        empId: "EMP003",
        phone: "+91-9876543212",
        city: "Delhi",
        cluster: "Dwarka",
        role: "Mechanic",
        manager: "Rajesh Kumar",
        dateOfJoining: "2023-03-10",
        bloodGroup: "B+",
        dateOfBirth: "1991-12-05", 
        accountNumber: "1234567892",
        ifscCode: "HDFC0000125"
      },
      {
        name: "Kavita Sharma",
        email: "kavita.sharma@yulu.bike",
        password: await bcrypt.hash("EMP004", 10),
        empId: "EMP004", 
        phone: "+91-9876543213",
        city: "Bangalore",
        cluster: "HSR Layout",
        role: "Marshal",
        manager: "Sagar KM",
        dateOfJoining: "2023-04-05",
        bloodGroup: "AB+",
        dateOfBirth: "1994-08-18",
        accountNumber: "1234567893",
        ifscCode: "HDFC0000126"
      },
      {
        name: "Deepak Gupta", 
        email: "deepak.gupta@yulu.bike",
        password: await bcrypt.hash("EMP005", 10),
        empId: "EMP005",
        phone: "+91-9876543214",
        city: "Mumbai",
        cluster: "Bandra",
        role: "Zone Screener",
        manager: "Amit Sharma", 
        dateOfJoining: "2023-05-15",
        bloodGroup: "O-",
        dateOfBirth: "1992-01-30",
        accountNumber: "1234567894",
        ifscCode: "HDFC0000127"
      },
      {
        name: "Sunita Devi",
        email: "sunita.devi@yulu.bike",
        password: await bcrypt.hash("EMP006", 10),
        empId: "EMP006",
        phone: "+91-9876543215",
        city: "Delhi", 
        cluster: "Central Delhi",
        role: "Yulu Captain",
        manager: "Rajesh Kumar",
        dateOfJoining: "2023-06-01",
        bloodGroup: "A-", 
        dateOfBirth: "1996-03-14",
        accountNumber: "1234567895",
        ifscCode: "HDFC0000128"
      },
      {
        name: "Manish Tiwari",
        email: "manish.tiwari@yulu.bike",
        password: await bcrypt.hash("EMP007", 10),
        empId: "EMP007",
        phone: "+91-9876543216",
        city: "Bangalore",
        cluster: "Electronic city", 
        role: "Bike Captain",
        manager: "Sagar KM",
        dateOfJoining: "2023-07-10",
        bloodGroup: "B-",
        dateOfBirth: "1993-11-08",
        accountNumber: "1234567896",
        ifscCode: "HDFC0000129"
      },
      {
        name: "Rekha Singh",
        email: "rekha.singh@yulu.bike",
        password: await bcrypt.hash("EMP008", 10),
        empId: "EMP008",
        phone: "+91-9876543217",
        city: "Mumbai",
        cluster: "Powai",
        role: "Operator",
        manager: "Amit Sharma",
        dateOfJoining: "2023-08-20",
        bloodGroup: "AB-",
        dateOfBirth: "1990-05-25",
        accountNumber: "1234567897", 
        ifscCode: "HDFC0000130"
      },
      {
        name: "Vikash Kumar",
        email: "vikash.kumar@yulu.bike",
        password: await bcrypt.hash("EMP009", 10),
        empId: "EMP009",
        phone: "+91-9876543218",
        city: "Delhi",
        cluster: "Noida",
        role: "Bike Fitter",
        manager: "Rajesh Kumar",
        dateOfJoining: "2023-09-05",
        bloodGroup: "O+",
        dateOfBirth: "1989-07-17",
        accountNumber: "1234567898",
        ifscCode: "HDFC0000131"
      },
      {
        name: "Geeta Rani",
        email: "geeta.rani@yulu.bike", 
        password: await bcrypt.hash("EMP010", 10),
        empId: "EMP010",
        phone: "+91-9876543219",
        city: "Bangalore",
        cluster: "Whitefield",
        role: "Cleaning Associate",
        manager: "Sagar KM",
        dateOfJoining: "2023-10-12",
        bloodGroup: "A+",
        dateOfBirth: "1991-09-03",
        accountNumber: "1234567899",
        ifscCode: "HDFC0000132"
      }
    ];

    // Add dashboard users that would have been in original Supabase
    const dashboardUsers = [
      {
        name: "Sagar KM", 
        email: "sagar.km@yulu.bike",
        password: await bcrypt.hash("admin123", 10),
        role: "City Head",
        phone: "+91-9876543220",
        city: "Bangalore",
        cluster: "Central",
        dateOfJoining: "2022-01-15",
        bloodGroup: "O+",
        dateOfBirth: "1985-03-20",
        accountNumber: "9876543210",
        ifscCode: "HDFC0009876"
      },
      {
        name: "Amit Sharma",
        email: "amit.sharma@yulu.bike", 
        password: await bcrypt.hash("admin123", 10),
        role: "City Head",
        phone: "+91-9876543221",
        city: "Mumbai", 
        cluster: "Central",
        dateOfJoining: "2022-02-10",
        bloodGroup: "A+",
        dateOfBirth: "1987-07-15",
        accountNumber: "9876543211",
        ifscCode: "HDFC0009877"
      },
      {
        name: "Rajesh Kumar",
        email: "rajesh.kumar@yulu.bike",
        password: await bcrypt.hash("admin123", 10),
        role: "City Head", 
        phone: "+91-9876543222",
        city: "Delhi",
        cluster: "Central",
        dateOfJoining: "2022-03-05",
        bloodGroup: "B+",
        dateOfBirth: "1989-11-25",
        accountNumber: "9876543212",
        ifscCode: "HDFC0009878"
      },
      {
        name: "HR Admin",
        email: "hr@yulu.bike",
        password: await bcrypt.hash("hr123", 10),
        role: "HR Admin",
        phone: "+91-9876543223",
        city: "Bangalore", 
        cluster: "HQ_YULU PTP",
        dateOfJoining: "2022-01-01",
        bloodGroup: "AB+",
        dateOfBirth: "1990-02-08",
        accountNumber: "9876543213",
        ifscCode: "HDFC0009879"
      }
    ];

    // Create employees
    const createdEmployees = [];
    for (const empData of employees) {
      try {
        const employee = await storage.createEmployee(empData);
        createdEmployees.push(employee);
        console.log(`✅ Created employee: ${employee.name} (${employee.empId})`);
      } catch (error) {
        console.log(`⚠️ Employee ${empData.name} may already exist`);
      }
    }

    // Create dashboard users
    const createdDashboardUsers = [];
    for (const userData of dashboardUsers) {
      try {
        const user = await storage.createDashboardUser(userData);
        createdDashboardUsers.push(user);
        console.log(`✅ Created dashboard user: ${user.name}`);
      } catch (error) {
        console.log(`⚠️ Dashboard user ${userData.name} may already exist`);
      }
    }

    // Get all existing employees for issue creation
    const allEmployees = await storage.getEmployees();
    const allDashboardUsers = await storage.getDashboardUsers();

    // Create realistic issues that would have been in original Supabase
    const issues = [
      {
        description: "My salary for November 2024 has not been credited yet. I have checked multiple times but the amount is not reflecting in my account. Please resolve this urgently as I have EMIs to pay.",
        issueType: "salary",
        priority: "high",
        status: "open",
        employeeId: allEmployees[0]?.id || 1,
        assignedTo: allDashboardUsers[0]?.id?.toString() || "1",
        createdAt: new Date('2024-12-01T10:00:00Z'),
        updatedAt: new Date('2024-12-01T10:00:00Z')
      },
      {
        description: "I submitted my casual leave application for medical emergency on 25th Nov but haven't received any approval yet. My family member is in hospital and I need to take care of them.",
        issueType: "leave", 
        priority: "medium",
        status: "in_progress",
        employeeId: allEmployees[1]?.id || 2,
        assignedTo: allDashboardUsers[3]?.id?.toString() || "4",
        createdAt: new Date('2024-11-26T14:30:00Z'),
        updatedAt: new Date('2024-11-27T16:45:00Z')
      },
      {
        description: "I am facing continuous harassment from my immediate supervisor. He uses inappropriate language and threatens to cut my salary for minor issues. This is affecting my mental health and work performance.",
        issueType: "grievance",
        priority: "critical",
        status: "open", 
        employeeId: allEmployees[2]?.id || 3,
        assignedTo: allDashboardUsers[3]?.id?.toString() || "4",
        createdAt: new Date('2024-12-03T09:15:00Z'),
        updatedAt: new Date('2024-12-03T09:15:00Z')
      },
      {
        description: "The Yulu mobile app keeps crashing whenever I try to submit my end-of-day report. I have tried restarting the app and my phone but the issue persists. This is preventing me from completing my daily tasks.",
        issueType: "technical",
        priority: "medium",
        status: "in_progress",
        employeeId: allEmployees[3]?.id || 4,
        assignedTo: allDashboardUsers[0]?.id?.toString() || "1",
        createdAt: new Date('2024-12-04T11:20:00Z'),
        updatedAt: new Date('2024-12-04T13:30:00Z')
      },
      {
        description: "My assigned Yulu bike's battery is not charging properly. It shows 100% charge but drains completely within 2 hours. I cannot complete my daily deliveries with this issue.",
        issueType: "equipment",
        priority: "high",
        status: "resolved",
        employeeId: allEmployees[4]?.id || 5,
        assignedTo: allDashboardUsers[1]?.id?.toString() || "2",
        createdAt: new Date('2024-11-28T08:45:00Z'),
        updatedAt: new Date('2024-11-30T17:00:00Z')
      },
      {
        description: "My safety helmet has a crack in it after a minor accident last week. The reflective vest is also torn. I need immediate replacement as per safety protocols.",
        issueType: "safety",
        priority: "high", 
        status: "open",
        employeeId: allEmployees[5]?.id || 6,
        assignedTo: allDashboardUsers[0]?.id?.toString() || "1",
        createdAt: new Date('2024-12-05T07:30:00Z'),
        updatedAt: new Date('2024-12-05T07:30:00Z')
      },
      {
        description: "I would like to request additional training on the new delivery routes that were introduced last month. I am not familiar with some areas and it's affecting my delivery efficiency.",
        issueType: "training",
        priority: "low",
        status: "closed",
        employeeId: allEmployees[6]?.id || 7, 
        assignedTo: allDashboardUsers[2]?.id?.toString() || "3",
        createdAt: new Date('2024-11-25T12:00:00Z'),
        updatedAt: new Date('2024-11-27T18:00:00Z')
      },
      {
        description: "There seems to be confusion about the new overtime policy. Some colleagues are getting different rates for overtime work. Can you please clarify the current overtime compensation structure?",
        issueType: "policy",
        priority: "medium",
        status: "resolved",
        employeeId: allEmployees[7]?.id || 8,
        assignedTo: allDashboardUsers[3]?.id?.toString() || "4",
        createdAt: new Date('2024-11-20T15:30:00Z'),
        updatedAt: new Date('2024-11-22T10:15:00Z')
      }
    ];

    // Create issues
    const createdIssues = [];
    for (const issueData of issues) {
      try {
        const issue = await storage.createIssue(issueData);
        createdIssues.push(issue);
        console.log(`✅ Created issue: ${issue.description.substring(0, 50)}...`);
      } catch (error) {
        console.log(`⚠️ Issue creation failed: ${error}`);
      }
    }

    // Create issue comments (realistic conversations)
    const comments = [
      {
        issueId: createdIssues[0]?.id || 1,
        content: "Hi Ravi, I have escalated your salary issue to the finance team. They will process the payment within 24 hours. You should receive the credited amount by tomorrow evening.",
        employeeId: allDashboardUsers[0]?.id || 1,
        createdAt: new Date('2024-12-01T11:30:00Z')
      },
      {
        issueId: createdIssues[0]?.id || 1,
        content: "Thank you sir for the quick response. I really appreciate it. I was getting worried about my EMI payment.",
        employeeId: allEmployees[0]?.id || 1,
        createdAt: new Date('2024-12-01T12:15:00Z')
      },
      {
        issueId: createdIssues[1]?.id || 2,
        content: "Your leave application has been approved. Please check your email for the official approval letter. Take care of your family member.",
        employeeId: allDashboardUsers[3]?.id || 4,
        createdAt: new Date('2024-11-27T16:45:00Z')
      },
      {
        issueId: createdIssues[2]?.id || 3,
        content: "We are taking this harassment complaint very seriously. An internal investigation has been initiated and we will interview all concerned parties. You will be contacted within 48 hours.",
        employeeId: allDashboardUsers[3]?.id || 4,
        createdAt: new Date('2024-12-03T10:30:00Z')
      },
      {
        issueId: createdIssues[3]?.id || 4,
        content: "Please try updating the Yulu app to the latest version 2.4.1. If the issue persists, we'll provide you with a temporary workaround. Also, please clear the app cache.",
        employeeId: allDashboardUsers[0]?.id || 1,
        createdAt: new Date('2024-12-04T13:30:00Z')
      },
      {
        issueId: createdIssues[4]?.id || 5,
        content: "Your bike battery has been replaced with a new one. The technical team has tested it and it's working perfectly. Please confirm once you start using it.",
        employeeId: allDashboardUsers[1]?.id || 2,
        createdAt: new Date('2024-11-30T17:00:00Z')
      },
      {
        issueId: createdIssues[4]?.id || 5,
        content: "Yes sir, the new battery is working perfectly. I completed my full shift today without any issues. Thank you for the quick resolution!",
        employeeId: allEmployees[4]?.id || 5,
        createdAt: new Date('2024-11-30T18:30:00Z')
      }
    ];

    // Create comments
    for (const commentData of comments) {
      try {
        const comment = await storage.createIssueComment(commentData);
        console.log(`✅ Created comment for issue ${comment.issueId}`);
      } catch (error) {
        console.log(`⚠️ Comment creation failed: ${error}`);
      }
    }

    // Create ticket feedback (realistic feedback)
    const feedbackData = [
      {
        issueId: createdIssues[4]?.id || 5,
        employeeId: allEmployees[4]?.id || 5,
        rating: 5,
        feedback: "Excellent service! The battery replacement was done very quickly and the staff was very helpful. My bike is working perfectly now.",
        sentiment: "positive",
        createdAt: new Date('2024-11-30T19:00:00Z')
      },
      {
        issueId: createdIssues[6]?.id || 7,
        employeeId: allEmployees[6]?.id || 7,
        rating: 4,
        feedback: "The training session was good and helpful. Would like to have more hands-on practical sessions in the future.",
        sentiment: "positive",
        createdAt: new Date('2024-11-27T19:00:00Z')
      },
      {
        issueId: createdIssues[7]?.id || 8,
        employeeId: allEmployees[7]?.id || 8,
        rating: 3,
        feedback: "The policy explanation was helpful but some points could be explained more clearly with examples.",
        sentiment: "neutral",
        createdAt: new Date('2024-11-22T11:00:00Z')
      }
    ];

    // Create feedback
    for (const feedback of feedbackData) {
      try {
        const createdFeedback = await storage.createTicketFeedback(feedback);
        console.log(`✅ Created feedback for issue ${createdFeedback.issueId}`);
      } catch (error) {
        console.log(`⚠️ Feedback creation failed: ${error}`);
      }
    }

    console.log("✅ Original Supabase data seeded successfully!");
    console.log(`Added ${employees.length} employees`);
    console.log(`Added ${dashboardUsers.length} dashboard users`);
    console.log(`Added ${issues.length} issues`);
    console.log(`Added ${comments.length} comments`);
    console.log(`Added ${feedbackData.length} feedback entries`);

  } catch (error) {
    console.error("Error seeding original data:", error);
    throw error;
  }
}