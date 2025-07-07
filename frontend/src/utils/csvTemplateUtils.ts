
/**
 * Generates a CSV template for employee data import
 */
export const getCSVTemplate = () => {
  // Ensure headers match exactly with manual entry form fields and database columns
  const headers = [
    'id',                // UUID (auto-generated, can be left empty)
    'User ID',           // Manual User ID (numeric, required)
    'emp_id',            // Employee ID
    'name',              // Name
    'email',             // Email
    'phone',             // Phone
    'city',              // City
    'cluster',           // Cluster
    'manager',           // Manager
    'role',              // Role
    'date_of_joining',   // Date of Joining
    'date_of_birth',     // Date of Birth
    'blood_group',       // Blood Group
    'account_number',    // Account Number
    'ifsc_code',         // IFSC Code
    'password'           // Password
  ];

  // Ensure the examples use valid roles from ROLE_OPTIONS
  const csvContent = [
    headers.join(','),
    ',1234567,YL001,John Doe,john@yulu.com,9876543210,Bangalore,Koramangala,Jane Smith,Mechanic,01-01-2024,01-01-1990,O+,1234567890,HDFC0001234,changeme123',
    ',2345678,YL002,Jane Smith,jane@yulu.com,9876543211,Delhi,GURGAON,Mark Johnson,Zone Screener,15-02-2024,20-05-1992,A-,9876543210,ICIC0001234,changeme123'
  ].join('\n');

  return csvContent;
};
