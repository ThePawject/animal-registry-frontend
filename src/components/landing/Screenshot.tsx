import { Maximize2 } from 'lucide-react'
import type { Screenshot as ScreenshotData } from './screenshots'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type ScreenshotDialogProps = {
  screenshot: ScreenshotData
  triggerClassName?: string
  children: React.ReactNode
}

function ScreenshotDialog({
  screenshot,
  triggerClassName,
  children,
}: ScreenshotDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        className={cn('group block w-full cursor-zoom-in', triggerClassName)}
        aria-label={`Powiększ zrzut: ${screenshot.alt}`}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[min(1500px,calc(100%-2rem))] p-4 sm:p-6">
        <DialogTitle className="sr-only">{screenshot.alt}</DialogTitle>
        <img
          src={screenshot.src}
          alt={screenshot.alt}
          width={screenshot.width}
          height={screenshot.height}
          className="h-auto w-full rounded-lg border border-slate-200"
        />
      </DialogContent>
    </Dialog>
  )
}

type ScreenshotProps = {
  screenshot: ScreenshotData
  className?: string
  priority?: boolean
}

export function Screenshot({
  screenshot,
  className,
  priority = false,
}: ScreenshotProps) {
  return (
    <ScreenshotDialog
      screenshot={screenshot}
      triggerClassName={cn(
        'relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 transition-shadow hover:shadow-2xl',
        className,
      )}
    >
      <img
        src={screenshot.src}
        alt={screenshot.alt}
        width={screenshot.width}
        height={screenshot.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="block h-auto w-full"
      />
      <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        <Maximize2 className="size-3.5" />
        Powiększ
      </span>
    </ScreenshotDialog>
  )
}

export function ScreenshotThumb({
  screenshot,
}: {
  screenshot: ScreenshotData
}) {
  return (
    <ScreenshotDialog
      screenshot={screenshot}
      triggerClassName="relative h-40 overflow-hidden rounded-t-xl border-b border-slate-200 bg-slate-100 sm:h-44"
    >
      <img
        src={screenshot.src}
        alt={screenshot.alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]',
          screenshot.thumbPosition ?? 'object-left-top',
        )}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors group-hover:bg-slate-900/25">
        <span className="flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-medium text-slate-800 opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3.5" />
          Powiększ
        </span>
      </span>
    </ScreenshotDialog>
  )
}

export function ScreenshotPanel({
  screenshot,
  priority = false,
}: ScreenshotProps & { priority?: boolean }) {
  return (
    <ScreenshotDialog
      screenshot={screenshot}
      triggerClassName="relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 transition-shadow hover:shadow-2xl sm:p-4"
    >
      <img
        src={screenshot.src}
        alt={screenshot.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="size-full rounded-lg object-contain"
      />
      <span className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-1.5 rounded-md bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 sm:right-5 sm:bottom-5">
        <Maximize2 className="size-3.5" />
        Powiększ
      </span>
    </ScreenshotDialog>
  )
}
