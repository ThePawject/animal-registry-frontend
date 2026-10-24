import { useEffect, useRef, useState } from 'react'
import { getAppScrollContainer } from '@/lib/navigation'

const ACTIVE_CHAPTER_OFFSET = 120

export const useActiveChapter = () => {
  const articleRef = useRef<HTMLElement>(null)
  const [activeId, setActiveId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const headings = Array.from(
      articleRef.current?.querySelectorAll('h2') ?? [],
    )
    const scrollContainer = getAppScrollContainer()
    if (headings.length === 0 || !scrollContainer) return

    const updateActiveChapter = () => {
      const isAtBottom =
        scrollContainer.clientHeight + scrollContainer.scrollTop >=
        scrollContainer.scrollHeight - 2
      const passedHeadings = headings.filter(
        (heading) =>
          heading.getBoundingClientRect().top <= ACTIVE_CHAPTER_OFFSET,
      )
      const activeHeading = isAtBottom
        ? headings.at(-1)
        : (passedHeadings.at(-1) ?? headings[0])
      setActiveId(activeHeading?.id)
    }

    updateActiveChapter()
    scrollContainer.addEventListener('scroll', updateActiveChapter, {
      passive: true,
    })
    window.addEventListener('resize', updateActiveChapter)

    return () => {
      scrollContainer.removeEventListener('scroll', updateActiveChapter)
      window.removeEventListener('resize', updateActiveChapter)
    }
  }, [])

  return { articleRef, activeId }
}
