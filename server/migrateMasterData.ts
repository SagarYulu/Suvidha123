import { db } from "./db";
import { employees, dashboardUsers, masterCities, masterRoles, masterClusters } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function migrateMasterDataReferences() {
  console.log("Starting master data migration...");
  
  try {
    // Get all master data for lookups
    const cities = await db.select().from(masterCities);
    const roles = await db.select().from(masterRoles);
    const clusters = await db.select().from(masterClusters);
    
    console.log(`Found ${cities.length} cities, ${roles.length} roles, ${clusters.length} clusters`);
    
    // Create lookup maps
    const cityMap = new Map(cities.map(city => [city.name, city.id]));
    const roleMap = new Map(roles.map(role => [role.name, role.id]));
    const clusterMap = new Map(clusters.map(cluster => [cluster.name, cluster.id]));
    
    // Migrate employees table
    console.log("Migrating employees table...");
    const employeesData = await db.select().from(employees);
    
    for (const employee of employeesData) {
      const updates: any = {};
      
      if (employee.city && cityMap.has(employee.city)) {
        updates.cityId = cityMap.get(employee.city);
      }
      
      if (employee.role && roleMap.has(employee.role)) {
        updates.roleId = roleMap.get(employee.role);
      }
      
      if (employee.cluster && clusterMap.has(employee.cluster)) {
        updates.clusterId = clusterMap.get(employee.cluster);
      }
      
      if (Object.keys(updates).length > 0) {
        await db.update(employees)
          .set(updates)
          .where(eq(employees.id, employee.id));
        console.log(`Updated employee ${employee.id} with foreign keys`);
      }
    }
    
    // Migrate dashboard_users table
    console.log("Migrating dashboard_users table...");
    const dashboardUsersData = await db.select().from(dashboardUsers);
    
    for (const user of dashboardUsersData) {
      const updates: any = {};
      
      if (user.city && cityMap.has(user.city)) {
        updates.cityId = cityMap.get(user.city);
      }
      
      if (user.role && roleMap.has(user.role)) {
        updates.roleId = roleMap.get(user.role);
      }
      
      if (user.cluster && clusterMap.has(user.cluster)) {
        updates.clusterId = clusterMap.get(user.cluster);
      }
      
      if (Object.keys(updates).length > 0) {
        await db.update(dashboardUsers)
          .set(updates)
          .where(eq(dashboardUsers.id, user.id));
        console.log(`Updated dashboard user ${user.id} with foreign keys`);
      }
    }
    
    console.log("Master data migration completed successfully!");
    return { success: true, message: "Migration completed" };
    
  } catch (error) {
    console.error("Error during master data migration:", error);
    return { success: false, error: String(error) };
  }
}

// Function to populate missing master data from existing records
export async function populateMasterDataFromExisting() {
  console.log("Populating master data from existing records...");
  
  try {
    // Get unique cities from both tables
    const employeeCities = await db.selectDistinct({ city: employees.city }).from(employees).where(eq(employees.city, employees.city));
    const dashboardUserCities = await db.selectDistinct({ city: dashboardUsers.city }).from(dashboardUsers).where(eq(dashboardUsers.city, dashboardUsers.city));
    
    const allCities = new Set([
      ...employeeCities.map(r => r.city).filter(Boolean),
      ...dashboardUserCities.map(r => r.city).filter(Boolean)
    ]);
    
    // Get unique roles from both tables
    const employeeRoles = await db.selectDistinct({ role: employees.role }).from(employees).where(eq(employees.role, employees.role));
    const dashboardUserRoles = await db.selectDistinct({ role: dashboardUsers.role }).from(dashboardUsers).where(eq(dashboardUsers.role, dashboardUsers.role));
    
    const allRoles = new Set([
      ...employeeRoles.map(r => r.role).filter(Boolean),
      ...dashboardUserRoles.map(r => r.role).filter(Boolean)
    ]);
    
    // Get unique clusters from both tables  
    const employeeClusters = await db.selectDistinct({ cluster: employees.cluster }).from(employees).where(eq(employees.cluster, employees.cluster));
    const dashboardUserClusters = await db.selectDistinct({ cluster: dashboardUsers.cluster }).from(dashboardUsers).where(eq(dashboardUsers.cluster, dashboardUsers.cluster));
    
    const allClusters = new Set([
      ...employeeClusters.map(r => r.cluster).filter(Boolean),
      ...dashboardUserClusters.map(r => r.cluster).filter(Boolean)
    ]);
    
    console.log(`Found ${allCities.size} unique cities, ${allRoles.size} unique roles, ${allClusters.size} unique clusters`);
    
    // Check what already exists in master tables
    const existingCities = await db.select().from(masterCities);
    const existingRoles = await db.select().from(masterRoles);
    const existingClusters = await db.select().from(masterClusters);
    
    const existingCityNames = new Set(existingCities.map(c => c.name));
    const existingRoleNames = new Set(existingRoles.map(r => r.name));
    const existingClusterNames = new Set(existingClusters.map(c => c.name));
    
    // Add missing cities
    Array.from(allCities).forEach(async (cityName) => {
      if (cityName && !existingCityNames.has(cityName)) {
        await db.insert(masterCities).values({ name: cityName });
        console.log(`Added city: ${cityName}`);
      }
    });
    
    // Add missing roles
    Array.from(allRoles).forEach(async (roleName) => {
      if (roleName && !existingRoleNames.has(roleName)) {
        await db.insert(masterRoles).values({ name: roleName });
        console.log(`Added role: ${roleName}`);
      }
    });
    
    // Add missing clusters (assuming they belong to the first city for now)
    const firstCity = existingCities[0];
    if (firstCity) {
      Array.from(allClusters).forEach(async (clusterName) => {
        if (clusterName && !existingClusterNames.has(clusterName)) {
          await db.insert(masterClusters).values({ 
            name: clusterName, 
            cityId: firstCity.id 
          });
          console.log(`Added cluster: ${clusterName} to city: ${firstCity.name}`);
        }
      });
    }
    
    console.log("Master data population completed!");
    return { success: true, message: "Population completed" };
    
  } catch (error) {
    console.error("Error during master data population:", error);
    return { success: false, error: String(error) };
  }
}