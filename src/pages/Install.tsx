import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Download, Share, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Smartphone, text: 'Works offline' },
    { icon: Download, text: 'Fast loading' },
    { icon: CheckCircle, text: 'Home screen access' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl eco-gradient-bg shadow-md">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">EcoVigil</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/login')}
        >
          Skip
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md space-y-8 animate-fade-in">
          {/* App Icon */}
          <div className="mx-auto w-24 h-24 rounded-3xl eco-gradient-bg shadow-lg flex items-center justify-center eco-glow">
            <Leaf className="h-12 w-12 text-primary-foreground" />
          </div>

          {isInstalled ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-chart-1">
                  <CheckCircle className="h-6 w-6" />
                  <h1 className="text-2xl font-bold">App Installed!</h1>
                </div>
                <p className="text-muted-foreground">
                  EcoVigil is now on your home screen. Open it anytime to monitor your energy.
                </p>
              </div>
              
              <Button 
                variant="eco" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Open App
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">
                  Install EcoVigil
                </h1>
                <p className="text-muted-foreground">
                  Add EcoVigil to your home screen for the best experience. Access your energy data anytime, even offline.
                </p>
              </div>

              {/* Features */}
              <div className="flex justify-center gap-6">
                {features.map((feature) => (
                  <div key={feature.text} className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Install Button / Instructions */}
              {deferredPrompt ? (
                <Button 
                  variant="eco" 
                  size="lg" 
                  className="w-full"
                  onClick={handleInstall}
                >
                  <Download className="h-4 w-4" />
                  Install App
                </Button>
              ) : isIOS ? (
                <div className="eco-card p-5 text-left space-y-3">
                  <p className="text-sm font-medium text-foreground">To install on iPhone/iPad:</p>
                  <ol className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">1</span>
                      <span>Tap the <Share className="inline h-4 w-4" /> Share button in Safari</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">2</span>
                      <span>Scroll down and tap "Add to Home Screen"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">3</span>
                      <span>Tap "Add" to confirm</span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="eco-card p-5 text-left space-y-3">
                  <p className="text-sm font-medium text-foreground">To install:</p>
                  <ol className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">1</span>
                      <span>Open browser menu (⋮)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">2</span>
                      <span>Tap "Install App" or "Add to Home Screen"</span>
                    </li>
                  </ol>
                </div>
              )}

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Continue in browser
              </Button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          Works best when installed on your device
        </p>
      </footer>
    </div>
  );
};

export default Install;