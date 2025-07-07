import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, UserCheck, Users, ArrowRight } from 'lucide-react';

const UserOnboarding = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout title="User Management" requiredPermission="manage:users">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Create and manage users for your organization</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Add Employee Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Add Employee</CardTitle>
              <CardDescription>
                Create new employee accounts for mobile app access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Mobile app access for employees</li>
                <li>• Issue tracking and reporting</li>
                <li>• Employee profile management</li>
                <li>• Role-based permissions</li>
              </ul>
              <Button 
                onClick={() => navigate('/admin/users/add-employee')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Create Employee Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Add Dashboard User Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-fit">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Add Dashboard User</CardTitle>
              <CardDescription>
                Create admin accounts for dashboard access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Admin dashboard access</li>
                <li>• Issue management and analytics</li>
                <li>• User administration privileges</li>
                <li>• Advanced reporting tools</li>
              </ul>
              <Button 
                onClick={() => navigate('/admin/dashboard-users/add')}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Create Dashboard User
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4 pt-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/users/manage')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Manage Existing Users
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserOnboarding;