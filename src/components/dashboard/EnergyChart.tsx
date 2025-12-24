import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';

interface ChartProps {
  data: any[];
  type?: 'area' | 'bar';
  dataKey: string;
  xAxisKey: string;
  title: string;
  subtitle?: string;
  className?: string;
  height?: number;
  showSecondary?: boolean;
  secondaryKey?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="eco-card-elevated px-4 py-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()} kWh</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const EnergyChart = ({
  data,
  type = 'area',
  dataKey,
  xAxisKey,
  title,
  subtitle,
  className,
  height = 300,
  showSecondary = false,
  secondaryKey,
}: ChartProps) => {
  return (
    <div className={cn("eco-card p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              name="Consumption"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorConsumption)"
            />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey={dataKey} 
              name="Consumption"
              fill="hsl(var(--chart-1))" 
              radius={[4, 4, 0, 0]}
            />
            {showSecondary && secondaryKey && (
              <Bar 
                dataKey={secondaryKey} 
                name="Peak"
                fill="hsl(var(--chart-3))" 
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
