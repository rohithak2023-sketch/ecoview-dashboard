import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types';
import { Leaf, Lock, Mail, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        toast({
          title: "Welcome to EcoVigil",
          description: "Successfully logged in to your account.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 eco-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm shadow-lg">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">EcoVigil</h1>
              <p className="text-primary-foreground/80">Energy Monitoring Platform</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Monitor Your Energy,<br />
            <span className="text-primary-foreground/90">Protect Our Planet</span>
          </h2>
          
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Get real-time insights into your energy consumption with advanced analytics and smart monitoring tools.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary-foreground">24/7</p>
              <p className="text-sm text-primary-foreground/70">Real-time Monitoring</p>
            </div>
            <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary-foreground">-15%</p>
              <p className="text-sm text-primary-foreground/70">Average Savings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl eco-gradient-bg shadow-md">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold eco-gradient-text">EcoVigil</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to access your energy dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Login as</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={cn(
                    "flex items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    role === 'user'
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <User className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Standard User</p>
                    <p className="text-xs text-muted-foreground">View dashboards</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={cn(
                    "flex items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    role === 'admin'
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <Shield className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Admin</p>
                    <p className="text-xs text-muted-foreground">Full access</p>
                  </div>
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="eco" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Demo: Enter any email and password (min 4 chars)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
