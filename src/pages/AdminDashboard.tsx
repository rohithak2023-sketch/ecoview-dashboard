import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Zap, Shield, Activity, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserWithRole {
  user_id: string;
  role: AppRole;
  created_at: string;
  email?: string;
}

interface AllUsersReading {
  user_id: string;
  total_consumption: number;
  reading_count: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [allReadings, setAllReadings] = useState<AllUsersReading[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalReadings: 0,
    totalConsumption: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive',
      });
    }
  }, [authLoading, roleLoading, user, isAdmin, navigate, toast]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchData = async () => {
      setUsersLoading(true);
      
      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.error('Error fetching users:', rolesError);
      } else {
        setUsers(rolesData as UserWithRole[]);
      }

      // Fetch aggregated energy readings for all users
      const { data: readingsData, error: readingsError } = await supabase
        .from('energy_readings')
        .select('user_id, consumption');

      if (!readingsError && readingsData) {
        // Aggregate by user
        const aggregated: Record<string, AllUsersReading> = {};
        let totalConsumption = 0;
        
        readingsData.forEach((reading) => {
          if (!aggregated[reading.user_id]) {
            aggregated[reading.user_id] = {
              user_id: reading.user_id,
              total_consumption: 0,
              reading_count: 0,
            };
          }
          aggregated[reading.user_id].total_consumption += Number(reading.consumption);
          aggregated[reading.user_id].reading_count += 1;
          totalConsumption += Number(reading.consumption);
        });

        setAllReadings(Object.values(aggregated));
        setSystemStats({
          totalUsers: rolesData?.length || 0,
          totalReadings: readingsData.length,
          totalConsumption,
        });
      }

      setUsersLoading(false);
    };

    fetchData();
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'User role updated successfully.',
      });
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  if (authLoading || roleLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage users and view system-wide statistics
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* System Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalReadings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats.totalConsumption.toFixed(1)} kWh
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage user roles across the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-mono text-xs">
                        {u.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(value) =>
                            handleRoleChange(u.user_id, value as AppRole)
                          }
                          disabled={u.user_id === user?.id}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Consumption Summary */}
        <Card>
          <CardHeader>
            <CardTitle>User Consumption Summary</CardTitle>
            <CardDescription>
              Energy consumption breakdown by user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : allReadings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No energy readings recorded yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Total Consumption</TableHead>
                    <TableHead>Reading Count</TableHead>
                    <TableHead>Avg per Reading</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allReadings.map((r) => (
                    <TableRow key={r.user_id}>
                      <TableCell className="font-mono text-xs">
                        {r.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{r.total_consumption.toFixed(2)} kWh</TableCell>
                      <TableCell>{r.reading_count}</TableCell>
                      <TableCell>
                        {(r.total_consumption / r.reading_count).toFixed(2)} kWh
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
