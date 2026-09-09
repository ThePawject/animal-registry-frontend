import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { ScreenshotPanel } from './Screenshot'
import { FEATURES } from './features-data'
import {
  CarouselControls,
  SlideCounter,
  SlideIcon,
  SlideText,
  SlideTextItem,
  useCarouselAutoplay,
  useCarouselSelection,
} from './CarouselControls'
import type { CarouselApi } from '@/components/ui/carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

export function FeatureCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const { current, direction } = useCarouselSelection(api)
  const autoplay = useCarouselAutoplay(api)
  const feature = FEATURES[current]
  const Icon = feature.icon

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      plugins={[autoplay]}
      className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12"
    >
      <div className="min-h-70 sm:min-h-64 lg:min-h-80">
        <SlideCounter
          current={current}
          total={FEATURES.length}
          direction={direction}
        />
        <SlideIcon slideKey={feature.title} className="mt-5">
          <Icon className="size-6" />
        </SlideIcon>
        <SlideText slideKey={feature.title}>
          <SlideTextItem>
            <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {feature.title}
            </h3>
          </SlideTextItem>
          <SlideTextItem>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              {feature.description}
            </p>
          </SlideTextItem>
        </SlideText>
        <p className="mt-6 hidden items-center gap-2 text-sm text-slate-500 lg:flex">
          <Maximize2 className="size-4" />
          Kliknij zrzut, aby zobaczyć go w pełnym rozmiarze
        </p>
      </div>

      <div className="min-w-0">
        <CarouselContent>
          {FEATURES.map(({ title, screenshot }, index) => (
            <CarouselItem key={title}>
              <ScreenshotPanel screenshot={screenshot} priority={index === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls
          api={api}
          current={current}
          labels={FEATURES.map((item) => item.title)}
          className="mt-6"
        />
      </div>
    </Carousel>
  )
}
