
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const MobileIssueCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    type_id: '',
    sub_type_id: ''
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypes = [
    { id: 'payroll', label: 'Payroll Issue' },
    { id: 'technical', label: 'Technical Support' },
    { id: 'hr', label: 'HR Related' },
    { id: 'training', label: 'Training' },
    { id: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + attachments.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }
    
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (!formData.type_id) {
      toast.error('Please select an issue type');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('type_id', formData.type_id);
      formDataToSend.append('sub_type_id', formData.sub_type_id);
      
      attachments.forEach((file, index) => {
        formDataToSend.append(`attachments`, file);
      });

      const response = await fetch('/api/mobile/issues', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Issue created successfully');
        navigate('/mobile/issues');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create issue');
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Create New Issue</h1>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Issue Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Issue Type *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.type_id} onValueChange={(value) => handleInputChange('type_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description *</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* File Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Add Files
                </Button>
                <span className="text-sm text-gray-500">
                  Max 5 files, 10MB each
                </span>
              </div>
              
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !formData.description.trim() || !formData.type_id}
            >
              {isSubmitting ? 'Creating Issue...' : 'Create Issue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileIssueCreate;
