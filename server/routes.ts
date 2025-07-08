import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { apiRoutes } from "./routes/index";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount all modular API routes - business logic is properly separated in controllers
  app.use('/api', apiRoutes);

  // Create HTTP server
  const httpServer = createServer(app);
  
  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Extend WebSocket type for custom properties
  interface ExtendedWebSocket extends InstanceType<typeof WebSocket> {
    issueId?: string;
    userId?: string;
  }
  
  // Store active connections by user
  const activeConnections = new Map<string, ExtendedWebSocket>();
  
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');
    const extendedWs = ws as ExtendedWebSocket;
    
    extendedWs.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'authenticate':
            // Authenticate user and store connection
            const { token, userId } = data;
            if (token && userId) {
              activeConnections.set(userId, extendedWs);
              extendedWs.userId = userId;
              extendedWs.send(JSON.stringify({ type: 'authenticated', userId }));
              console.log(`User ${userId} authenticated and connected`);
            }
            break;
            
          case 'join':
            // Join a specific issue room
            const { issueId } = data;
            if (issueId) {
              extendedWs.issueId = issueId;
              extendedWs.send(JSON.stringify({ type: 'joined', issueId }));
            }
            break;
            
          case 'typing':
            // Broadcast typing status to all users in the same issue
            if (extendedWs.issueId && extendedWs.userId) {
              const { isTyping } = data;
              broadcastToIssue(extendedWs.issueId, {
                type: 'userTyping',
                userId: extendedWs.userId,
                isTyping
              }, extendedWs);
            }
            break;
            
          case 'comment':
            // Broadcast new comment to all users in the same issue
            if (extendedWs.issueId) {
              const { comment } = data;
              broadcastToIssue(extendedWs.issueId, {
                type: 'newComment',
                comment
              }, extendedWs);
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    extendedWs.on('close', () => {
      // Remove from active connections
      if (extendedWs.userId) {
        activeConnections.delete(extendedWs.userId);
        console.log(`User ${extendedWs.userId} disconnected`);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Helper function to broadcast to all users in an issue
  function broadcastToIssue(issueId: string, message: any, excludeWs?: ExtendedWebSocket) {
    wss.clients.forEach((client) => {
      const extendedClient = client as ExtendedWebSocket;
      if (extendedClient.readyState === WebSocket.OPEN && 
          extendedClient.issueId === issueId && 
          extendedClient !== excludeWs) {
        extendedClient.send(JSON.stringify(message));
      }
    });
  }
  
  return httpServer;
}