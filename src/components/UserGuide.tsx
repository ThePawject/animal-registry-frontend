import { useMemo, useState } from 'react'
import { lexer } from 'marked'
import { Card } from './ui/card'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import type { ReactNode } from 'react'
import type { Token, Tokens } from 'marked'
import { cn } from '@/lib/utils'
import { useActiveChapter } from '@/hooks/useActiveChapter'
import guideMarkdown from '@/guide/guide.md?raw'
import imageSizes from '@/guide/image-sizes.json'

const guideImages = import.meta.glob<string>('../guide/img/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

type ImageSize = { width: number; height: number }

type GuideImage = {
  src: string
  alt: string
  size?: ImageSize
}

type GuideBlockProps = {
  token: Token
  onZoom: (image: GuideImage) => void
}

function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getGuideImage(href: string, alt: string): GuideImage {
  const sizes: Record<string, ImageSize | undefined> = imageSizes
  return {
    src: guideImages[href.replace(/^\.\//, '../guide/')] ?? href,
    alt,
    size: sizes[href.split('/').pop() ?? ''],
  }
}

function renderInline(tokens: Array<Token> = []): Array<ReactNode> {
  return tokens.map((token, index) => {
    switch (token.type) {
      case 'strong':
        return (
          <strong key={index} className="font-semibold text-slate-900">
            {renderInline(token.tokens)}
          </strong>
        )
      case 'em':
        return <em key={index}>{renderInline(token.tokens)}</em>
      case 'link':
        return (
          <a
            key={index}
            href={token.href}
            className="text-emerald-800 underline underline-offset-4"
          >
            {renderInline(token.tokens)}
          </a>
        )
      case 'text':
      case 'escape':
        return token.text
      default:
        return token.raw
    }
  })
}

function GuideBlock({ token, onZoom }: GuideBlockProps) {
  switch (token.type) {
    case 'heading': {
      const content = renderInline(token.tokens)
      if (token.depth === 1) {
        return (
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {content}
          </h1>
        )
      }
      if (token.depth === 2) {
        return (
          <h2
            id={headingId(token.text)}
            className="mt-12 scroll-mt-6 border-t border-slate-200 pt-8 text-2xl font-semibold text-emerald-900"
          >
            {content}
          </h2>
        )
      }
      return (
        <h3 className="mt-8 text-lg font-semibold text-slate-900">{content}</h3>
      )
    }
    case 'paragraph': {
      const tokens: Array<Token> = token.tokens ?? []
      if (tokens.length === 1 && tokens[0].type === 'image') {
        const image = getGuideImage(tokens[0].href, tokens[0].text)
        return (
          <button
            type="button"
            aria-label={`Powiększ zrzut: ${image.alt}`}
            onClick={() => onZoom(image)}
            className="mt-4 block max-w-full cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-shadow hover:shadow-md"
          >
            <img
              src={image.src}
              alt={image.alt}
              width={image.size?.width}
              height={image.size?.height}
              loading="lazy"
              decoding="async"
              className="block h-auto max-w-full"
            />
          </button>
        )
      }
      return (
        <p className="mt-3 leading-7 text-slate-700">{renderInline(tokens)}</p>
      )
    }
    case 'blockquote':
      return (
        <blockquote className="mt-6 flex flex-col gap-3 rounded-lg border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3">
          {(token.tokens ?? [])
            .filter(
              (child: Token): child is Tokens.Paragraph =>
                child.type === 'paragraph',
            )
            .map((child: Tokens.Paragraph, index: number) => (
              <p key={index} className="leading-7 text-slate-700">
                {renderInline(child.tokens)}
              </p>
            ))}
        </blockquote>
      )
    default:
      return null
  }
}

export default function UserGuide() {
  const tokens = useMemo(() => lexer(guideMarkdown), [])
  const [zoomedImage, setZoomedImage] = useState<GuideImage | null>(null)
  const { articleRef, activeId } = useActiveChapter()

  const chapters = tokens
    .filter(
      (token): token is Tokens.Heading =>
        token.type === 'heading' && token.depth === 2,
    )
    .map((token) => ({ id: headingId(token.text), title: token.text }))

  return (
    <div className="flex flex-col gap-8 px-4 pb-16 md:flex-row md:items-start md:px-0">
      <nav
        aria-label="Spis treści"
        className="md:sticky md:top-6 md:w-56 md:shrink-0 lg:w-64"
      >
        <Card className="gap-3 p-5">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Spis treści
          </h2>
          <ol className="flex flex-col gap-1">
            {chapters.map(({ id, title }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={id === activeId ? 'location' : undefined}
                  className={cn(
                    'block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900',
                    id === activeId &&
                      'bg-emerald-100 font-semibold text-emerald-900 hover:bg-emerald-100',
                  )}
                >
                  {title}
                </a>
              </li>
            ))}
          </ol>
        </Card>
      </nav>

      <Card className="min-w-0 flex-1 p-6 md:p-10">
        <article ref={articleRef} className="mx-auto w-full max-w-4xl">
          {tokens.map((token, index) => (
            <GuideBlock key={index} token={token} onZoom={setZoomedImage} />
          ))}
        </article>
      </Card>

      <Dialog
        open={zoomedImage !== null}
        onOpenChange={() => setZoomedImage(null)}
      >
        <DialogContent className="max-w-[min(1500px,calc(100%-2rem))] p-4 pt-12 sm:p-6 sm:pt-12">
          <DialogTitle className="sr-only">{zoomedImage?.alt}</DialogTitle>
          {zoomedImage && (
            <img
              src={zoomedImage.src}
              alt={zoomedImage.alt}
              className="mx-auto h-auto max-h-[calc(90vh-5rem)] w-auto max-w-full rounded-lg border border-slate-200 object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
