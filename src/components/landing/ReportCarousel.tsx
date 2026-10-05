import { useState } from 'react'
import { Download, ExternalLink } from 'lucide-react'
import { SAMPLE_REPORTS } from './reports-data'
import {
  CarouselControls,
  RollingText,
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
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function pagesNoun(pages: number) {
  if (pages === 1) return 'strona'
  const lastTwo = pages % 100
  const last = pages % 10
  const usesPlural = last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)
  return usesPlural ? 'strony' : 'stron'
}

const pagesLabel = (pages: number) => `${pages} ${pagesNoun(pages)}`

export function ReportCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const { current, direction } = useCarouselSelection(api)
  const autoplay = useCarouselAutoplay(api)
  const report = SAMPLE_REPORTS[current]
  const Icon = report.icon

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true, align: 'center' }}
      plugins={[autoplay]}
      className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12"
    >
      <div className="flex min-h-88 flex-col lg:min-h-96">
        <SlideCounter
          current={current}
          total={SAMPLE_REPORTS.length}
          direction={direction}
        />
        <SlideIcon slideKey={report.id} className="mt-5">
          <Icon className="size-6" />
        </SlideIcon>
        <SlideText slideKey={report.id}>
          <SlideTextItem>
            <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {report.title}
            </h3>
          </SlideTextItem>
          <SlideTextItem>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              {report.description}
            </p>
          </SlideTextItem>
        </SlideText>

        <div className="mt-auto pt-6">
          <p className="text-sm font-medium text-slate-500">
            <span className="sr-only">
              Plik PDF, {pagesLabel(report.pages)}
            </span>
            <span className="flex items-center gap-1" aria-hidden>
              Plik PDF,
              <RollingText
                value={String(report.pages)}
                direction={direction}
                className="tabular-nums"
              />
              <RollingText
                value={pagesNoun(report.pages)}
                direction={direction}
              />
            </span>
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              asChild
              className="bg-emerald-800 text-white hover:bg-emerald-900"
            >
              <a href={report.file} download>
                <Download />
                Pobierz PDF
              </a>
            </Button>
            <Button asChild variant="outline" className="border-slate-300">
              <a href={report.file} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Otwórz w nowej karcie
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <CarouselContent className="items-center py-2">
          {SAMPLE_REPORTS.map((item, index) => (
            <CarouselItem
              key={item.id}
              className="basis-3/5 sm:basis-2/5 lg:basis-[46%]"
            >
              <a
                href={item.file}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Otwórz w nowej karcie: ${item.title} (PDF, ${pagesLabel(item.pages)})`}
                onClick={(event) => {
                  if (index === current) return
                  event.preventDefault()
                  api?.scrollTo(index)
                }}
                className={cn(
                  'group relative block aspect-[210/297] overflow-hidden rounded-xl border bg-white transition-all duration-300',
                  index === current
                    ? 'border-slate-200 shadow-xl shadow-slate-900/15 sm:scale-100'
                    : 'border-slate-200/70 opacity-55 shadow-md shadow-slate-900/5 hover:opacity-80 sm:scale-92',
                )}
              >
                <img
                  src={item.preview}
                  alt={`Strona raportu: ${item.title}`}
                  width={item.previewWidth}
                  height={item.previewHeight}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="block size-full object-cover object-top"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-slate-900/80 py-3 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <ExternalLink className="size-4" />
                  {index === current
                    ? 'Otwórz pełny raport'
                    : 'Pokaż ten raport'}
                </span>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls
          api={api}
          current={current}
          labels={SAMPLE_REPORTS.map((item) => item.title)}
          className="mt-6"
        />
      </div>
    </Carousel>
  )
}
