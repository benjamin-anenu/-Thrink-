
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Users, TrendingUp, Loader2 } from 'lucide-react';
import { useRealSkillsMatrix } from '@/hooks/useRealSkillsMatrix';

const SkillsMatrix = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { skillsData, loading, refreshSkillsData } = useRealSkillsMatrix();

  const filteredSkills = skillsData.filter(skill =>
    skill.skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSkills = skillsData.length;
  const inDemandSkills = skillsData.filter(skill => skill.inDemand).length;
  const averageTeamSize = skillsData.length > 0 
    ? Math.round(skillsData.reduce((acc, skill) => acc + skill.totalPeople, 0) / skillsData.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Skills Matrix</h2>
          <p className="text-muted-foreground">Overview of team skills and capabilities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshSkillsData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh
          </Button>
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading skills data...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Team Members</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead>Avg. Experience</TableHead>
                  <TableHead>Avg. Proficiency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.length > 0 ? (
                  filteredSkills.map((skill) => (
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
                      <TableCell>{skill.avgProficiency}/10</TableCell>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No skills data available. Add resources with skills to see the matrix.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsMatrix;
