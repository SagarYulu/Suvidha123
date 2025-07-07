
import { useState, useEffect, memo } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ISSUE_TYPES } from "@/config/issueTypes";
import { CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";
import { IssueFilters } from "@/services/issues/issueFilters";

type FilterBarProps = {
  onFilterChange: (filters: IssueFilters) => void;
  initialFilters?: IssueFilters;
};

// Using memo to prevent unnecessary re-renders
const FilterBar = memo(({ onFilterChange, initialFilters }: FilterBarProps) => {
  // State to track dropdown values
  const [city, setCity] = useState<string | null>(null);
  const [cluster, setCluster] = useState<string | null>(null);
  const [issueType, setIssueType] = useState<string | null>(null);
  
  // Sync component state with parent component filters
  useEffect(() => {
    console.log("FilterBar useEffect - initialFilters:", initialFilters);
    if (initialFilters) {
      console.log("Updating FilterBar state with initialFilters:", initialFilters);
      setCity(initialFilters.city);
      setCluster(initialFilters.cluster);
      setIssueType(initialFilters.issueType);
    }
  }, [initialFilters]);
  
  // Get available clusters based on selected city
  const availableClusters = city && city !== "all" && CLUSTER_OPTIONS[city] 
    ? CLUSTER_OPTIONS[city] 
    : [];

  // Handle city selection - immediately apply the filter
  const handleCityChange = (value: string) => {
    console.log("City changed to:", value);
    const newCity = value === "all" ? null : value;
    setCity(newCity);
    
    // Reset cluster when city changes
    setCluster(null);
    
    // Immediately apply the filter
    onFilterChange({ 
      city: newCity,
      cluster: null, // Reset cluster in filter when city changes
      issueType // Maintain current issue type
    });
  };

  // Handle cluster selection - immediately apply the filter
  const handleClusterChange = (value: string) => {
    console.log("Cluster changed to:", value);
    const newCluster = value === "all" ? null : value;
    setCluster(newCluster);
    
    // Immediately apply the filter
    onFilterChange({ 
      city, // Maintain current city
      cluster: newCluster,
      issueType // Maintain current issue type
    });
  };

  // Handle issue type selection - immediately apply the filter
  const handleIssueTypeChange = (value: string) => {
    console.log("Issue type changed to:", value);
    const newIssueType = value === "all" ? null : value;
    setIssueType(newIssueType);
    
    // Immediately apply the filter
    onFilterChange({ 
      city, // Maintain current city
      cluster, // Maintain current cluster
      issueType: newIssueType
    });
  };

  // IMPORTANT: To fix the UI display of selected filters
  // Get the appropriate select value to display, handling null values properly
  const getSelectValue = (value: string | null): string => {
    const result = value || "all";
    console.log("getSelectValue called with:", value, "returning:", result);
    return result;
  };

  console.log("FilterBar render - current state:", { city, cluster, issueType });
  console.log("City select value:", getSelectValue(city));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-md bg-background">
      <div>
        <Label htmlFor="city-filter" className="mb-1 block">City</Label>
        <Select
          value={getSelectValue(city)}
          onValueChange={handleCityChange}
        >
          <SelectTrigger id="city-filter">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {CITY_OPTIONS.map((cityOption) => (
              <SelectItem key={cityOption} value={cityOption}>
                {cityOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="cluster-filter" className="mb-1 block">Cluster</Label>
        <Select
          value={getSelectValue(cluster)}
          onValueChange={handleClusterChange}
          disabled={!city || city === "all" || availableClusters.length === 0}
        >
          <SelectTrigger id="cluster-filter">
            <SelectValue placeholder={city && city !== "all" ? "All Clusters" : "Select City First"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clusters</SelectItem>
            {availableClusters.map((clusterOption) => (
              <SelectItem key={clusterOption} value={clusterOption}>
                {clusterOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="issue-type-filter" className="mb-1 block">Issue Type</Label>
        <Select
          value={getSelectValue(issueType)}
          onValueChange={handleIssueTypeChange}
        >
          <SelectTrigger id="issue-type-filter">
            <SelectValue placeholder="All Issue Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Issue Types</SelectItem>
            {ISSUE_TYPES.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

// Display name for debugging
FilterBar.displayName = 'FilterBar';

export default FilterBar;
