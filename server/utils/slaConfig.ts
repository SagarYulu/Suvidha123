export const SLA_CONFIG = {
  critical: {
    responseTime: 1,    // 1 hour
    resolutionTime: 4   // 4 hours
  },
  high: {
    responseTime: 2,    // 2 hours
    resolutionTime: 8   // 8 hours
  },
  medium: {
    responseTime: 4,    // 4 hours
    resolutionTime: 24  // 24 hours
  },
  low: {
    responseTime: 8,    // 8 hours
    resolutionTime: 48  // 48 hours
  }
};