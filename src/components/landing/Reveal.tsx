import { motion, useReducedMotion } from 'framer-motion'

const VIEWPORT = { once: true, amount: 0.25, margin: '0px 0px -10% 0px' }
const EASE = [0.16, 1, 0.3, 1] as const
const DURATION = 0.6
const OFFSET = 24
const STAGGER = 0.1

const TAGS = {
  div: motion.div,
  ul: motion.ul,
  li: motion.li,
} as const

type RevealProps = {
  as?: keyof typeof TAGS
  className?: string
  delay?: number
  children: React.ReactNode
}

export function Reveal({
  as = 'div',
  className,
  delay = 0,
  children,
}: RevealProps) {
  const reduceMotion = useReducedMotion()
  const Component = TAGS[as]

  return (
    <Component
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: OFFSET }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DURATION, delay, ease: EASE }}
    >
      {children}
    </Component>
  )
}

export function RevealGroup({ as = 'div', className, children }: RevealProps) {
  const reduceMotion = useReducedMotion()
  const Component = TAGS[as]

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduceMotion ? 0 : STAGGER,
            delayChildren: 0.05,
          },
        },
      }}
    >
      {children}
    </Component>
  )
}

export function RevealItem({ as = 'div', className, children }: RevealProps) {
  const reduceMotion = useReducedMotion()
  const Component = TAGS[as]

  return (
    <Component
      className={className}
      variants={{
        hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: OFFSET },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION, ease: EASE },
        },
      }}
    >
      {children}
    </Component>
  )
}
