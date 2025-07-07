// Centralized JWT configuration
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'FS_Grievance_Management_JWT_Secret_Key_2025_Yulu_Secure_Auth_Token',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};

// Export for backward compatibility
export const JWT_SECRET = JWT_CONFIG.SECRET;
export const JWT_EXPIRES_IN = JWT_CONFIG.EXPIRES_IN;