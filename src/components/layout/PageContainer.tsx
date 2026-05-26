import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer } from '../../animations/variants';

interface Props {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: Props) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className={`space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </motion.div>
  );
}

export default PageContainer;
