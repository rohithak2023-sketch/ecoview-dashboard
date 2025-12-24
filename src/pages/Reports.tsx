import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { generateMonthlyData } from '@/lib/mockData';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const Reports = () => {
  const monthlyData = useMemo(() => generateMonthlyData(), []);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const periods = [
    { id: 'week' as const, label: 'Week' },
    { id: 'month' as const, label: 'Month' },
    { id: 'year' as const, label: 'Year' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">
              Analyze your historical energy consumption data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="eco-card p-2 w-fit animate-slide-up">
          <div className="flex gap-1">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  selectedPeriod === period.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Chart */}
        <EnergyChart
          data={monthlyData}
          type="bar"
          dataKey="consumption"
          xAxisKey="month"
          title="Monthly Consumption"
          subtitle="Energy usage per month in kWh"
          className="opacity-0 animate-slide-up delay-100"
          height={350}
        />

        {/* Data Table */}
        <div className="eco-card overflow-hidden opacity-0 animate-slide-up delay-200">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Consumption History</h3>
                <p className="text-sm text-muted-foreground">Monthly breakdown with costs</p>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Consumption (kWh)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthlyData.map((item, index) => {
                  const prevConsumption = index > 0 ? monthlyData[index - 1].consumption : item.consumption;
                  const change = ((item.consumption - prevConsumption) / prevConsumption * 100).toFixed(1);
                  const isPositive = parseFloat(change) >= 0;
                  
                  return (
                    <tr 
                      key={item.month} 
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {item.month} 2024
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {item.consumption.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        ${item.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          isPositive 
                            ? "bg-destructive/10 text-destructive" 
                            : "bg-chart-1/10 text-chart-1"
                        )}>
                          {isPositive ? '+' : ''}{change}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
