
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FeedbackFilters } from '@/services/feedbackAnalyticsService';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronDown, BarChartHorizontalBig, BarChart3, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ComparisonMode } from '@/services/feedbackAnalyticsService';
import authenticatedAxios from '@/services/authenticatedAxios';
import { CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";

interface FeedbackFiltersPanelProps {
  filters: FeedbackFilters;
  onFilterChange: (filters: Partial<FeedbackFilters>) => void;
  isComparisonEnabled: boolean;
  onComparisonToggle: (enabled: boolean) => void;
}

const FeedbackFiltersPanel: React.FC<FeedbackFiltersPanelProps> = ({ 
  filters, 
  onFilterChange,
  isComparisonEnabled,
  onComparisonToggle
}) => {
  const [date, setDate] = useState<Date | undefined>(filters.startDate ? new Date(filters.startDate) : undefined);
  const [toDate, setToDate] = useState<Date | undefined>(filters.endDate ? new Date(filters.endDate) : undefined);
  const [open, setOpen] = React.useState(false);
  const [openTo, setOpenTo] = React.useState(false);
  
  // Add state for available agents
  const [agents, setAgents] = useState<{id: string, name: string}[]>([]);
  
  // Fetch agent data
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await authenticatedAxios.get('/api/dashboard-users');
        
        const data = response.data;
        const formattedAgents = data.map((user: any) => ({
          id: String(user.id),
          name: user.name
        }));
        
        setAgents(formattedAgents || []);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        setAgents([]);
      }
    };
    
    fetchAgents();
  }, []);
  
  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
  const formattedToDate = toDate ? format(toDate, 'yyyy-MM-dd') : '';
  
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const formatted = format(newDate, 'yyyy-MM-dd');
      onFilterChange({ startDate: formatted });
    } else {
      onFilterChange({ startDate: undefined });
    }
  };
  
  const handleToDateChange = (newToDate: Date | undefined) => {
    setToDate(newToDate);
    if (newToDate) {
      const formatted = format(newToDate, 'yyyy-MM-dd');
      onFilterChange({ endDate: formatted });
    } else {
      onFilterChange({ endDate: undefined });
    }
  };

  // Add city filter handler
  const handleCityChange = (city: string) => {
    const newCity = city === 'all' ? undefined : city;
    // Reset cluster when city changes
    onFilterChange({
      city: newCity,
      cluster: undefined
    });
  };

  // Add cluster filter handler
  const handleClusterChange = (cluster: string) => {
    const newCluster = cluster === 'all' ? undefined : cluster;
    onFilterChange({ cluster: newCluster });
  };
  
  // Add agent filter handler
  const handleAgentChange = (agentId: string | null) => {
    onFilterChange({
      agentId: agentId === 'all' ? undefined : agentId || undefined,
      // Also update agent name for display purposes
      agentName: agentId === 'all' ? undefined : 
        agents.find(a => a.id === agentId)?.name
    });
  };
  
  const handleComparisonToggle = (checked: boolean) => {
    onComparisonToggle(checked);
  };
  
  const handleComparisonModeChange = (mode: ComparisonMode) => {
    onFilterChange({ comparisonMode: mode });
  };
  
  // Get available clusters based on selected city
  const availableClusters = filters.city && CLUSTER_OPTIONS[filters.city] 
    ? CLUSTER_OPTIONS[filters.city] 
    : [];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Date Range Filter - Now split into two columns */}
          <div className="flex flex-col lg:col-span-2">
            <Label className="mb-2 block">Date Range</Label>
            <div className="flex space-x-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      'w-full justify-start text-left font-normal' +
                      (date ? ' text-foreground' : ' text-muted-foreground')
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formattedDate ? formattedDate : <span>Start date</span>}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('2023-01-01')
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover open={openTo} onOpenChange={setOpenTo}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      'w-full justify-start text-left font-normal' +
                      (toDate ? ' text-foreground' : ' text-muted-foreground')
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formattedToDate ? formattedToDate : <span>End date</span>}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={handleToDateChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('2023-01-01')
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* City Filter */}
          <div>
            <Label htmlFor="city-filter" className="mb-2 block">City</Label>
            <Select 
              value={filters.city || 'all'} 
              onValueChange={handleCityChange}
            >
              <SelectTrigger id="city-filter" className="w-full">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Cities</SelectItem>
                  {CITY_OPTIONS.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Cluster Filter - Restored */}
          <div>
            <Label htmlFor="cluster-filter" className="mb-2 block">Cluster</Label>
            <Select 
              value={filters.cluster || 'all'} 
              onValueChange={handleClusterChange}
              disabled={!filters.city || availableClusters.length === 0}
            >
              <SelectTrigger id="cluster-filter" className="w-full">
                <SelectValue placeholder={filters.city ? "All Clusters" : "Select City First"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Clusters</SelectItem>
                  {availableClusters.map(cluster => (
                    <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Agent Filter */}
          <div>
            <Label htmlFor="agent-filter" className="mb-2 block">Agent</Label>
            <Select 
              value={filters.agentId || 'all'} 
              onValueChange={handleAgentChange}
            >
              <SelectTrigger id="agent-filter" className="w-full">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" /> All Agents
                    </div>
                  </SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Comparison Control */}
          <div>
            <Label htmlFor="comparison-toggle" className="mb-2 block">Enable Comparison</Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="comparison-toggle"
                checked={isComparisonEnabled}
                onCheckedChange={handleComparisonToggle}
              />
              <Select 
                value={filters.comparisonMode || 'none'}
                onValueChange={handleComparisonModeChange}
                disabled={!isComparisonEnabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select comparison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Comparison</SelectItem>
                  <SelectItem value="dod">Day over Day</SelectItem>
                  <SelectItem value="wow">Week over Week</SelectItem>
                  <SelectItem value="mom">Month over Month</SelectItem>
                  <SelectItem value="qoq">Quarter over Quarter</SelectItem>
                  <SelectItem value="yoy">Year over Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackFiltersPanel;
