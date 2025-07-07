
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Users, TrendingUp } from 'lucide-react';

interface SkillData {
  skill: string;
  totalPeople: number;
  departments: string[];
  avgExperience: number;
  inDemand: boolean;
}

const SkillsMatrix = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const skillsData: SkillData[] = [
    {
      skill: 'React',
      totalPeople: 8,
      departments: ['Engineering', 'Design'],
      avgExperience: 3.2,
      inDemand: true
    },
    {
      skill: 'TypeScript',
      totalPeople: 6,
      departments: ['Engineering'],
      avgExperience: 2.8,
      inDemand: true
    },
    {
      skill: 'UI/UX',
      totalPeople: 4,
      departments: ['Design', 'Marketing'],
      avgExperience: 4.1,
      inDemand: false
    },
    {
      skill: 'Project Management',
      totalPeople: 5,
      departments: ['Operations', 'Engineering'],
      avgExperience: 5.2,
      inDemand: false
    },
    {
      skill: 'Node.js',
      totalPeople: 5,
      departments: ['Engineering'],
      avgExperience: 3.5,
      inDemand: true
    },
    {
      skill: 'Python',
      totalPeople: 3,
      departments: ['Engineering'],
      avgExperience: 4.0,
      inDemand: true
    },
    {
      skill: 'Figma',
      totalPeople: 6,
      departments: ['Design', 'Marketing'],
      avgExperience: 2.5,
      inDemand: false
    },
    {
      skill: 'SEO',
      totalPeople: 2,
      departments: ['Marketing'],
      avgExperience: 3.8,
      inDemand: false
    }
  ];

  const filteredSkills = skillsData.filter(skill =>
    skill.skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSkills = skillsData.length;
  const inDemandSkills = skillsData.filter(skill => skill.inDemand).length;
  const averageTeamSize = Math.round(skillsData.reduce((acc, skill) => acc + skill.totalPeople, 0) / skillsData.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Skills Matrix</h2>
          <p className="text-muted-foreground">Overview of team skills and capabilities</p>
        </div>
        <Button variant="outline">
          <Filter size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Skills Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalSkills}</div>
                <p className="text-xs text-muted-foreground">Total Skills</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-500">{inDemandSkills}</div>
                <p className="text-xs text-muted-foreground">In High Demand</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-500">{averageTeamSize}</div>
                <p className="text-xs text-muted-foreground">Avg. Team Size</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Skills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Team Members</TableHead>
                <TableHead>Departments</TableHead>
                <TableHead>Avg. Experience</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSkills.map((skill) => (
                <TableRow key={skill.skill}>
                  <TableCell className="font-medium">{skill.skill}</TableCell>
                  <TableCell>{skill.totalPeople}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {skill.departments.map(dept => (
                        <Badge key={dept} variant="outline" className="text-xs">
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{skill.avgExperience} years</TableCell>
                  <TableCell>
                    {skill.inDemand ? (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                        High Demand
                      </Badge>
                    ) : (
                      <Badge variant="outline">Stable</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsMatrix;
