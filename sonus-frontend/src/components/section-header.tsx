'use client';

import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  href?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, href, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      {href && (
        <Link to={href}>
          <motion.span 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ x: 2 }}
          >
            Show all
            <ChevronRight className="w-4 h-4" />
          </motion.span>
        </Link>
      )}
      {action}
    </div>
  );
}