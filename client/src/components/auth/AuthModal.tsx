import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../ui/Toast'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'register'
}

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode)
  const [showPw, setShowPw] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const { success, error } = useToast()

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onLogin = async (data: LoginForm) => {
    const { error: err } = await signIn(data.email, data.password)
    if (err) { error(err.message); return }
    success('Welcome back!')
    onClose()
  }

  const onRegister = async (data: RegisterForm) => {
    const { error: err } = await signUp(data.email, data.password, data.fullName)
    if (err) { error(err.message); return }
    success('Account created! Please check your email to verify.')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl font-semibold text-black dark:text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Join Hoody'}
          </h2>
          <p className="text-sm text-neutral-400">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account today'}
          </p>
        </div>

        {/* Google */}
        <button
          onClick={() => signInWithGoogle()}
          className="w-full h-11 border border-neutral-200 dark:border-dark-border rounded flex items-center justify-center gap-3 text-sm font-medium text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-dark-card transition-colors mb-6"
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
          <div className="flex-1 h-px bg-neutral-100 dark:bg-dark-border" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-100 dark:bg-dark-border" />
        </div>

        {mode === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" error={loginForm.formState.errors.email?.message} {...loginForm.register('email')} />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              error={loginForm.formState.errors.password?.message}
              rightIcon={<button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
              {...loginForm.register('password')}
            />
            <Button type="submit" fullWidth loading={loginForm.formState.isSubmitting}>Sign In</Button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" error={registerForm.formState.errors.fullName?.message} {...registerForm.register('fullName')} />
            <Input label="Email" type="email" placeholder="you@example.com" error={registerForm.formState.errors.email?.message} {...registerForm.register('email')} />
            <Input label="Password" type={showPw ? 'text' : 'password'} placeholder="••••••••" error={registerForm.formState.errors.password?.message}
              rightIcon={<button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
              {...registerForm.register('password')} />
            <Input label="Confirm Password" type="password" placeholder="••••••••" error={registerForm.formState.errors.confirmPassword?.message} {...registerForm.register('confirmPassword')} />
            <Button type="submit" fullWidth loading={registerForm.formState.isSubmitting}>Create Account</Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-neutral-400">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-black dark:text-white font-medium hover:text-brand-gold transition-colors">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </Modal>
  )
}
