import { useState, useEffect } from 'react';
import { Shield, FileText, Activity, Download, Search, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnterprise } from '@/contexts/EnterpriseContext';
import { ComplianceService } from '@/services/ComplianceService';
import { ComplianceLog, DataProcessingActivity } from '@/types/enterprise';
import { toast } from 'sonner';

export function ComplianceDashboard() {
  const { currentWorkspace } = useEnterprise();
  const [logs, setLogs] = useState<ComplianceLog[]>([]);
  const [activities, setActivities] = useState<DataProcessingActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (currentWorkspace) {
      loadComplianceData();
    }
  }, [currentWorkspace]);

  const loadComplianceData = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      const [complianceLogs, processingActivities] = await Promise.all([
        ComplianceService.getComplianceLogs(currentWorkspace.id),
        ComplianceService.getDataProcessingActivities(currentWorkspace.id)
      ]);
      setLogs(complianceLogs);
      setActivities(processingActivities);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!currentWorkspace || !searchTerm.trim()) {
      loadComplianceData();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await ComplianceService.searchComplianceLogs(
        searchTerm,
        currentWorkspace.id,
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setLogs(searchResults);
    } catch (error) {
      console.error('Failed to search compliance logs:', error);
      toast.error('Failed to search compliance logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCompliance = async () => {
    if (!currentWorkspace) return;

    try {
      const blob = await ComplianceService.exportComplianceData(currentWorkspace.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${currentWorkspace.slug}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Compliance report exported successfully');
    } catch (error) {
      console.error('Failed to export compliance data:', error);
      toast.error('Failed to export compliance data');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      data_access: 'bg-blue-100 text-blue-800',
      data_modification: 'bg-orange-100 text-orange-800',
      user_management: 'bg-green-100 text-green-800',
      security: 'bg-red-100 text-red-800',
      compliance: 'bg-purple-100 text-purple-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    totalLogs: logs.length,
    dataAccessEvents: logs.filter(l => l.event_category === 'data_access').length,
    securityEvents: logs.filter(l => l.event_category === 'security').length,
    processingActivities: activities.length,
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please select a workspace to view compliance data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor compliance activities and data processing for {currentWorkspace.name}
          </p>
        </div>
        <Button onClick={handleExportCompliance}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Access</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dataAccessEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.securityEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Processing</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processingActivities}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Compliance Logs</TabsTrigger>
          <TabsTrigger value="activities">Data Processing Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Compliance Event Logs</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="data_access">Data Access</SelectItem>
                        <SelectItem value="data_modification">Data Modification</SelectItem>
                        <SelectItem value="user_management">User Management</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.event_type}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getCategoryColor(log.event_category)}>
                          {log.event_category}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>{log.user_id || 'System'}</TableCell>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Data Processing Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Legal Basis</TableHead>
                    <TableHead>Data Categories</TableHead>
                    <TableHead>Cross Border</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.activity_name}</TableCell>
                      <TableCell>{activity.purpose}</TableCell>
                      <TableCell>{activity.legal_basis}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {activity.data_categories.slice(0, 2).map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {activity.data_categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{activity.data_categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.cross_border_transfers ? "destructive" : "secondary"}>
                          {activity.cross_border_transfers ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.is_active ? "default" : "secondary"}>
                          {activity.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}