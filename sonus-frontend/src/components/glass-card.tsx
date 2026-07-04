'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: 'default' | 'heavy' | 'light' | 'card';
  glow?: 'none' | 'primary' | 'accent';
  hover?: boolean;
  children?: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', glow = 'none', hover = false, children, ...props }, ref) => {
    const variantClasses = {
      default: 'glass',
      heavy: 'glass-heavy',
      light: 'glass-light',
      card: 'glass-card',
    };

    const glowClasses = {
      none: '',
      primary: 'glow-primary',
      accent: 'glow-accent',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-xl overflow-hidden',
          variantClasses[variant],
          glowClasses[glow],
          hover && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
          className
        )}
        whileHover={hover ? { y: -4 } : undefined}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };