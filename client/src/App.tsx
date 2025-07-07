
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RBACProvider } from "@/contexts/RBACContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import DataMigration from "./pages/DataMigration";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Issues from "./pages/admin/Issues";
import IssueDetails from "./pages/admin/IssueDetails";
import AssignedIssues from "./pages/admin/AssignedIssues";
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import AccessControl from "./pages/admin/AccessControl";
import AddDashboardUser from "./pages/admin/dashboard-users/AddDashboardUser";
import FeedbackAnalytics from "./pages/admin/FeedbackAnalytics";



// Mobile pages
import MobileLogin from "./pages/mobile/Login";
import MobileIssues from "./pages/mobile/Issues";
import MobileIssueDetails from "./pages/mobile/IssueDetails";
import MobileNewIssue from "./pages/mobile/NewIssue";
import MobileSentiment from "./pages/mobile/Sentiment";



import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RBACProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Data Migration Route */}
              <Route path="/data-migration" element={<DataMigration />} />
              

              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/issues" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <Issues />
                </ProtectedRoute>
              } />
              <Route path="/admin/issues/:id" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <IssueDetails />
                </ProtectedRoute>
              } />
              <Route path="/admin/assigned-issues" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <AssignedIssues />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="/admin/users/add" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <AddDashboardUser />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard-users/add" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <AddDashboardUser />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/admin/access-control" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <AccessControl />
                </ProtectedRoute>
              } />
              <Route path="/admin/feedback-analytics" element={
                <ProtectedRoute requireUserType="dashboard_user">
                  <FeedbackAnalytics />
                </ProtectedRoute>
              } />



              {/* Mobile Routes */}
              <Route path="/mobile/login" element={<MobileLogin />} />
              <Route path="/mobile/issues" element={
                <ProtectedRoute requireUserType="employee">
                  <MobileIssues />
                </ProtectedRoute>
              } />
              <Route path="/mobile/issues/:id" element={
                <ProtectedRoute requireUserType="employee">
                  <MobileIssueDetails />
                </ProtectedRoute>
              } />
              <Route path="/mobile/issues/new" element={
                <ProtectedRoute requireUserType="employee">
                  <MobileNewIssue />
                </ProtectedRoute>
              } />
              <Route path="/mobile/new-issue" element={
                <ProtectedRoute requireUserType="employee">
                  <MobileNewIssue />
                </ProtectedRoute>
              } />
              <Route path="/mobile/sentiment" element={
                <ProtectedRoute requireUserType="employee">
                  <MobileSentiment />
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RBACProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
