import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-5 md:px-12 relative z-10">
        <span className="text-lg font-bold text-primary-foreground tracking-tight">
          Brand Builder
        </span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5" onClick={handleLogin}>
            Log In
          </Button>
          <Button variant="linkedin" size="sm" onClick={handleLogin}>
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 md:px-12 relative">
        {/* Subtle glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-linkedin/5 blur-[120px] pointer-events-none" />

        <div className="max-w-3xl w-full text-center relative z-10 space-y-10">
          <div className="animate-fade-in space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 text-primary-foreground/70 text-xs font-medium tracking-wide uppercase">
              <Zap className="h-3 w-3" />
              AI-Powered LinkedIn Growth
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary-foreground leading-[1.05] tracking-tight">
              Your ideas.
              <br />
              <span className="text-linkedin">Published.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/50 max-w-lg mx-auto leading-relaxed font-light">
              Turn documents and voice notes into LinkedIn posts that sound like you. Built for founders who move fast.
            </p>
          </div>

          <div className="animate-slide-up flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" className="h-14 px-10 text-base" onClick={handleLogin}>
              Start Building
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="heroOutline" size="lg" className="h-14 px-10 text-base" onClick={handleLogin}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in flex items-center justify-center gap-8 pt-4">
            {[
              { icon: Clock, text: '5 min setup' },
              { icon: Shield, text: 'Your writing style, not AI slop' },
              { icon: Zap, text: 'Posts in seconds' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-primary-foreground/30 text-xs font-medium">
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
