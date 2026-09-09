class IntersectionObserverStub {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ target, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve() {}

  disconnect() {}

  takeRecords(): Array<IntersectionObserverEntry> {
    return []
  }
}

globalThis.IntersectionObserver =
  IntersectionObserverStub as unknown as typeof IntersectionObserver

class ResizeObserverStub {
  observe() {}

  unobserve() {}

  disconnect() {}
}

globalThis.ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver
