import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Briefcase, Building } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { ResourceFormData } from '../ResourceCreationWizard';

interface BasicInfoStepProps {
  formData: ResourceFormData;
  updateFormData: (updates: Partial<ResourceFormData>) => void;
}

const COMMON_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Product Manager',
  'Project Manager',
  'UX/UI Designer',
  'Data Analyst',
  'Business Analyst',
  'Technical Lead',
  'Architect',
  'Consultant'
];

export function BasicInfoStep({ formData, updateFormData }: BasicInfoStepProps) {
  const { departments, loading: departmentsLoading } = useDepartments();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Enter the basic details for the new resource
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Role *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => updateFormData({ role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select or type a role" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Department *
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => updateFormData({ department: value })}
                disabled={departmentsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={departmentsLoading ? "Loading..." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validation</CardTitle>
          <CardDescription>
            All fields marked with * are required to proceed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {!formData.name && (
              <p className="text-sm text-muted-foreground">• Full name is required</p>
            )}
            {!formData.email && (
              <p className="text-sm text-muted-foreground">• Email address is required</p>
            )}
            {!formData.role && (
              <p className="text-sm text-muted-foreground">• Job role is required</p>
            )}
            {!formData.department && (
              <p className="text-sm text-muted-foreground">• Department is required</p>
            )}
            {formData.name && formData.email && formData.role && formData.department && (
              <p className="text-sm text-green-600">✓ All required fields completed</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}