
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/toaster";
import { StrictMode } from 'react';
import { AuthDebugger } from './utils/authDebugger';

// Make debugger available globally in browser console
if (typeof window !== 'undefined') {
  (window as any).AuthDebugger = AuthDebugger;
  console.log('🔍 JWT Debugger loaded! Run AuthDebugger.runFullDiagnostics() in console');
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
