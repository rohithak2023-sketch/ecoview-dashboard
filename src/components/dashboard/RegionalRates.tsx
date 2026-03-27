import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ElectricityRegion {
  id: string;
  name: string;
  currency: string;
  symbol: string;
  ratePerKwh: number;
  peakRate?: number;
  offPeakRate?: number;
}

export const REGIONS: ElectricityRegion[] = [
  { id: 'us', name: 'United States', currency: 'USD', symbol: '$', ratePerKwh: 0.16, peakRate: 0.22, offPeakRate: 0.10 },
  { id: 'in', name: 'India', currency: 'INR', symbol: '₹', ratePerKwh: 8.0, peakRate: 10.0, offPeakRate: 6.0 },
  { id: 'uk', name: 'United Kingdom', currency: 'GBP', symbol: '£', ratePerKwh: 0.28, peakRate: 0.35, offPeakRate: 0.20 },
  { id: 'eu', name: 'Europe (avg)', currency: 'EUR', symbol: '€', ratePerKwh: 0.25, peakRate: 0.32, offPeakRate: 0.18 },
  { id: 'au', name: 'Australia', currency: 'AUD', symbol: 'A$', ratePerKwh: 0.30, peakRate: 0.42, offPeakRate: 0.22 },
  { id: 'ca', name: 'Canada', currency: 'CAD', symbol: 'C$', ratePerKwh: 0.13, peakRate: 0.18, offPeakRate: 0.09 },
  { id: 'jp', name: 'Japan', currency: 'JPY', symbol: '¥', ratePerKwh: 31.0, peakRate: 40.0, offPeakRate: 22.0 },
  { id: 'de', name: 'Germany', currency: 'EUR', symbol: '€', ratePerKwh: 0.37, peakRate: 0.45, offPeakRate: 0.28 },
  { id: 'custom', name: 'Custom', currency: 'USD', symbol: '$', ratePerKwh: 0.12 },
];

const STORAGE_KEY = 'electricity_region';

export const useElectricityRate = () => {
  const [regionId, setRegionId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.regionId || 'us';
      }
    } catch { /* ignore */ }
    return 'us';
  });

  const [customRate, setCustomRate] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.customRate || 0.12;
      }
    } catch { /* ignore */ }
    return 0.12;
  });

  const [customSymbol, setCustomSymbol] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.customSymbol || '$';
      }
    } catch { /* ignore */ }
    return '$';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ regionId, customRate, customSymbol }));
  }, [regionId, customRate, customSymbol]);

  const region = REGIONS.find(r => r.id === regionId) || REGIONS[0];
  const ratePerKwh = regionId === 'custom' ? customRate : region.ratePerKwh;
  const symbol = regionId === 'custom' ? customSymbol : region.symbol;

  const formatCost = (cost: number) => `${symbol}${cost.toFixed(2)}`;

  return { regionId, setRegionId, customRate, setCustomRate, customSymbol, setCustomSymbol, region, ratePerKwh, symbol, formatCost };
};

interface RegionalRatesProps {
  regionId: string;
  onRegionChange: (id: string) => void;
  customRate: number;
  onCustomRateChange: (rate: number) => void;
  customSymbol: string;
  onCustomSymbolChange: (s: string) => void;
}

export const RegionalRates = ({
  regionId, onRegionChange, customRate, onCustomRateChange, customSymbol, onCustomSymbolChange,
}: RegionalRatesProps) => {
  const region = REGIONS.find(r => r.id === regionId) || REGIONS[0];
  const isCustom = regionId === 'custom';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-5 w-5 text-primary" />
          Electricity Rates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Region</Label>
          <Select value={regionId} onValueChange={onRegionChange}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map(r => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name} {r.id !== 'custom' ? `(${r.symbol}${r.ratePerKwh}/kWh)` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isCustom ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rate per kWh</Label>
              <Input type="number" step="0.01" min="0" value={customRate} onChange={e => onCustomRateChange(Number(e.target.value))} className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Currency Symbol</Label>
              <Input value={customSymbol} onChange={e => onCustomSymbolChange(e.target.value)} className="h-8 text-sm" maxLength={3} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50 border border-border">
              <p className="text-[10px] text-muted-foreground">Standard</p>
              <p className="text-sm font-bold text-foreground">{region.symbol}{region.ratePerKwh}</p>
            </div>
            {region.peakRate && (
              <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-[10px] text-destructive">Peak</p>
                <p className="text-sm font-bold text-destructive">{region.symbol}{region.peakRate}</p>
              </div>
            )}
            {region.offPeakRate && (
              <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-[10px] text-primary">Off-Peak</p>
                <p className="text-sm font-bold text-primary">{region.symbol}{region.offPeakRate}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
