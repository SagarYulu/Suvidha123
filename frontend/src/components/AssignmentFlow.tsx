
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import authenticatedAxios from '@/services/authenticatedAxios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  current_load: number;
}

interface AssignmentFlowProps {
  issueId: string;
  currentAssignee?: string;
  priority: string;
  onAssignmentChange?: (assigneeId: string) => void;
}

export const AssignmentFlow: React.FC<AssignmentFlowProps> = ({
  issueId,
  currentAssignee,
  priority,
  onAssignmentChange
}) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>(currentAssignee || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchAvailableUsers();
  }, [priority]);

  const fetchAvailableUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedAxios.get(`/api/users/available-for-assignment?priority=${priority}`);
      setAvailableUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch available users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignment = async () => {
    if (!selectedAssignee) {
      toast.error('Please select an assignee');
      return;
    }

    setIsAssigning(true);
    try {
      const response = await authenticatedAxios.post(`/api/issues/${issueId}/assign`, {
        assigned_to: selectedAssignee
      });

      toast.success('Issue assigned successfully');
      onAssignmentChange?.(selectedAssignee);
    } catch (error) {
      console.error('Error assigning issue:', error);
      toast.error('Failed to assign issue');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAutoAssign = async () => {
    setIsAssigning(true);
    try {
      const response = await authenticatedAxios.post(`/api/issues/${issueId}/auto-assign`);
      
      const result = response.data;
      if (result.assignee) {
        setSelectedAssignee(result.assignee.id);
        toast.success(`Auto-assigned to ${result.assignee.name}`);
        onAssignmentChange?.(result.assignee.id);
      } else {
        toast.error('No suitable assignee found for auto-assignment');
      }
    } catch (error) {
      console.error('Error auto-assigning issue:', error);
      toast.error('Failed to auto-assign issue');
    } finally {
      setIsAssigning(false);
    }
  };

  const getWorkloadColor = (load: number) => {
    if (load >= 15) return 'text-red-600';
    if (load >= 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Assignment Management
          <Badge className={getPriorityBadgeColor(priority)}>
            {priority} priority
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentAssignee && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Currently assigned to: <strong>{currentAssignee}</strong>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select assignee..." />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({user.role})</span>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Clock className="w-3 h-3" />
                        <span className={`text-xs ${getWorkloadColor(user.current_load)}`}>
                          {user.current_load} issues
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAssignment}
              disabled={!selectedAssignee || isAssigning}
              size="sm"
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-600">
              Or use automatic assignment based on workload and priority
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAutoAssign}
              disabled={isAssigning}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Auto Assign
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {availableUsers.length === 0 && !isLoading && (
          <div className="text-center p-4 text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p>No available users for assignment</p>
            <p className="text-sm">All eligible users may be at capacity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentFlow;
