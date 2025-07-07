
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, Building, Calendar, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emp_id: string;
  role: string;
  city?: string;
  cluster?: string;
  date_of_joining?: string;
  date_of_birth?: string;
  manager?: string;
}

const MobileProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mobile/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setEditedProfile(profileData);
      } else {
        toast.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/mobile/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(editedProfile)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      case 'recruiter': return 'bg-purple-100 text-purple-800';
      case 'trainer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Profile not found</p>
          <Button onClick={() => navigate(-1)} className="mt-2">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">My Profile</h1>
          </div>
          
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                {isEditing ? (
                  <Input
                    value={editedProfile.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Employee ID</label>
                <p className="mt-1 text-gray-900 font-mono">{profile.emp_id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1">
                  <Badge className={getRoleBadgeColor(profile.role)}>
                    {profile.role}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{profile.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              {isEditing ? (
                <Input
                  value={editedProfile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{profile.phone || 'Not provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <p className="mt-1 text-gray-900">{profile.city || 'Not provided'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Cluster</label>
              <p className="mt-1 text-gray-900">{profile.cluster || 'Not provided'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Manager</label>
              <p className="mt-1 text-gray-900">{profile.manager || 'Not assigned'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-gray-900">{formatDate(profile.date_of_birth)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Date of Joining</label>
              <p className="mt-1 text-gray-900">{formatDate(profile.date_of_joining)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                localStorage.removeItem('authToken');
                navigate('/mobile/login');
              }}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileProfile;
