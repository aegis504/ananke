import { cn } from '../../lib/cn'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'premium' | 'urgent' | 'ghost' | 'default'
const variants: Record<Variant, string> = {
  premium: 'bg-primary hover:bg-primary-hover text-white shadow-sm',
  urgent: 'bg-danger hover:brightness-110 text-white shadow-sm animate-pulse',
  ghost: 'bg-transparent hover:bg-bg-alt text-text-secondary border border-border hover:border-border-hover',
  default: 'bg-bg-card hover:bg-bg-alt text-text border border-border',
}
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: 'sm' | 'md' | 'lg' }
const sizes = { sm: 'px-4 py-2 text-[15px]', md: 'px-6 py-3 text-base', lg: 'px-8 py-3.5 text-[17px]' }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'md', ...props }, ref) => (
  <button ref={ref} className={cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
    variants[variant], sizes[size], className
  )} {...props} />
))
Button.displayName = 'Button'
