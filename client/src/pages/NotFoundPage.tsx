import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-brand-gold font-serif text-8xl md:text-9xl font-bold opacity-20 mb-0 select-none">404</p>
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white mb-4 -mt-6">Page Not Found</h1>
      <p className="text-neutral-400 max-w-sm mb-10 leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/"><Button size="lg">Go Home</Button></Link>
        <Link to="/shop"><Button variant="outline" size="lg">Browse Shop</Button></Link>
      </div>
    </div>
  )
}
