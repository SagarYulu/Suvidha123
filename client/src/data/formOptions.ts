
// Role options for dashboard users
export const DASHBOARD_USER_ROLES = [
  "City Head",
  "Revenue and Ops Head",
  "CRM",
  "Cluster Head",
  "Payroll Ops",
  "HR Admin",
  "Super Admin"
];

// Role options for employees
export const ROLE_OPTIONS = [
  "Mechanic",
  "Pilot",
  "Marshal",
  "Zone Screener",
  "Yulu Captain",
  "Bike Captain",
  "Operator",
  "Bike Fitter",
  "Cleaning Associate",
  "Warehouse Associate",
  "Warehouse Manager",
  "Inventory Associate",
  "Sales Associate",
  "Promoter",
  "Team Leader - rider enablement",
  "Cluster Executive",
  "Area Incharge",
  "Quality Check associate",
  "Mobile QC",
  "Welder",
  "Admin" // Keeping admin role for administrative access
];

// City options
export const CITY_OPTIONS = [
  "Bangalore",
  "Delhi",
  "Mumbai"
];

// Cluster options mapped by city
export const CLUSTER_OPTIONS: {[key: string]: string[]} = {
  "Delhi": [
    "Delhi",
    "GURGAON",
    "Noida",
    "Ghaziabad",
    "Faridabad",
    "Lakshminagar",
    "Dwarka",
    "South Delhi",
    "North Delhi",
    "Central Delhi"
  ],
  "Mumbai": [
    "Malad",
    "Andheri",
    "Chembur",
    "Powai",
    "Bandra",
    "Sobo",
    "Thane",
    "Navi Mumbai"
  ],
  "Bangalore": [
    "Koramangala",
    "Hebbal",
    "Jayanagar",
    "Electronic city",
    "Whitefield",
    "CBD",
    "ORR",
    "Yelahanka",
    "Indiranagar",
    "HQ_YULU PTP"
  ]
};
