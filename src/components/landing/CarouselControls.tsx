import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Autoplay from 'embla-carousel-autoplay'
import type { CarouselApi } from '@/components/ui/carousel'
import { CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

const AUTOPLAY_DELAY = 5000

function scrollDirection(from: number, to: number, last: number) {
  if (from === last && to === 0) return 1
  if (from === 0 && to === last) return -1
  return to > from ? 1 : -1
}

export function useCarouselSelection(api: CarouselApi) {
  const [selection, setSelection] = useState({ current: 0, direction: 1 })

  useEffect(() => {
    if (!api) return

    const sync = () => {
      const next = api.selectedScrollSnap()
      const last = api.scrollSnapList().length - 1

      setSelection((previous) =>
        previous.current === next
          ? previous
          : {
              current: next,
              direction: scrollDirection(previous.current, next, last),
            },
      )
    }

    sync()
    api.on('select', sync)
    api.on('reInit', sync)

    return () => {
      api.off('select', sync)
      api.off('reInit', sync)
    }
  }, [api])

  return selection
}

export function useCarouselAutoplay(api: CarouselApi, delay = AUTOPLAY_DELAY) {
  const reduceMotion = useReducedMotion()
  const autoplay = useRef(
    Autoplay({ delay, stopOnInteraction: false, stopOnMouseEnter: true }),
  ).current

  useEffect(() => {
    if (!api) return

    if (reduceMotion) {
      autoplay.stop()
      return
    }

    const restartCountdown = () => autoplay.reset()

    api.on('select', restartCountdown)

    return () => {
      api.off('select', restartCountdown)
    }
  }, [api, autoplay, reduceMotion])

  return autoplay
}

type CarouselControlsProps = {
  api: CarouselApi
  current: number
  labels: Array<string>
  className?: string
}

export function CarouselControls({
  api,
  current,
  labels,
  className,
}: CarouselControlsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-5', className)}>
      <CarouselPrevious className="static size-10 translate-y-0 border-slate-300" />
      <div className="flex items-center gap-2">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => api?.scrollTo(index)}
            aria-label={`Przejdź do: ${label}`}
            aria-current={index === current}
            className={cn(
              'h-2 cursor-pointer rounded-full transition-all',
              index === current
                ? 'w-7 bg-emerald-700'
                : 'w-2 bg-slate-300 hover:bg-slate-400',
            )}
          />
        ))}
      </div>
      <CarouselNext className="static size-10 translate-y-0 border-slate-300" />
    </div>
  )
}

type RollingTextProps = {
  value: string
  direction: number
  className?: string
}

export function RollingText({ value, direction, className }: RollingTextProps) {
  const reduceMotion = useReducedMotion()
  const offset = 18

  return (
    <span
      className={cn(
        'relative inline-flex h-[1.5em] items-center overflow-hidden',
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduceMotion ? false : { y: direction * offset, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { y: direction * -offset, opacity: 0 }
          }
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

type SlideCounterProps = {
  current: number
  total: number
  direction: number
  className?: string
}

export function SlideCounter({
  current,
  total,
  direction,
  className,
}: SlideCounterProps) {
  const pad = (value: number) => String(value).padStart(2, '0')

  return (
    <p
      className={cn(
        'flex items-center gap-1 text-sm font-semibold text-emerald-700 tabular-nums',
        className,
      )}
    >
      <RollingText
        value={pad(current + 1)}
        direction={direction}
        className="w-6 justify-center"
      />
      <span aria-hidden>/</span>
      <span>{pad(total)}</span>
      <span className="sr-only">
        Slajd {current + 1} z {total}
      </span>
    </p>
  )
}

type SlideProps = {
  slideKey: string
  className?: string
  children: React.ReactNode
}

export function SlideIcon({ slideKey, className, children }: SlideProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        'relative size-12 rounded-xl bg-emerald-50 text-emerald-700',
        className,
      )}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={slideKey}
          className="absolute inset-0 flex items-center justify-center"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.55, rotate: -14 }
          }
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.35, rotate: 14 }
          }
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export function SlideText({ slideKey, className, children }: SlideProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={slideKey}
        className={className}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: reduceMotion ? 0 : 0.08,
              delayChildren: 0.05,
            },
          },
          exit: { opacity: 0, transition: { duration: 0.18, ease: 'easeOut' } },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function SlideTextItem({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 18, filter: 'blur(3px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
