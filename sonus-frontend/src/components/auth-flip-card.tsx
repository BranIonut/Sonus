'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Music2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/glass-card';
import { cn } from '@/lib/utils';
import { AuthService } from '@/api/auth-api';
import { ArtistService } from '@/api/artist-api';
import { useUserStore } from '@/lib/store';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { se } from 'date-fns/locale';

interface AuthFlipCardProps {
    initialMode: 'login' | 'signup';
}

export function AuthFlipCard({ initialMode }: AuthFlipCardProps) {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [isFlipping, setIsFlipping] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState('USER');

    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [signupForm, setSignupForm] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: role
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    const handleFlip = (newMode: 'login' | 'signup') => {
        if (mode === newMode || isFlipping) return;

        setIsFlipping(true);

        navigate(`/${newMode}`, { replace: true });

        setTimeout(() => {
            setMode(newMode);
            setTimeout(() => {
                setIsFlipping(false);
            }, 300);
        }, 300);
    };

    const login = useUserStore((state) => state.login);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = await AuthService.login({
                username: loginForm.username,
                password: loginForm.password,
            });

            localStorage.setItem('authToken', token);

            const validationInfo = await AuthService.validateToken(token);

            console.log('Validation Info:', validationInfo);

            const userProfile = await AuthService.getUserProfile(validationInfo.id);

            console.log({
                userId: validationInfo.id,
                username: userProfile.username,
                name: userProfile.name,
                email: userProfile.email,
                role: validationInfo.role,
                hasActiveSubscription: validationInfo.hasActiveSubscription,
            });

            if (validationInfo.role === 'ARTIST') {
                try {
                    const profile = await ArtistService.getArtistProfile(validationInfo.id);
                } catch (_) {
                    try {
                        await ArtistService.updateArtistProfile(validationInfo.id, {
                            stageName: userProfile.name || userProfile.username,
                        });
                    } catch (e2) {
                        console.warn('Could not auto-create artist profile:', e2);
                    }
                }
            }

            login({
                userId: validationInfo.id,
                username: userProfile.username,
                name: userProfile.name,
                email: userProfile.email,
                role: validationInfo.role,
                hasActiveSubscription: validationInfo.hasActiveSubscription,
            }, token);

            navigate('/');

        } catch (error) {
            console.error(error);
            toast.error('Login Failed: wrong credentials');
        }

        setIsLoading(false);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        await AuthService.signup({
            username: signupForm.username,
            name: signupForm.name,
            email: signupForm.email,
            password: signupForm.password,
            role: role
        }).then(async (response) => {
            console.log(response);

            if (role === 'ARTIST' && response?.userId) {
                try {
                    await ArtistService.updateArtistProfile(response.userId, {
                        stageName: signupForm.name || signupForm.username,
                    });
                } catch (e) {
                    console.warn('Could not create artist profile on signup:', e);
                }
            }
            toast.success('Account created successfully! Please sign in.');
            handleFlip('login');
        }).catch((error) => {
            console.error(error);
            toast.error('Signup Failed. Please try again.');
        });

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            \
            <div className="absolute inset-0 bg-background">
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]"
                        style={{
                            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                            top: '10%',
                            left: '20%',
                        }}
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
                        style={{
                            background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))',
                            bottom: '10%',
                            right: '20%',
                        }}
                        animate={{
                            x: [0, -80, 0],
                            y: [0, 60, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </div>
            </div>

            <motion.div
                className="absolute top-8 left-8 flex items-center gap-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Music2 className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Sonus
                    </span>
                </Link>
            </motion.div>

            <div className="relative w-full max-w-md" style={{ perspective: '1500px' }}>
                <motion.div
                    className="relative w-full"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{
                        rotateY: mode === 'login' ? 0 : 180,
                    }}
                    transition={{
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                >

                    <div
                        className={cn(
                            'w-full',
                            mode === 'signup' && 'pointer-events-none'
                        )}
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                        }}
                    >
                        <GlassCard variant="card" className="p-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: mode === 'login' ? 1 : 0, y: mode === 'login' ? 0 : 20 }}
                                transition={{ delay: mode === 'login' ? 0.3 : 0 }}
                            >

                                <div className="text-center mb-8">
                                    <motion.div
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Welcome back
                                    </motion.div>
                                    <h1 className="text-2xl font-bold mb-2">Sign in to Sonus</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Continue your musical journey
                                    </p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Username</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="username"
                                                value={loginForm.username}
                                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-muted-foreground">Password</label>
                                            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                value={loginForm.password}
                                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                                className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-primary/50"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            />
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                                    </div>
                                </div>

                                <p className="text-center text-sm text-muted-foreground mt-6">
                                    Don&apos;t have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleFlip('signup')}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            </motion.div>
                        </GlassCard>
                    </div>

                    <div
                        className={cn(
                            'absolute inset-0 w-full',
                            mode === 'login' && 'pointer-events-none'
                        )}
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <GlassCard variant="card" className="p-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: mode === 'signup' ? 1 : 0, y: mode === 'signup' ? 0 : 20 }}
                                transition={{ delay: mode === 'signup' ? 0.3 : 0 }}
                            >

                                <div className="text-center mb-8">
                                    <motion.div
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm mb-4"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Join the community
                                    </motion.div>
                                    <h1 className="text-2xl font-bold mb-2">Create an account</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Start your musical journey today
                                    </p>
                                </div>

                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="John Doe"
                                                value={signupForm.name}
                                                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                                                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-accent/50"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Username</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="john_doe"
                                                value={signupForm.username}
                                                onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                                                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-accent/50"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={signupForm.email}
                                                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                                                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-accent/50"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Create a password"
                                                value={signupForm.password}
                                                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                                className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-accent/50"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm your password"
                                                value={signupForm.confirmPassword}
                                                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                                                className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-accent/50"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <Select value={role} onValueChange={setRole}>
                                            <SelectTrigger className="glass">
                                                <SelectValue placeholder="Select account type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USER">Standard Listener</SelectItem>
                                                <SelectItem value="ARTIST">Artist / Creator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            />
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-muted-foreground text-center">
                                        By signing up, you agree to our{' '}
                                        <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>
                                        {' '}and{' '}
                                        <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                                    </p>
                                </form>

                                <p className="text-center text-sm text-muted-foreground mt-6">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleFlip('login')}
                                        className="text-accent hover:underline font-medium"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </motion.div>
                        </GlassCard>
                    </div>
                </motion.div>
            </div>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-primary/20"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.4, 0.2],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: 'easeInOut',
                        }}
                    >
                        <Music2 className="w-8 h-8" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
