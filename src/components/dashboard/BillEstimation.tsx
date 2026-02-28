import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { EnergyReading } from '@/types';
import { DollarSign, TrendingUp, Calendar, Zap, AlertTriangle } from 'lucide-react';

interface BillEstimationProps {
  readings: EnergyReading[];
}

export const BillEstimation = ({ readings }: BillEstimationProps) => {
  const [ratePerKwh, setRatePerKwh] = useState(0.12);
  const [billingCycle, setBillingCycle] = useState('30'); // days
  const [monthlyBudget, setMonthlyBudget] = useState(150);

  const estimation = useMemo(() => {
    if (readings.length < 2) {
      return { dailyAvg: 0, projectedMonthly: 0, projectedCost: 0, daysInData: 0, budgetPercent: 0 };
    }

    const sorted = [...readings].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const totalConsumption = sorted.reduce((sum, r) => sum + r.consumption, 0);
    
    // Calculate time span in days
    const firstDate = new Date(sorted[0].timestamp);
    const lastDate = new Date(sorted[sorted.length - 1].timestamp);
    const diffMs = lastDate.getTime() - firstDate.getTime();
    const daysInData = Math.max(diffMs / (1000 * 60 * 60 * 24), 1 / 24); // at least 1 hour

    const dailyAvg = totalConsumption / daysInData;
    const cycleDays = Number(billingCycle);
    const projectedMonthly = dailyAvg * cycleDays;
    const projectedCost = projectedMonthly * ratePerKwh;
    const budgetPercent = monthlyBudget > 0 ? Math.min((projectedCost / monthlyBudget) * 100, 100) : 0;

    return { dailyAvg, projectedMonthly, projectedCost, daysInData, budgetPercent };
  }, [readings, ratePerKwh, billingCycle, monthlyBudget]);

  const isOverBudget = estimation.projectedCost > monthlyBudget;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Bill Estimation & Budget
        </CardTitle>
        <CardDescription>
          Predict your electricity bill based on current usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Rate ($/kWh)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={ratePerKwh}
              onChange={e => setRatePerKwh(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Billing Cycle</Label>
            <Select value={billingCycle} onValueChange={setBillingCycle}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Weekly</SelectItem>
                <SelectItem value="14">Bi-weekly</SelectItem>
                <SelectItem value="30">Monthly</SelectItem>
                <SelectItem value="60">Bi-monthly</SelectItem>
                <SelectItem value="90">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Budget ($)</Label>
            <Input
              type="number"
              min="0"
              value={monthlyBudget}
              onChange={e => setMonthlyBudget(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Projected Bill */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                Daily Average
              </div>
              <p className="text-lg font-bold">{estimation.dailyAvg.toFixed(1)} kWh</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Projected Usage
              </div>
              <p className="text-lg font-bold">{estimation.projectedMonthly.toFixed(0)} kWh</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Estimated Bill
              </div>
              <span className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                ${estimation.projectedCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget Usage</span>
            <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
              {estimation.budgetPercent.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={estimation.budgetPercent} 
            className="h-2.5"
          />
          {isOverBudget && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Projected bill exceeds your budget by ${(estimation.projectedCost - monthlyBudget).toFixed(2)}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Based on {readings.length} readings over {estimation.daysInData < 1 
            ? `${(estimation.daysInData * 24).toFixed(0)} hours` 
            : `${estimation.daysInData.toFixed(1)} days`
          }
        </p>
      </CardContent>
    </Card>
  );
};
