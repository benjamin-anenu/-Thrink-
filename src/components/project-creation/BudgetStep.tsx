import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Plus, X } from 'lucide-react';

interface BudgetStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const BudgetStep: React.FC<BudgetStepProps> = ({ data, onDataChange }) => {
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '' });

  const expenseCategories = [
    'Personnel', 'Equipment', 'Software', 'Travel', 'Training', 'Consulting', 'Materials', 'Other'
  ];

  const addExpense = () => {
    if (newExpense.category && newExpense.amount) {
      const expenses = data.budget?.expenses || [];
      onDataChange({
        ...data,
        budget: {
          ...data.budget,
          expenses: [...expenses, { ...newExpense, id: Date.now().toString() }]
        }
      });
      setNewExpense({ category: '', amount: '', description: '' });
    }
  };

  const removeExpense = (id: string) => {
    const expenses = data.budget?.expenses || [];
    onDataChange({
      ...data,
      budget: {
        ...data.budget,
        expenses: expenses.filter((expense: any) => expense.id !== id)
      }
    });
  };

  const updateTotalBudget = (value: string) => {
    onDataChange({
      ...data,
      budget: {
        ...data.budget,
        total: value
      }
    });
  };

  const totalExpenses = (data.budget?.expenses || []).reduce((sum: number, expense: any) => {
    return sum + (parseFloat(expense.amount) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Planning
          </CardTitle>
          <CardDescription>
            Define the overall budget and breakdown by expense categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Budget */}
          <div className="space-y-2">
            <Label htmlFor="totalBudget">Total Budget</Label>
            <Input
              id="totalBudget"
              type="number"
              placeholder="Enter total budget amount"
              value={data.budget?.total || ''}
              onChange={(e) => updateTotalBudget(e.target.value)}
            />
          </div>

          {/* Expense Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Budget Breakdown</h3>
            
            {/* Add New Expense */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full p-2 border rounded"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addExpense} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Expense List */}
            <div className="space-y-2">
              {(data.budget?.expenses || []).map((expense: any) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{expense.category}</div>
                    <div className="text-sm text-muted-foreground">{expense.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-medium">${expense.amount}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeExpense(expense.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Allocated:</span>
                <span className="font-bold">${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Total Budget:</span>
                <span className="font-bold">${data.budget?.total || '0'}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <span className="font-medium">Remaining:</span>
                <span className={`font-bold ${
                  (parseFloat(data.budget?.total) || 0) - totalExpenses >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  ${((parseFloat(data.budget?.total) || 0) - totalExpenses).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetStep;