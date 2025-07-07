
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Clock, ArrowUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EscalationRule {
  id: string;
  name: string;
  priority: string;
  escalate_after_hours: number;
  escalate_to_role: string;
  escalate_to_user: string;
  is_active: boolean;
}

interface EscalationPanelProps {
  issueId: string;
  priority: string;
  createdAt: string;
  escalatedAt?: string;
  status: string;
  onEscalationChange?: () => void;
}

export const EscalationPanel: React.FC<EscalationPanelProps> = ({
  issueId,
  priority,
  createdAt,
  escalatedAt,
  status,
  onEscalationChange
}) => {
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<string>('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    fetchEscalationRules();
    calculateTimeRemaining();
  }, [priority, createdAt]);

  useEffect(() => {
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [createdAt]);

  const fetchEscalationRules = async () => {
    try {
      const response = await fetch(`/api/escalation-rules?priority=${priority}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const rules = await response.json();
        setEscalationRules(rules);
      }
    } catch (error) {
      console.error('Error fetching escalation rules:', error);
    }
  };

  const calculateTimeRemaining = () => {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    // Default escalation time based on priority
    const escalationThreshold = getEscalationThreshold(priority);
    const remaining = escalationThreshold - hoursElapsed;
    
    setTimeRemaining(Math.max(0, remaining));
  };

  const getEscalationThreshold = (priority: string): number => {
    switch (priority) {
      case 'critical': return 4; // 4 hours
      case 'high': return 24; // 24 hours
      case 'medium': return 48; // 48 hours
      case 'low': return 72; // 72 hours
      default: return 48;
    }
  };

  const handleManualEscalation = async () => {
    if (!selectedRule) {
      toast.error('Please select an escalation rule');
      return;
    }

    setIsEscalating(true);
    try {
      const response = await fetch(`/api/issues/${issueId}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          escalation_rule_id: selectedRule,
          reason: 'manual_escalation'
        })
      });

      if (response.ok) {
        toast.success('Issue escalated successfully');
        onEscalationChange?.();
      } else {
        toast.error('Failed to escalate issue');
      }
    } catch (error) {
      console.error('Error escalating issue:', error);
      toast.error('Failed to escalate issue');
    } finally {
      setIsEscalating(false);
    }
  };

  const formatTimeRemaining = (hours: number): string => {
    if (hours <= 0) return 'Overdue';
    
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    const minutes = Math.floor((hours % 1) * 60);

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    } else if (remainingHours > 0) {
      return `${remainingHours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getTimeRemainingColor = (hours: number): string => {
    if (hours <= 0) return 'text-red-600';
    if (hours <= 2) return 'text-orange-600';
    if (hours <= 8) return 'text-yellow-600';
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

  const isOverdue = timeRemaining <= 0;
  const isNearingEscalation = timeRemaining <= 2 && timeRemaining > 0;

  return (
    <Card className={`${isOverdue ? 'border-red-300 bg-red-50' : isNearingEscalation ? 'border-yellow-300 bg-yellow-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${isOverdue ? 'text-red-600' : isNearingEscalation ? 'text-yellow-600' : 'text-gray-600'}`} />
          Escalation Management
          <Badge className={getPriorityBadgeColor(priority)}>
            {priority}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Remaining */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Time until escalation:</span>
          </div>
          <span className={`font-semibold ${getTimeRemainingColor(timeRemaining)}`}>
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>

        {/* Escalation Status */}
        {escalatedAt ? (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Escalated on {new Date(escalatedAt).toLocaleString()}
            </span>
          </div>
        ) : isOverdue ? (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">
              This issue is overdue for escalation
            </span>
          </div>
        ) : null}

        {/* Manual Escalation */}
        {status !== 'closed' && status !== 'resolved' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Manual Escalation</h4>
            
            <div className="flex gap-2">
              <Select value={selectedRule} onValueChange={setSelectedRule}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select escalation rule..." />
                </SelectTrigger>
                <SelectContent>
                  {escalationRules.map((rule) => (
                    <SelectItem key={rule.id} value={rule.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{rule.name}</span>
                        <span className="text-xs text-gray-500">
                          Escalate to {rule.escalate_to_role} after {rule.escalate_after_hours}h
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleManualEscalation}
                disabled={!selectedRule || isEscalating}
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowUp className="w-4 h-4" />
                {isEscalating ? 'Escalating...' : 'Escalate'}
              </Button>
            </div>
          </div>
        )}

        {/* Escalation Rules Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p><strong>Auto-escalation rules:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Critical: 4 hours → Manager</li>
            <li>High: 24 hours → Senior Agent</li>
            <li>Medium: 48 hours → Team Lead</li>
            <li>Low: 72 hours → Supervisor</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EscalationPanel;
