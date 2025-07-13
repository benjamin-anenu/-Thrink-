
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, FileText, Send, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportConfig {
  type: string;
  frequency: string;
  enabled: boolean;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface ReportSchedulerProps {
  onScheduleReport: (config: ReportConfig) => void;
  onDownloadReport: (type: string, dateRange: { start: Date | null; end: Date | null }) => void;
  onSendReport: (type: string, dateRange: { start: Date | null; end: Date | null }) => void;
}

const ReportScheduler: React.FC<ReportSchedulerProps> = ({ onScheduleReport, onDownloadReport, onSendReport }) => {
  const [reportType, setReportType] = useState('');
  const [frequency, setFrequency] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const reportTypes = [
    { value: 'daily-summary', label: 'Daily Summary Report', description: 'Daily progress and key updates' },
    { value: 'weekly-status', label: 'Weekly Status Report', description: 'Weekly progress and milestone updates' },
    { value: 'monthly-review', label: 'Monthly Review Report', description: 'Comprehensive monthly analysis' },
    { value: 'milestone-report', label: 'Milestone Report', description: 'Milestone completion and upcoming targets' },
    { value: 'risk-assessment', label: 'Risk Assessment Report', description: 'Current risks and mitigation strategies' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'milestone', label: 'On Milestone Completion' }
  ];

  const handleSchedule = () => {
    if (reportType && frequency) {
      onScheduleReport({
        type: reportType,
        frequency,
        enabled,
        dateRange: { start: startDate || null, end: endDate || null }
      });
    }
  };

  const handleDownload = () => {
    if (reportType) {
      onDownloadReport(reportType, { start: startDate || null, end: endDate || null });
    }
  };

  const handleSend = () => {
    if (reportType) {
      onSendReport(reportType, { start: startDate || null, end: endDate || null });
    }
  };

  const selectedReportType = reportTypes.find(rt => rt.value === reportType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type..." />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedReportType && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{selectedReportType.description}</p>
            </div>
          )}
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Automation Settings
          </h4>
          
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency..." />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="automation" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="automation">Enable automatic scheduling</Label>
          </div>

          {enabled && frequency && (
            <Badge className="bg-green-100 text-green-800">
              Will run {frequency}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSchedule} disabled={!reportType} className="flex-1">
            <Clock className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
          <Button onClick={handleDownload} variant="outline" disabled={!reportType}>
            <Download className="mr-2 h-4 w-4" />
            Download Now
          </Button>
          <Button onClick={handleSend} variant="outline" disabled={!reportType}>
            <Send className="mr-2 h-4 w-4" />
            Send Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportScheduler;
