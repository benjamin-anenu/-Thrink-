import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

interface BudgetStepProps {
  onNext: () => void;
  onBack: () => void;
  formData: any;
  updateFormData: (data: any) => void;
}

const BudgetStep: React.FC<BudgetStepProps> = ({
  onNext,
  onBack,
  formData,
  updateFormData
}) => {
  const [budget, setBudget] = useState<number>(formData.budget || 0);
  const [currency, setCurrency] = useState<string>(formData.currency || 'USD');
  const [budgetType, setBudgetType] = useState<string>(formData.budgetType || 'fixed');
  const [budgetNotes, setBudgetNotes] = useState<string>(formData.budgetNotes || '');
  const [costBreakdown, setCostBreakdown] = useState<{
    labor: number;
    materials: number;
    overhead: number;
    contingency: number;
  }>(formData.costBreakdown || {
    labor: 0,
    materials: 0,
    overhead: 0,
    contingency: 0
  });

  const calculateTotal = () => {
    return Object.values(costBreakdown).reduce((sum, cost) => sum + cost, 0);
  };

  const calculateVariance = () => {
    return budget - calculateTotal();
  };

  const getBudgetStatus = () => {
    const variance = calculateVariance();
    if (variance >= 0) return { status: 'under', color: 'text-green-600' };
    return { status: 'over', color: 'text-red-600' };
  };

  const handleCostChange = (category: string, value: number) => {
    setCostBreakdown(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleNext = () => {
    updateFormData({
      ...formData,
      budget,
      currency,
      budgetType,
      budgetNotes,
      costBreakdown,
      totalCost: calculateTotal(),
      budgetVariance: calculateVariance()
    });
    onNext();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBudgetRecommendation = () => {
    const duration = formData.duration || 0;
    const teamSize = formData.teamSize || 0;
    
    if (duration === 0 || teamSize === 0) return 'Complete timeline and resource allocation first';
    
    // Rough estimate: $100/hour per person
    const estimatedCost = duration * teamSize * 8 * 100; // 8 hours per day
    return formatCurrency(estimatedCost);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Project Budget
          </CardTitle>
          <CardDescription>
            Define project budget and cost breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Type and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget Type</Label>
              <Select value={budgetType} onValueChange={setBudgetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Budget</SelectItem>
                  <SelectItem value="flexible">Flexible Budget</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Total Budget */}
          <div className="space-y-2">
            <Label>Total Budget</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className="pl-10"
                placeholder="Enter total budget"
              />
            </div>
          </div>

          {/* Budget Recommendation */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Budget Recommendation</span>
            </div>
            <p className="text-sm text-blue-700">
              Based on your timeline and team size: {getBudgetRecommendation()}
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Cost Breakdown</Label>
            
            <div className="grid gap-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Labor Costs</Label>
                  <p className="text-xs text-muted-foreground">Team salaries and contractor fees</p>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={costBreakdown.labor}
                    onChange={(e) => handleCostChange('labor', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Materials & Equipment</Label>
                  <p className="text-xs text-muted-foreground">Software licenses, hardware, tools</p>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={costBreakdown.materials}
                    onChange={(e) => handleCostChange('materials', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Overhead</Label>
                  <p className="text-xs text-muted-foreground">Office space, utilities, admin costs</p>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={costBreakdown.overhead}
                    onChange={(e) => handleCostChange('overhead', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Contingency</Label>
                  <p className="text-xs text-muted-foreground">Buffer for unexpected costs (10-20%)</p>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={costBreakdown.contingency}
                    onChange={(e) => handleCostChange('contingency', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            {/* Total Cost Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(calculateTotal())}
                </div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(budget)}
                </div>
                <div className="text-sm text-muted-foreground">Budget</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getBudgetStatus().color}`}>
                  {formatCurrency(calculateVariance())}
                </div>
                <div className="text-sm text-muted-foreground">Variance</div>
              </div>
            </div>

            {/* Budget Status */}
            {budget > 0 && (
              <div className={`p-3 border rounded-lg ${
                getBudgetStatus().status === 'under' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {getBudgetStatus().status === 'under' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    getBudgetStatus().status === 'under' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Budget Status: {getBudgetStatus().status === 'under' ? 'Under Budget' : 'Over Budget'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Budget Notes */}
          <div className="space-y-2">
            <Label>Budget Notes</Label>
            <Textarea
              value={budgetNotes}
              onChange={(e) => setBudgetNotes(e.target.value)}
              placeholder="Add any notes about budget constraints, funding sources, or special considerations..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={budget <= 0}
        >
          Next: Review & Submit
        </Button>
      </div>
    </div>
  );
};

export default BudgetStep; 