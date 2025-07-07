# Why vite.ts is in the Server Folder

## What is vite.ts?
`vite.ts` is a configuration file that helps the Express server work with Vite (the frontend build tool).

## Why is it in the server folder?
In development mode, the Express server needs to:
1. Serve the React frontend
2. Provide API endpoints
3. Enable hot reload for frontend changes

## How it works:

```
User Browser → Port 5000 → Express Server
                               ↓
                        Uses vite.ts to:
                        - Serve React app
                        - Handle API calls
                        - Enable hot reload
```

## In Simple Terms:
- **Production**: Frontend is built into static files, server just serves them
- **Development**: Server uses vite.ts to run the frontend with live reload

This is a common pattern in modern full-stack JavaScript applications where one server handles both frontend and backend during development.