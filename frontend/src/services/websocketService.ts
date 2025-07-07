/**
 * WebSocket service for real-time chat updates in the issue management system
 */

interface ExtendedWebSocket extends WebSocket {
  issueId?: string;
}

export interface WebSocketMessage {
  type: 'authenticate' | 'join_issue' | 'new_comment' | 'status_change' | 'typing' | 
        'comment_added' | 'status_updated' | 'typing_indicator' | 'authenticated';
  userId?: string;
  token?: string;
  issueId?: string;
  comment?: any;
  status?: string;
  isTyping?: boolean;
  userName?: string;
  typingIssueId?: string;
  timestamp?: Date;
}

class WebSocketService {
  private ws: ExtendedWebSocket | null = null;
  private currentIssueId: string | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, (data: any) => void>();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl) as ExtendedWebSocket;
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.authenticate();
        
        // Rejoin current issue if any
        if (this.currentIssueId) {
          this.joinIssue(this.currentIssueId);
        }
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private authenticate() {
    const token = localStorage.getItem('authToken');
    const authState = localStorage.getItem('authState');
    
    if (token && authState) {
      try {
        const parsedAuthState = JSON.parse(authState);
        this.userId = parsedAuthState.user?.id?.toString();
        
        if (this.userId) {
          this.send({
            type: 'authenticate',
            token,
            userId: this.userId
          });
        }
      } catch (error) {
        console.error('Error parsing auth state:', error);
      }
    }
  }

  private handleMessage(data: WebSocketMessage) {
    switch (data.type) {
      case 'authenticated':
        console.log('WebSocket authenticated successfully');
        break;
        
      case 'comment_added':
        this.notifyHandlers('comment_added', data);
        break;
        
      case 'status_updated':
        this.notifyHandlers('status_updated', data);
        break;
        
      case 'typing_indicator':
        this.notifyHandlers('typing_indicator', data);
        break;
    }
  }

  private notifyHandlers(type: string, data: any) {
    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data);
    }
  }

  private send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  // Public methods
  public joinIssue(issueId: string) {
    this.currentIssueId = issueId;
    this.send({
      type: 'join_issue',
      issueId
    });
  }

  public leaveIssue() {
    this.currentIssueId = null;
  }

  public sendComment(comment: any, issueId: string) {
    this.send({
      type: 'new_comment',
      comment,
      issueId
    });
  }

  public sendStatusChange(status: string, issueId: string) {
    this.send({
      type: 'status_change',
      status,
      issueId
    });
  }

  public sendTyping(isTyping: boolean, userName: string, issueId: string) {
    this.send({
      type: 'typing',
      isTyping,
      userName,
      typingIssueId: issueId
    });
  }

  public onCommentAdded(handler: (data: any) => void) {
    this.messageHandlers.set('comment_added', handler);
  }

  public onStatusUpdated(handler: (data: any) => void) {
    this.messageHandlers.set('status_updated', handler);
  }

  public onTyping(handler: (data: any) => void) {
    this.messageHandlers.set('typing_indicator', handler);
  }

  public removeHandler(type: string) {
    this.messageHandlers.delete(type);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();