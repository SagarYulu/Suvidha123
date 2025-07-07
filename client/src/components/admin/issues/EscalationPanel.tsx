
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Clock, ArrowUp, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import authenticatedAxios from '@/services/authenticatedAxios';

interface EscalationHistory {
  id: string;
  escalated_at: string;
  escalation_level: number;
  escalated_by: string;
  reason?: string;
  escalated_to?: string;
}

interface EscalationRule {
  id: string;
  role: string;
  time_threshold_minutes: number;
  escalation_level: number;
  notify_to: string;
}

interface EscalationPanelProps {
  issueId: string;
  currentStatus: string;
  currentLevel?: number;
  escalatedAt?: string;
  priority: string;
  createdAt: string;
  onEscalationChange?: () => void;
}

export const EscalationPanel: React.FC<EscalationPanelProps> = ({
  issueId,
  currentStatus,
  currentLevel = 0,
  escalatedAt,
  priority,
  createdAt,
  onEscalationChange
}) => {
  const { authState } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [escalationHistory, setEscalationHistory] = useState<EscalationHistory[]>([]);
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [selectedRule, setSelectedRule] = useState<string>('');
  const [escalationReason, setEscalationReason] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Role-based access control
  const canManageEscalations = authState.role && ['admin', 'Super Admin', 'CRM', 'City Head', 'Revenue and Ops Head'].includes(authState.role);

  useEffect(() => {
    if (isExpanded) {
      fetchEscalationData();
    }
    calculateTimeRemaining();
  }, [isExpanded, issueId]);

  useEffect(() => {
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [createdAt, escalatedAt]);

  const fetchEscalationData = async () => {
    setIsLoading(true);
    try {
      // Fetch escalation history
      const historyResponse = await authenticatedAxios.get(`/api/escalations/${issueId}/history`);
      setEscalationHistory(historyResponse.data.data || []);

      // Fetch escalation rules
      const rulesResponse = await authenticatedAxios.get('/api/api/escalations/rules');
      setEscalationRules(rulesResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching escalation data:', error);
      toast.error('Failed to load escalation data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTimeRemaining = () => {
    const now = new Date();
    const created = new Date(createdAt);
    const escalated = escalatedAt ? new Date(escalatedAt) : null;
    
    // Use escalated time if available, otherwise creation time
    const baseTime = escalated || created;
    const hoursElapsed = (now.getTime() - baseTime.getTime()) / (1000 * 60 * 60);
    
    // Get escalation threshold based on priority
    const threshold = getEscalationThreshold(priority);
    const remaining = threshold - hoursElapsed;
    
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
    if (!selectedRule || !escalationReason.trim()) {
      toast.error('Please select an escalation rule and provide a reason');
      return;
    }

    setIsEscalating(true);
    try {
      const response = await authenticatedAxios.post(`/api/escalations/${issueId}/escalate`, {
        escalation_rule_id: selectedRule,
        reason: escalationReason,
        escalate_to: 'manual'
      });
      
      toast.success('Issue escalated successfully');
      setEscalationReason('');
      setSelectedRule('');
      fetchEscalationData();
      onEscalationChange?.();
    } catch (error) {
      console.error('Error escalating issue:', error);
      toast.error('Failed to escalate issue');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleDeEscalation = async () => {
    try {
      const response = await authenticatedAxios.post(`/api/escalations/${issueId}/de-escalate`, {
        reason: 'Manual de-escalation'
      });

      toast.success('Issue de-escalated successfully');
      fetchEscalationData();
      onEscalationChange?.();
    } catch (error) {
      console.error('Error de-escalating issue:', error);
      toast.error('Failed to de-escalate issue');
    }
  };

  const getEscalationLevelBadge = (level: number) => {
    if (level === 0) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Not Escalated</Badge>;
    } else if (level === 1) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Level 1</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Level 2</Badge>;
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

  const isOverdue = timeRemaining <= 0;
  const isNearingEscalation = timeRemaining <= 2 && timeRemaining > 0;

  return (
    <Card 
      className={`${isOverdue ? 'border-red-300 bg-red-50' : isNearingEscalation ? 'border-yellow-300 bg-yellow-50' : ''}`}
      data-testid="escalation-panel"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className={`w-5 h-5 ${isOverdue ? 'text-red-600' : isNearingEscalation ? 'text-yellow-600' : 'text-gray-600'}`} />
            Escalation Management
            {getEscalationLevelBadge(currentLevel)}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
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

          {/* Current Status */}
          {escalatedAt && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Escalated on {new Date(escalatedAt).toLocaleString()}
              </span>
            </div>
          )}

          {/* Overdue Warning */}
          {isOverdue && currentLevel === 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">
                This issue is overdue for escalation
              </span>
            </div>
          )}

          {/* Manual Escalation Controls */}
          {canManageEscalations && currentStatus !== 'closed' && currentStatus !== 'resolved' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Manual Escalation</h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="escalation-rule">Escalation Rule</Label>
                  <Select value={selectedRule} onValueChange={setSelectedRule}>
                    <SelectTrigger id="escalation-rule">
                      <SelectValue placeholder="Select escalation rule..." />
                    </SelectTrigger>
                    <SelectContent>
                      {escalationRules.map((rule) => (
                        <SelectItem key={rule.id} value={rule.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{rule.role}</span>
                            <span className="text-xs text-gray-500">
                              Level {rule.escalation_level} → {rule.notify_to}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="escalation-reason">Reason for Escalation</Label>
                  <Textarea
                    id="escalation-reason"
                    placeholder="Provide a reason for escalation..."
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        disabled={!selectedRule || !escalationReason.trim() || isEscalating}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ArrowUp className="w-4 h-4" />
                        Escalate Issue
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Escalation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to escalate this issue? This action will notify the relevant stakeholders and update the issue priority.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleManualEscalation} disabled={isEscalating}>
                          {isEscalating ? 'Escalating...' : 'Confirm Escalation'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {currentLevel > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          De-escalate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm De-escalation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to de-escalate this issue? This will reduce the escalation level.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeEscalation}>
                            Confirm De-escalation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Escalation History */}
          {escalationHistory.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Escalation History</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {escalationHistory.map((history) => (
                  <div key={history.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <span className="font-medium">Level {history.escalation_level}</span>
                      {history.reason && <span className="text-gray-600"> - {history.reason}</span>}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(history.escalated_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escalation Rules Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>Auto-escalation rules:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Critical: 4 hours → Manager</li>
              <li>High: 24 hours → Senior Agent</li>
              <li>Medium: 48 hours → Team Lead</li>
              <li>Low: 72 hours → Supervisor</li>
            </ul>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default EscalationPanel;
