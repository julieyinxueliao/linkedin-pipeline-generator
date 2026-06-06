import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { ArrowRight, Zap, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Check your email to confirm your account!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || 'Google sign-in failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col overflow-hidden">
      <SEO
        title={isSignUp ? 'Create your LinkedIn Pipeline Generator account' : 'Sign in to LinkedIn Pipeline Generator'}
        description={isSignUp ? 'Create your LinkedIn Pipeline Generator account and start generating LinkedIn posts that drive real pipeline.' : 'Sign in to LinkedIn Pipeline Generator to manage your LinkedIn content strategy and 4-week calendar.'}
        path="/auth"
        noindex
      />
      <header className="flex items-center justify-between px-6 py-5 md:px-12 relative z-10">
        <span className="text-lg font-bold text-primary-foreground tracking-tight">LinkedIn Pipeline Generator</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 md:px-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-linkedin/5 blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10 space-y-8">
          <div className="animate-fade-in space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 text-primary-foreground/70 text-xs font-medium tracking-wide uppercase">
              <Zap className="h-3 w-3" aria-hidden="true" />
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </div>
            <h1 className="text-4xl font-black text-primary-foreground tracking-tight">
              LinkedIn Pipeline Generator
            </h1>
          </div>

          <div className="animate-slide-up space-y-4">
            <Button
              variant="heroOutline"
              size="lg"
              className="w-full h-14"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-primary-foreground/10" />
              <span className="text-xs text-primary-foreground/30 font-medium">or</span>
              <div className="flex-1 h-px bg-primary-foreground/10" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/20 h-12"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/20 h-12"
              />
              <Button variant="hero" size="lg" className="w-full h-14" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {isSignUp ? 'Create account' : 'Sign in'}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-primary-foreground/40">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-linkedin hover:underline font-medium">
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
