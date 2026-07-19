import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import Ferrofluid from '../components/ui/Ferrofluid'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
})
const registerSchema = loginSchema.extend({
  fullName: z.string().min(2),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  )
  const [showPw, setShowPw] = useState(false)
  const { signIn, signUp, signInWithGoogle, user } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/account') }, [user, navigate])

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onLogin = async (data: LoginForm) => {
    const { error: err } = await signIn(data.email, data.password)
    if (err) { error(err.message); return }
    success('Welcome back!'); navigate('/account')
  }

  const onRegister = async (data: RegisterForm) => {
    const { error: err } = await signUp(data.email, data.password, data.fullName)
    if (err) { error(err.message); return }
    success('Account created! Please check your email.'); navigate('/')
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black">
      {/* Ferrofluid full-screen background */}
      <div className="absolute inset-0 z-0">
        <Ferrofluid
          colors={['#ff006e', '#8338ec', '#3a86ff', '#06d6a0', '#ffbe0b']}
          speed={0.4}
          scale={1.8}
          turbulence={0.9}
          fluidity={0.12}
          rimWidth={0.25}
          sharpness={2.2}
          shimmer={1.2}
          glow={2.5}
          flowDirection="down"
          opacity={1}
          mouseInteraction
          mouseStrength={1.2}
          mouseRadius={0.4}
        />
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft size={15} /> Back to Home
      </Link>

      {/* Logo */}
      <Link
        to="/"
        className="absolute top-6 left-1/2 -translate-x-1/2 z-20 font-serif text-2xl font-bold text-white tracking-widest uppercase"
      >
        HOODY
      </Link>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-2xl p-8 shadow-2xl">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-white/50 mb-8">
            {mode === 'login' ? 'Sign in to access your account' : 'Join the Hoody community'}
          </p>

          {/* Google */}
          <button
            onClick={() => signInWithGoogle()}
            className="w-full h-11 border border-white/20 rounded-lg flex items-center justify-center gap-3 text-sm font-medium text-white hover:bg-white/10 transition-colors mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-xs text-white/40">or</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <AuthInput label="Email" type="email" placeholder="you@example.com" error={loginForm.formState.errors.email?.message} {...loginForm.register('email')} />
              <AuthInput label="Password" type={showPw ? 'text' : 'password'} placeholder="••••••••" error={loginForm.formState.errors.password?.message}
                rightIcon={<button type="button" onClick={() => setShowPw(!showPw)} className="text-white/40 hover:text-white">{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button>}
                {...loginForm.register('password')} />
              <Button type="submit" fullWidth size="lg" loading={loginForm.formState.isSubmitting}>Sign In</Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <AuthInput label="Full Name" placeholder="John Doe" error={registerForm.formState.errors.fullName?.message} {...registerForm.register('fullName')} />
              <AuthInput label="Email" type="email" placeholder="you@example.com" error={registerForm.formState.errors.email?.message} {...registerForm.register('email')} />
              <AuthInput label="Password" type={showPw ? 'text' : 'password'} placeholder="••••••••" error={registerForm.formState.errors.password?.message}
                rightIcon={<button type="button" onClick={() => setShowPw(!showPw)} className="text-white/40 hover:text-white">{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button>}
                {...registerForm.register('password')} />
              <AuthInput label="Confirm Password" type="password" placeholder="••••••••" error={registerForm.formState.errors.confirmPassword?.message} {...registerForm.register('confirmPassword')} />
              <Button type="submit" fullWidth size="lg" loading={registerForm.formState.isSubmitting}>Create Account</Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-white/40">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-white font-medium hover:text-white/70 transition-colors">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// Minimal glass-style input for the auth page
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  rightIcon?: React.ReactNode
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, rightIcon, ...props }, ref) => (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          {...props}
          className="w-full h-11 bg-white/10 border border-white/20 rounded-lg px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all pr-10"
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
