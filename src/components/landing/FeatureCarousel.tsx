import { useEffect, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { ScreenshotPanel } from './Screenshot'
import { FEATURES } from './features-data'
import type { CarouselApi } from '@/components/ui/carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

export function FeatureCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return

    const syncCurrent = () => setCurrent(api.selectedScrollSnap())
    syncCurrent()
    api.on('select', syncCurrent)

    return () => {
      api.off('select', syncCurrent)
    }
  }, [api])

  return (
    <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
      <CarouselContent>
        {FEATURES.map(
          ({ icon: Icon, title, description, screenshot }, index) => (
            <CarouselItem key={title}>
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 tabular-nums">
                    {String(index + 1).padStart(2, '0')} /{' '}
                    {String(FEATURES.length).padStart(2, '0')}
                  </p>
                  <div className="mt-5 flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    {title}
                  </h3>
                  <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
                    {description}
                  </p>
                  <p className="mt-6 hidden items-center gap-2 text-sm text-slate-500 lg:flex">
                    <Maximize2 className="size-4" />
                    Kliknij zrzut, aby zobaczyć go w pełnym rozmiarze
                  </p>
                </div>
                <ScreenshotPanel
                  screenshot={screenshot}
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ),
        )}
      </CarouselContent>
      <div className="mt-10 flex items-center justify-center gap-5">
        <CarouselPrevious className="static size-10 translate-y-0 border-slate-300" />
        <div className="flex items-center gap-2">
          {FEATURES.map((feature, index) => (
            <button
              key={feature.title}
              type="button"
              onClick={() => api?.scrollTo(index)}
              aria-label={`Przejdź do funkcji: ${feature.title}`}
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
    </Carousel>
  )
}
