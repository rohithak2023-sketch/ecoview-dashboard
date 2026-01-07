import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  BarChart3, 
  Bell, 
  Shield, 
  ArrowRight, 
  Loader2, 
  Users, 
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Globe,
  Leaf
} from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !roleLoading && isAuthenticated) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/user-dashboard');
      }
    }
  }, [isAuthenticated, isLoading, roleLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    {
      icon: BarChart3,
      title: 'Real-time Monitoring',
      description: 'Track your energy consumption with live updates and detailed analytics dashboards'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Get instant notifications when usage exceeds your custom thresholds'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Your data is encrypted and protected with bank-grade security standards'
    },
    {
      icon: TrendingDown,
      title: 'Cost Optimization',
      description: 'AI-powered insights to help reduce your energy bills significantly'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Admin controls for managing multiple users and access levels'
    },
    {
      icon: Globe,
      title: 'Access Anywhere',
      description: 'Monitor your energy usage from any device, anywhere in the world'
    }
  ];

  const benefits = [
    'Reduce energy costs by up to 30%',
    'Real-time consumption tracking',
    'Automated usage reports',
    'Role-based access control',
    '24/7 monitoring capability',
    'Environmental impact insights'
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              EnergyFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} className="shadow-lg shadow-primary/20">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Smart Energy Management Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Take Control of Your{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Energy Future
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Monitor, analyze, and optimize your energy consumption in real-time. 
            Save money while reducing your environmental impact with intelligent insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="h-14 px-8 text-lg shadow-xl shadow-primary/25">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="h-14 px-8 text-lg">
              View Live Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Manage Energy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed to give you complete visibility and control over your energy consumption
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="pt-6">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Why Choose Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for Modern Energy Management
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you're a homeowner looking to reduce bills or an admin managing enterprise energy consumption, EnergyFlow has you covered.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="mt-8" onClick={() => navigate('/auth')}>
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-2xl" />
              <Card className="relative bg-card/80 backdrop-blur border-border/50 shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Leaf className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Environmental Impact</p>
                      <p className="text-sm text-muted-foreground">This month's savings</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                      <span className="text-sm">Energy Saved</span>
                      <span className="font-bold text-primary">245 kWh</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                      <span className="text-sm">Cost Reduction</span>
                      <span className="font-bold text-primary">$48.50</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                      <span className="text-sm">CO₂ Avoided</span>
                      <span className="font-bold text-primary">120 kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted Worldwide</h2>
            <p className="text-lg text-muted-foreground">Join thousands of users optimizing their energy usage</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
              <div className="text-4xl font-bold text-primary mb-2">25%</div>
              <div className="text-muted-foreground">Avg. Savings</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 shadow-2xl shadow-primary/25 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>
            <CardContent className="relative p-12 text-center text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Optimize Your Energy?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Start your free trial today and see how much you can save with intelligent energy management.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/auth')} 
                className="h-14 px-8 text-lg shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">EnergyFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 EnergyFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
