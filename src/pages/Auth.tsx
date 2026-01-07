import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Zap, Loader2, ArrowLeft, Shield, User, Sparkles, BarChart3, Bell, Lock } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check for password reset token in URL
  useEffect(() => {
    const type = searchParams.get('type');
    const accessToken = searchParams.get('access_token');
    
    if (type === 'recovery' && accessToken) {
      setMode('reset');
    }
  }, [searchParams]);

  // Redirect based on user role
  const redirectBasedOnRole = async (userId: string) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleData?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/user-dashboard');
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
      } else if (session && mode !== 'reset') {
        // Defer to avoid deadlock
        setTimeout(() => {
          redirectBasedOnRole(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mode !== 'reset') {
        redirectBasedOnRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const validation = authSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else if (error.message.includes('Failed to fetch')) {
            toast.error('Network error. Please check your connection and try again.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Logged in successfully');
        if (data.user) {
          await redirectBasedOnRole(data.user.id);
        }
      } else if (mode === 'signup') {
        const validation = authSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          return;
        }
        const redirectUrl = `${window.location.origin}/auth`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl }
        });
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please login instead.');
          } else if (error.message.includes('Failed to fetch')) {
            toast.error('Network error. Please check your connection and try again.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Account created! You can now log in.');
        setMode('login');
      } else if (mode === 'forgot') {
        const validation = emailSchema.safeParse({ email });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          return;
        }
        const redirectUrl = `${window.location.origin}/auth`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl
        });
        if (error) {
          if (error.message.includes('Failed to fetch')) {
            toast.error('Network error. Please check your connection and try again.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Password reset email sent! Check your inbox.');
        setMode('login');
      } else if (mode === 'reset') {
        const validation = resetPasswordSchema.safeParse({ password, confirmPassword });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Password updated successfully!');
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await redirectBasedOnRole(session.user.id);
        } else {
          navigate('/auth');
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join EnergyFlow';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'Set New Password';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Sign in to access your energy dashboard';
      case 'signup': return 'Create your account to start monitoring';
      case 'forgot': return 'Enter your email to receive reset instructions';
      case 'reset': return 'Choose a strong password for your account';
    }
  };

  const features = [
    { icon: BarChart3, text: 'Real-time Analytics' },
    { icon: Bell, text: 'Smart Alerts' },
    { icon: Lock, text: 'Secure & Private' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold">EnergyFlow</span>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Smart Energy Management
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-md">
                Monitor, analyze, and optimize your energy consumption with powerful insights and real-time tracking.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <feature.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Role Info */}
            <div className="space-y-4">
              <p className="text-sm text-primary-foreground/70">Two access levels available:</p>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold">Admin</span>
                  </div>
                  <p className="text-sm text-primary-foreground/70">
                    Full system access, user management, and analytics
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5" />
                    <span className="font-semibold">User</span>
                  </div>
                  <p className="text-sm text-primary-foreground/70">
                    Personal dashboard and energy tracking
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-primary-foreground/60">
            © 2025 EnergyFlow. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">EnergyFlow</span>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
                {mode === 'signup' && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Free
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                {getDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode !== 'reset' && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                )}
                {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {mode === 'reset' ? 'New Password' : 'Password'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                )}
                {mode === 'reset' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                )}
                
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  {mode === 'reset' && 'Update Password'}
                </Button>
              </form>
              
              <div className="mt-6 space-y-3">
                {mode === 'login' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors block w-full text-center"
                      disabled={isLoading}
                    >
                      Forgot your password?
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMode('signup')}
                      className="w-full h-11"
                      disabled={isLoading}
                    >
                      Create a new account
                    </Button>
                  </>
                )}
                {mode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block w-full text-center"
                    disabled={isLoading}
                  >
                    Already have an account? <span className="text-primary font-medium">Sign in</span>
                  </button>
                )}
                {(mode === 'forgot' || mode === 'reset') && (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-sm text-primary hover:underline inline-flex items-center justify-center gap-1 w-full"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                  </button>
                )}
              </div>

              {/* Info Note */}
              {mode === 'signup' && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    First user to sign up becomes an <strong>Admin</strong>. All subsequent users get <strong>User</strong> access.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Footer */}
          <p className="lg:hidden text-center text-sm text-muted-foreground mt-8">
            © 2025 EnergyFlow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
