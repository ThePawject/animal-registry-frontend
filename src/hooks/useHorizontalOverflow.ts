import { useEffect, useRef, useState } from 'react'

export function useHorizontalOverflow<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const update = () => {
      setHasOverflow(
        element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
      )
    }

    update()
    element.addEventListener('scroll', update, { passive: true })

    const observer = new ResizeObserver(update)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)

    return () => {
      element.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  return { ref, hasOverflow }
}
