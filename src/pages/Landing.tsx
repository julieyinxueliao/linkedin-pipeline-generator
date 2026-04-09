import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-illustration.jpg';
import { Linkedin } from 'lucide-react';

const Landing = () => {
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  const handleLogin = () => {
    setAuthenticated(true);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <Linkedin className="h-7 w-7 text-linkedin" />
          <span className="text-lg font-bold text-primary-foreground tracking-tight">
            LinkedIn Brand Builder
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary-foreground" onClick={handleLogin}>
            Log In
          </Button>
          <Button variant="linkedin" onClick={handleLogin}>
            Sign Up
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 md:px-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Turn your ideas into LinkedIn posts in minutes.
            </h1>
            <p className="text-lg text-sidebar-foreground max-w-lg leading-relaxed">
              AI-powered content creation for founders and executives. Get a personalized 30-day posting plan, draft posts from your documents and voice notes, and build your brand — without the time sink.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="h-13 px-8" onClick={handleLogin}>
                Get Started Free
              </Button>
              <Button variant="heroOutline" size="lg" className="h-13 px-8" onClick={handleLogin}>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </Button>
            </div>
          </div>

          <div className="hidden md:block animate-slide-up">
            <img
              src={heroImage}
              alt="LinkedIn Brand Builder - AI content creation"
              className="w-full rounded-2xl shadow-lg opacity-90"
              width={1280}
              height={720}
            />
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-sm text-muted-foreground">
        © 2026 LinkedIn Brand Builder. Built for busy executives.
      </footer>
    </div>
  );
};

export default Landing;
