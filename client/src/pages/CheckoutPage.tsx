import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../components/ui/Toast'
import { formatPrice } from '../lib/utils'

const checkoutSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  cardName: z.string().min(2),
  cardNumber: z.string().min(16).max(19),
  expiry: z.string().min(5),
  cvv: z.string().min(3).max(4),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'AE', label: 'UAE' },
  { value: 'SG', label: 'Singapore' },
]

export default function CheckoutPage() {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info')
  const { items, subtotal, clearCart } = useCart()
  const { success } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  })

  const shipping = subtotal >= 200 ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1800))
    clearCart()
    setStep('success')
    success('Order placed successfully!')
  }

  if (step === 'success') {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-bold text-black dark:text-white mb-3">Order Confirmed!</h1>
          <p className="text-neutral-400 mb-2">Thank you for your order. You'll receive a confirmation email shortly.</p>
          <p className="text-sm text-brand-gold font-medium mb-8">Order #HD-{Date.now().toString(36).toUpperCase()}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
            <Button variant="outline" onClick={() => navigate('/account/orders')}>View Orders</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-neutral-50 dark:bg-dark-muted">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-black dark:text-white">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          {[{ id: 'info', label: 'Shipping' }, { id: 'payment', label: 'Payment' }].map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              {i > 0 && <div className="w-12 h-px bg-neutral-200 dark:bg-dark-border" />}
              <button
                onClick={() => s.id === 'info' || step !== 'info' ? null : setStep(s.id as 'info' | 'payment')}
                className={`flex items-center gap-2 text-sm font-medium ${step === s.id ? 'text-black dark:text-white' : 'text-neutral-400'}`}
              >
                <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center ${step === s.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-neutral-200 dark:bg-dark-border'}`}>{i + 1}</span>
                {s.label}
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {step === 'info' && (
                <div className="bg-white dark:bg-dark-card rounded-xl p-6 space-y-5">
                  <h2 className="font-semibold text-black dark:text-white text-lg">Shipping Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Full Name" placeholder="John Doe" error={errors.fullName?.message} {...register('fullName')} />
                    <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                    <Input label="Phone" placeholder="+1 234 567 8900" error={errors.phone?.message} {...register('phone')} />
                    <Select label="Country" options={COUNTRIES} error={errors.country?.message} {...register('country')} />
                    <Input label="Address" placeholder="123 Main St" className="sm:col-span-2" error={errors.address?.message} {...register('address')} />
                    <Input label="City" placeholder="New York" error={errors.city?.message} {...register('city')} />
                    <Input label="State / Province" placeholder="NY" error={errors.state?.message} {...register('state')} />
                    <Input label="Postal Code" placeholder="10001" error={errors.postalCode?.message} {...register('postalCode')} />
                  </div>
                  <Button type="button" fullWidth size="lg" onClick={() => setStep('payment')}>
                    Continue to Payment
                  </Button>
                </div>
              )}

              {step === 'payment' && (
                <div className="bg-white dark:bg-dark-card rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-black dark:text-white text-lg">Payment Details</h2>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Lock size={12} /> SSL Secured
                    </div>
                  </div>
                  <Input label="Name on Card" placeholder="John Doe" error={errors.cardName?.message} {...register('cardName')} />
                  <Input label="Card Number" placeholder="4242 4242 4242 4242" maxLength={19} error={errors.cardNumber?.message} {...register('cardNumber')} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry Date" placeholder="MM / YY" maxLength={7} error={errors.expiry?.message} {...register('expiry')} />
                    <Input label="CVV" placeholder="123" maxLength={4} error={errors.cvv?.message} {...register('cvv')} />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep('info')}>Back</Button>
                    <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="gap-2">
                      <Lock size={16} /> Pay {formatPrice(total)}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-neutral-400">Your payment information is encrypted and secure.</p>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-card rounded-xl p-6 sticky top-24">
                <h3 className="font-semibold text-black dark:text-white mb-4">Order ({items.length} items)</h3>
                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img src={`${item.product.images[0]}?auto=format&fit=crop&w=80&q=70`} alt={item.product.name} className="w-14 h-16 object-cover rounded bg-neutral-50 dark:bg-dark-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-black dark:text-white leading-snug line-clamp-2">{item.product.name}</p>
                        <p className="text-xs text-neutral-400">{item.size} · {item.color} · ×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-neutral-100 dark:border-dark-border pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-neutral-500"><span>Shipping</span><span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                  <div className="flex justify-between text-neutral-500"><span>Tax</span><span>{formatPrice(tax)}</span></div>
                  <div className="flex justify-between font-bold text-black dark:text-white text-base pt-2 border-t border-neutral-100 dark:border-dark-border">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
