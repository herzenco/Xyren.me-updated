import { Variants } from 'framer-motion'

/**
 * Reusable animation variants for floating effects
 * All animations respect prefers-reduced-motion preference
 */

export const floatUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 2.5,
      ease: 'easeInOut',
    },
  },
}

export const floatDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 2.5,
      ease: 'easeInOut',
    },
  },
}

export const floatLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 3,
      ease: 'easeInOut',
    },
  },
}

export const floatRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 3,
      ease: 'easeInOut',
    },
  },
}

export const floatRotate: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotate: -2,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 3,
      ease: 'easeInOut',
    },
  },
}

export const containerVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}
