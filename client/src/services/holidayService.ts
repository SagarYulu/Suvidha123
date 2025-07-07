import authenticatedAxios from '@/services/authenticatedAxios';

export interface Holiday {
  id?: number;
  name: string;
  date: string;
  type: 'government' | 'restricted';
  recurring: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getHolidays = async (): Promise<Holiday[]> => {
  try {
    const response = await authenticatedAxios.get('/api/holidays');
    return response.data;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
};

export const getHolidaysByYear = async (year: number): Promise<Holiday[]> => {
  try {
    const response = await authenticatedAxios.get(`/api/holidays/year/${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching holidays by year:', error);
    return [];
  }
};

export const createHoliday = async (holiday: Omit<Holiday, 'id' | 'createdAt' | 'updatedAt'>): Promise<Holiday | null> => {
  try {
    const response = await authenticatedAxios.post('/api/holidays', holiday);
    return response.data;
  } catch (error) {
    console.error('Error creating holiday:', error);
    return null;
  }
};

export const updateHoliday = async (id: number, holiday: Partial<Holiday>): Promise<Holiday | null> => {
  try {
    const response = await authenticatedAxios.put(`/api/holidays/${id}`, holiday);
    return response.data;
  } catch (error) {
    console.error('Error updating holiday:', error);
    return null;
  }
};

export const deleteHoliday = async (id: number): Promise<boolean> => {
  try {
    await authenticatedAxios.delete(`/api/holidays/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting holiday:', error);
    return false;
  }
};

export const bulkUploadHolidays = async (holidays: Omit<Holiday, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ message: string; holidays: Holiday[] } | null> => {
  try {
    const response = await authenticatedAxios.post('/api/holidays/bulk', { holidays });
    return response.data;
  } catch (error) {
    console.error('Error bulk uploading holidays:', error);
    return null;
  }
};

// Default holidays for India 2025
export const defaultHolidays2025: Omit<Holiday, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: "New Year's Day", date: "2025-01-01", type: "government", recurring: true, description: "New Year celebration" },
  { name: "Republic Day", date: "2025-01-26", type: "government", recurring: true, description: "India's Republic Day" },
  { name: "Holi", date: "2025-03-14", type: "government", recurring: false, description: "Festival of colors" },
  { name: "Good Friday", date: "2025-04-18", type: "government", recurring: false, description: "Christian holiday" },
  { name: "May Day", date: "2025-05-01", type: "government", recurring: true, description: "International Workers' Day" },
  { name: "Independence Day", date: "2025-08-15", type: "government", recurring: true, description: "India's Independence Day" },
  { name: "Ganesh Chaturthi", date: "2025-08-27", type: "government", recurring: false, description: "Hindu festival" },
  { name: "Gandhi Jayanti", date: "2025-10-02", type: "government", recurring: true, description: "Mahatma Gandhi's birthday" },
  { name: "Dussehra", date: "2025-10-02", type: "government", recurring: false, description: "Hindu festival" },
  { name: "Diwali", date: "2025-10-20", type: "government", recurring: false, description: "Festival of lights" },
  { name: "Christmas", date: "2025-12-25", type: "government", recurring: true, description: "Christian holiday" },
];