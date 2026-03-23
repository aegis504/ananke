import { cn } from '../../lib/cn'
import { type HTMLAttributes, forwardRef } from 'react'

type Variant = 'default' | 'premium' | 'urgent'
const variants: Record<Variant, string> = {
  default: 'bg-bg-card border-border',
  premium: 'bg-bg-card border-primary/20 shadow-sm',
  urgent: 'bg-bg-card border-danger/30 shadow-sm',
}
interface CardProps extends HTMLAttributes<HTMLDivElement> { variant?: Variant }

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, variant = 'default', ...props }, ref) => (
  <div ref={ref} className={cn('rounded-xl border p-5 transition-all duration-200', variants[variant], className)} {...props} />
))
Card.displayName = 'Card'
