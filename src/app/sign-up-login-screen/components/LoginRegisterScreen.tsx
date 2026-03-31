'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { Eye, EyeOff, Wallet, Shield, Zap, Globe, ArrowRight, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';
import AppLogo from '@/components/ui/AppLogo';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'login' | 'register';
type RegisterStep = 1 | 2 | 3;

interface LoginForm { email: string; password: string; }
interface RegisterStep1Form { firstName: string; lastName: string; phone: string; dob: string; ssn_last4: string; }
interface RegisterStep2Form { address: string; city: string; state: string; zip: string; }
interface RegisterStep3Form { email: string; password: string; confirmPassword: string; agreeTerms: boolean; }

// ─── Human-friendly Supabase error messages ───────────────────────────────────
function friendlyAuthError(error: string): string {
    console.log('[Auth] Raw error:', error);
    if (error.includes('Invalid login credentials')) return 'Incorrect email or password. Please try again.';
    if (error.includes('Email not confirmed')) return 'Please check your inbox and confirm your email address.';
    if (error.includes('User already registered')) return 'An account with this email already exists. Try signing in.';
    if (error.includes('Password should be')) return 'Password must be at least 6 characters long.';
    if (error.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
    if (error.includes('network')) return 'Network error — please check your connection and try again.';
    return error || 'Something went wrong. Please try again.';
}

export default function LoginRegisterScreen() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
    const [step1Data, setStep1Data] = useState<RegisterStep1Form | null>(null);
    const [step2Data, setStep2Data] = useState<RegisterStep2Form | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '' } });
    const step1Form = useForm<RegisterStep1Form>();
    const step2Form = useForm<RegisterStep2Form>();
    const step3Form = useForm<RegisterStep3Form>();

    // ─── Login ────────────────────────────────────────────────────────────────
    const handleLogin = async (data: LoginForm) => {
        console.log('[Login] 🔐 Attempting sign-in for:', data.email);
        setIsLoading(true);
        const result = await db.auth.signIn(data.email, data.password);
        setIsLoading(false);

        if (result.success) {
            toast.success('Welcome back! Redirecting...');
            console.log('[Login] ✅ Success — role:', result.role);
            setTimeout(() => {
                router.push(result.role === 'admin' ? '/admin-panel' : '/user-dashboard');
            }, 400);
        } else {
            const msg = friendlyAuthError(result.error ?? '');
            toast.error(msg);
            loginForm.setError('password', { message: msg });
            console.warn('[Login] ❌ Sign-in failed:', result.error);
        }
    };

    // ─── Register Steps ───────────────────────────────────────────────────────
    const handleStep1 = (data: RegisterStep1Form) => {
        console.log('[Register] Step 1 complete — personal info');
        setStep1Data(data);
        setRegisterStep(2);
    };

    const handleStep2 = (data: RegisterStep2Form) => {
        console.log('[Register] Step 2 complete — address');
        setStep2Data(data);
        setRegisterStep(3);
    };

    const handleStep3 = async (data: RegisterStep3Form) => {
        if (data.password !== data.confirmPassword) {
            step3Form.setError('confirmPassword', { message: 'Passwords do not match' });
            return;
        }
        if (!step1Data || !step2Data) return;

        console.log('[Register] Step 3 — creating account for:', data.email);
        setIsLoading(true);

        const result = await db.auth.signUp({
            email: data.email,
            password: data.password,
            firstName: step1Data.firstName,
            lastName: step1Data.lastName,
            phone: step1Data.phone,
            dob: step1Data.dob,
            ssn_last4: step1Data.ssn_last4,
            address: step2Data.address,
            city: step2Data.city,
            state: step2Data.state,
            zip: step2Data.zip,
        });

        setIsLoading(false);

        if (result.success) {
            console.log('[Register] ✅ Account created:', result.userId);
            toast.success('Account created! Redirecting to your dashboard...');
            setTimeout(() => router.push('/user-dashboard'), 800);
        } else {
            const msg = friendlyAuthError(result.error ?? '');
            toast.error(msg);
            step3Form.setError('email', { message: msg });
            console.error('[Register] ❌ Sign-up failed:', result.error);
        }
    };

    const features = [
        { icon: Shield, label: 'Bank-grade security', desc: '256-bit AES encryption' },
        { icon: Zap, label: 'Instant transfers', desc: 'Send money in seconds' },
        { icon: Globe, label: 'ACH & Direct Deposit', desc: 'Multiple deposit methods' },
        { icon: Wallet, label: 'Smart wallet', desc: 'Track every transaction' },
    ];

    return (
        <div className="min-h-screen flex">
            <Toaster position="top-right" richColors />

            {/* ── Left brand panel ── */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[hsl(214,74%,18%)] via-[hsl(214,74%,24%)] to-[hsl(214,74%,32%)] flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-20 left-20 w-96 h-96 rounded-full border border-white/30" />
                    <div className="absolute top-40 left-40 w-64 h-64 rounded-full border border-white/20" />
                    <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full border border-white/20" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <AppLogo size={40} />
                        <span className="text-white font-bold text-2xl tracking-tight">eWallet</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                        Your money,<br />wherever you are.
                    </h1>
                    <p className="text-blue-200 text-lg leading-relaxed">
                        Open a digital wallet in minutes. Deposit, withdraw, and transfer with confidence — fully KYC-verified.
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4">
                    {features.map((f) => (
                        <div key={`feature-${f.label}`} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <f.icon size={20} className="text-blue-300 mb-2" />
                            <p className="text-white font-semibold text-sm">{f.label}</p>
                            <p className="text-blue-300 text-xs mt-0.5">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="relative z-10 text-blue-300 text-xs">
                    © 2026 eWallet Inc. — Licensed Money Services Business
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-[hsl(var(--background))] overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <AppLogo size={36} />
                        <span className="font-bold text-xl text-[hsl(var(--primary))]">eWallet</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-[hsl(var(--muted))] rounded-xl p-1 mb-8">
                        {(['login', 'register'] as Tab[]).map(t => (
                            <button
                                key={`tab-${t}`}
                                onClick={() => { setTab(t); setRegisterStep(1); }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === t ? 'bg-white text-[hsl(var(--primary))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                            >
                                {t === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    {/* ── LOGIN ── */}
                    {tab === 'login' && (
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Welcome back</h2>
                                <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Sign in to access your wallet</p>
                            </div>

                            <div>
                                <label className="label">Email address</label>
                                <input
                                    type="email"
                                    id="login-email"
                                    className={`input-field ${loginForm.formState.errors.email ? 'border-red-400' : ''}`}
                                    placeholder="you@example.com"
                                    {...loginForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                                />
                                {loginForm.formState.errors.email?.message?.trim() && (
                                    <p className="field-error">{loginForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        className={`input-field pr-10 ${loginForm.formState.errors.password ? 'border-red-400' : ''}`}
                                        placeholder="••••••••"
                                        {...loginForm.register('password', { required: 'Password is required' })}
                                    />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {loginForm.formState.errors.password && (
                                    <p className="field-error">{loginForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                                {isLoading ? (
                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                                ) : (
                                    <><span>Sign In</span><ArrowRight size={16} /></>
                                )}
                            </button>

                            {/* How it works hint */}
                            <div className="bg-[hsl(var(--muted))] rounded-xl p-4 border border-[hsl(var(--border))]">
                                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">How to get started</p>
                                <ol className="text-xs text-[hsl(var(--muted-foreground))] space-y-1 list-decimal list-inside">
                                    <li>Create an account using the <strong className="text-[hsl(var(--foreground))]">Create Account</strong> tab above</li>
                                    <li>Fill in your personal info, address, and set a password</li>
                                    <li>Log in and complete <strong className="text-[hsl(var(--foreground))]">KYC verification</strong> to unlock all features</li>
                                    <li>Request a deposit account and start using your wallet</li>
                                </ol>
                            </div>
                        </form>
                    )}

                    {/* ── REGISTER ── */}
                    {tab === 'register' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Create your account</h2>
                                <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
                                    Step {registerStep} of 3 — {registerStep === 1 ? 'Personal Info' : registerStep === 2 ? 'Address' : 'Security'}
                                </p>
                            </div>

                            {/* Step indicator */}
                            <div className="flex items-center gap-2 mb-8">
                                {([1, 2, 3] as RegisterStep[]).map((s) => (
                                    <React.Fragment key={`step-${s}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${registerStep >= s ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                                            {s}
                                        </div>
                                        {s < 3 && <div className={`flex-1 h-0.5 rounded transition-all ${registerStep > s ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'}`} />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Step 1 — Personal Info */}
                            {registerStep === 1 && (
                                <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="label">First Name</label>
                                            <input id="reg-first-name" className={`input-field ${step1Form.formState.errors.firstName ? 'border-red-400' : ''}`} placeholder="Marcus" {...step1Form.register('firstName', { required: 'Required' })} />
                                            {step1Form.formState.errors.firstName && <p className="field-error">{step1Form.formState.errors.firstName.message}</p>}
                                        </div>
                                        <div>
                                            <label className="label">Last Name</label>
                                            <input id="reg-last-name" className={`input-field ${step1Form.formState.errors.lastName ? 'border-red-400' : ''}`} placeholder="Okafor" {...step1Form.register('lastName', { required: 'Required' })} />
                                            {step1Form.formState.errors.lastName && <p className="field-error">{step1Form.formState.errors.lastName.message}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Phone Number</label>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Used for account verification and 2FA</p>
                                        <input id="reg-phone" type="tel" className={`input-field ${step1Form.formState.errors.phone ? 'border-red-400' : ''}`} placeholder="+1 (312) 555-0000" {...step1Form.register('phone', { required: 'Phone is required' })} />
                                        {step1Form.formState.errors.phone && <p className="field-error">{step1Form.formState.errors.phone.message}</p>}
                                    </div>

                                    <div>
                                        <label className="label">Date of Birth</label>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">You must be 18+ to open an account</p>
                                        <input id="reg-dob" type="date" className={`input-field ${step1Form.formState.errors.dob ? 'border-red-400' : ''}`} {...step1Form.register('dob', { required: 'Date of birth is required' })} />
                                        {step1Form.formState.errors.dob && <p className="field-error">{step1Form.formState.errors.dob.message}</p>}
                                    </div>

                                    <div>
                                        <label className="label">SSN — Last 4 Digits</label>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Required for identity verification per FinCEN regulations</p>
                                        <input
                                            id="reg-ssn"
                                            className={`input-field font-mono ${step1Form.formState.errors.ssn_last4 ? 'border-red-400' : ''}`}
                                            placeholder="••••"
                                            maxLength={4}
                                            {...step1Form.register('ssn_last4', { required: 'SSN last 4 required', pattern: { value: /^\d{4}$/, message: 'Must be 4 digits' } })}
                                        />
                                        {step1Form.formState.errors.ssn_last4 && <p className="field-error">{step1Form.formState.errors.ssn_last4.message}</p>}
                                    </div>

                                    <button type="submit" id="reg-step1-next" className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
                                        Continue <ChevronRight size={16} />
                                    </button>
                                </form>
                            )}

                            {/* Step 2 — Address */}
                            {registerStep === 2 && (
                                <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
                                    <div>
                                        <label className="label">Street Address</label>
                                        <input id="reg-address" className={`input-field ${step2Form.formState.errors.address ? 'border-red-400' : ''}`} placeholder="2847 N Halsted St, Apt 3B" {...step2Form.register('address', { required: 'Address is required' })} />
                                        {step2Form.formState.errors.address && <p className="field-error">{step2Form.formState.errors.address.message}</p>}
                                    </div>

                                    <div>
                                        <label className="label">City</label>
                                        <input id="reg-city" className={`input-field ${step2Form.formState.errors.city ? 'border-red-400' : ''}`} placeholder="Chicago" {...step2Form.register('city', { required: 'City is required' })} />
                                        {step2Form.formState.errors.city && <p className="field-error">{step2Form.formState.errors.city.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="label">State</label>
                                            <select id="reg-state" className={`input-field ${step2Form.formState.errors.state ? 'border-red-400' : ''}`} {...step2Form.register('state', { required: 'State is required' })}>
                                                <option value="">Select state</option>
                                                {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(s => (
                                                    <option key={`state-${s}`} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            {step2Form.formState.errors.state && <p className="field-error">{step2Form.formState.errors.state.message}</p>}
                                        </div>
                                        <div>
                                            <label className="label">ZIP Code</label>
                                            <input id="reg-zip" className={`input-field ${step2Form.formState.errors.zip ? 'border-red-400' : ''}`} placeholder="60614" maxLength={5} {...step2Form.register('zip', { required: 'ZIP required', pattern: { value: /^\d{5}$/, message: '5-digit ZIP' } })} />
                                            {step2Form.formState.errors.zip && <p className="field-error">{step2Form.formState.errors.zip.message}</p>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-2">
                                        <button type="button" onClick={() => setRegisterStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                                        <button type="submit" id="reg-step2-next" className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                                            Continue <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 3 — Security */}
                            {registerStep === 3 && (
                                <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-4">
                                    <div>
                                        <label className="label">Email Address</label>
                                        <input id="reg-email" type="email" className={`input-field ${step3Form.formState.errors.email ? 'border-red-400' : ''}`} placeholder="you@example.com" {...step3Form.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
                                        {step3Form.formState.errors.email && <p className="field-error">{step3Form.formState.errors.email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="label">Password</label>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Min 8 characters, include uppercase, number, and symbol</p>
                                        <div className="relative">
                                            <input
                                                id="reg-password"
                                                type={showPassword ? 'text' : 'password'}
                                                className={`input-field pr-10 ${step3Form.formState.errors.password ? 'border-red-400' : ''}`}
                                                placeholder="••••••••"
                                                {...step3Form.register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
                                            />
                                            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {step3Form.formState.errors.password && <p className="field-error">{step3Form.formState.errors.password.message}</p>}
                                    </div>

                                    <div>
                                        <label className="label">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                id="reg-confirm-password"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className={`input-field pr-10 ${step3Form.formState.errors.confirmPassword ? 'border-red-400' : ''}`}
                                                placeholder="••••••••"
                                                {...step3Form.register('confirmPassword', { required: 'Please confirm password' })}
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {step3Form.formState.errors.confirmPassword && <p className="field-error">{step3Form.formState.errors.confirmPassword.message}</p>}
                                    </div>

                                    <label className="flex items-start gap-2 cursor-pointer">
                                        <input type="checkbox" id="reg-agree" className="mt-0.5" {...step3Form.register('agreeTerms', { required: 'You must agree to proceed' })} />
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                            I agree to the <a href="#" className="text-[hsl(var(--primary))] hover:underline">Terms of Service</a> and <a href="#" className="text-[hsl(var(--primary))] hover:underline">Privacy Policy</a>. I consent to eWallet verifying my identity per AML/KYC regulations.
                                        </span>
                                    </label>
                                    {step3Form.formState.errors.agreeTerms && <p className="field-error">{step3Form.formState.errors.agreeTerms.message}</p>}

                                    <div className="flex gap-3 mt-2">
                                        <button type="button" onClick={() => setRegisterStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                                        <button type="submit" id="reg-submit" disabled={isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                                            {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : 'Create Account'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}