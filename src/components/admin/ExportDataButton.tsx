import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExportDataButtonProps {
  type: 'users' | 'energy';
}

export const ExportDataButton = ({ type }: ExportDataButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      if (type === 'users') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) throw error;

        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role');

        const rolesMap: Record<string, string> = {};
        roles?.forEach((r) => (rolesMap[r.user_id] = r.role));

        data = profiles?.map((p) => ({
          user_id: p.user_id,
          email: p.email || '',
          full_name: p.full_name || '',
          role: rolesMap[p.user_id] || 'user',
          created_at: p.created_at,
        })) || [];

        headers = ['User ID', 'Email', 'Full Name', 'Role', 'Created At'];
        filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        const { data: readings, error } = await supabase
          .from('energy_readings')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) throw error;

        data = readings?.map((r) => ({
          user_id: r.user_id,
          consumption: r.consumption,
          cost: r.cost || 0,
          timestamp: r.timestamp,
          created_at: r.created_at,
        })) || [];

        headers = ['User ID', 'Consumption (kWh)', 'Cost ($)', 'Timestamp', 'Created At'];
        filename = `energy_report_${new Date().toISOString().split('T')[0]}.csv`;
      }

      const csvContent = [
        headers.join(','),
        ...data.map((row) => Object.values(row).map((v) => `"${v}"`).join(',')),
      ].join('\n');

      downloadFile(csvContent, filename, 'text/csv');
      toast({ title: 'Export Complete', description: `${filename} downloaded successfully.` });
    } catch (error: any) {
      toast({ title: 'Export Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      let data: any[] = [];
      let title = '';

      if (type === 'users') {
        const { data: profiles, error } = await supabase.from('profiles').select('*');
        if (error) throw error;

        const { data: roles } = await supabase.from('user_roles').select('user_id, role');
        const rolesMap: Record<string, string> = {};
        roles?.forEach((r) => (rolesMap[r.user_id] = r.role));

        data = profiles?.map((p) => ({
          Email: p.email || 'N/A',
          Name: p.full_name || 'N/A',
          Role: rolesMap[p.user_id] || 'user',
          Joined: new Date(p.created_at).toLocaleDateString(),
        })) || [];

        title = 'User Profiles Report';
      } else {
        const { data: readings, error } = await supabase
          .from('energy_readings')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (error) throw error;

        data = readings?.map((r) => ({
          'User ID': r.user_id.slice(0, 8) + '...',
          'Consumption': `${r.consumption} kWh`,
          'Cost': `$${(r.cost || 0).toFixed(2)}`,
          'Date': new Date(r.timestamp).toLocaleDateString(),
        })) || [];

        title = 'Energy Consumption Report';
      }

      // Generate simple PDF-like HTML and print
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #16a34a; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #16a34a; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>${Object.keys(data[0] || {}).map((h) => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.map((row) => `<tr>${Object.values(row).map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>EcoVigil Energy Monitoring System</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }

      toast({ title: 'PDF Ready', description: 'Print dialog opened for PDF export.' });
    } catch (error: any) {
      toast({ title: 'Export Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
