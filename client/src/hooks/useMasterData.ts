import { useState, useEffect } from 'react';
import { getRoles, getCities, getClusters } from '@/services/masterDataService';

interface MasterData {
  roles: Array<{ id: string; name: string }>;
  cities: Array<{ id: string; name: string }>;
  clusters: Array<{ id: string; name: string; cityId: string; cityName?: string }>;
  clustersGroupedByCity: { [cityName: string]: Array<{ id: string; name: string }> };
  isLoading: boolean;
  error: string | null;
}

export const useMasterData = () => {
  const [masterData, setMasterData] = useState<MasterData>({
    roles: [],
    cities: [],
    clusters: [],
    clustersGroupedByCity: {},
    isLoading: true,
    error: null,
  });

  const loadMasterData = async () => {
    try {
      setMasterData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [rolesData, citiesData, clustersData] = await Promise.all([
        getRoles(),
        getCities(), 
        getClusters()
      ]);

      // Group clusters by city name for easier lookup
      const clustersGroupedByCity: { [cityName: string]: Array<{ id: string; name: string }> } = {};
      
      clustersData.forEach(cluster => {
        const cityName = cluster.cityName || citiesData.find(city => city.id === cluster.cityId)?.name;
        if (cityName) {
          if (!clustersGroupedByCity[cityName]) {
            clustersGroupedByCity[cityName] = [];
          }
          clustersGroupedByCity[cityName].push({
            id: cluster.id,
            name: cluster.name
          });
        }
      });

      setMasterData({
        roles: rolesData.map(role => ({ id: role.id, name: role.name })),
        cities: citiesData.map(city => ({ id: city.id, name: city.name })),
        clusters: clustersData.map(cluster => ({ 
          id: cluster.id, 
          name: cluster.name, 
          cityId: cluster.cityId,
          cityName: cluster.cityName 
        })),
        clustersGroupedByCity,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading master data:', error);
      setMasterData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load master data' 
      }));
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const refreshMasterData = () => {
    loadMasterData();
  };

  return {
    ...masterData,
    refreshMasterData,
  };
};

// Legacy compatibility functions - gradually migrate to useMasterData hook
export const getRoleOptions = async (): Promise<string[]> => {
  try {
    const roles = await getRoles();
    return roles.map(role => role.name);
  } catch (error) {
    console.error('Error fetching role options:', error);
    // Fallback to hardcoded roles if API fails
    return [
      "Mechanic", "Pilot", "Marshal", "Zone Screener", "Yulu Captain",
      "Bike Captain", "Operator", "Bike Fitter", "Cleaning Associate",
      "Warehouse Associate", "Warehouse Manager", "Inventory Associate",
      "Sales Associate", "Promoter", "Team Leader - rider enablement",
      "Cluster Executive", "Area Incharge", "Quality Check associate",
      "Mobile QC", "Welder", "Admin"
    ];
  }
};

export const getCityOptions = async (): Promise<string[]> => {
  try {
    const cities = await getCities();
    return cities.map(city => city.name);
  } catch (error) {
    console.error('Error fetching city options:', error);
    // Fallback to hardcoded cities if API fails
    return ["Bangalore", "Delhi", "Mumbai"];
  }
};

export const getClusterOptions = async (cityName?: string): Promise<{ [key: string]: string[] }> => {
  try {
    const [cities, clusters] = await Promise.all([getCities(), getClusters()]);
    
    const result: { [key: string]: string[] } = {};
    
    clusters.forEach(cluster => {
      const city = cities.find(c => c.id === cluster.cityId);
      if (city) {
        if (!result[city.name]) {
          result[city.name] = [];
        }
        result[city.name].push(cluster.name);
      }
    });
    
    return cityName ? { [cityName]: result[cityName] || [] } : result;
  } catch (error) {
    console.error('Error fetching cluster options:', error);
    // Fallback to hardcoded clusters if API fails
    return {
      "Delhi": ["Delhi", "GURGAON", "Noida", "Ghaziabad", "Faridabad"],
      "Mumbai": ["Malad", "Andheri", "Chembur", "Powai", "Bandra"],
      "Bangalore": ["Koramangala", "Hebbal", "Jayanagar", "Electronic city", "Whitefield"]
    };
  }
};