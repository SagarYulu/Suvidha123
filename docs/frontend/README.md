# Frontend Architecture

## Location
The frontend code is located in the `client/` directory (named "client" for build compatibility, but functions as the FRONTEND).

## Structure
- **React 18** with TypeScript
- **Vite** for development and build
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management

## Key Directories
- `client/src/components/` - Reusable UI components
- `client/src/pages/` - Page components and routes
- `client/src/services/` - API services and data layer
- `client/src/hooks/` - Custom React hooks
- `client/src/contexts/` - React context providers
- `client/src/utils/` - Utility functions and helpers
- `client/src/types/` - TypeScript type definitions

## Development
```bash
npm run dev
```

The frontend runs on port 5000 alongside the backend server.