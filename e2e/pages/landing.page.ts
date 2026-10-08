import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export const CONTACT_EMAIL = 'biuro@mojeschronisko.pl'

export const LANDING_SECTIONS = {
  features: { link: 'Funkcje', anchor: 'funkcje' },
  compliance: { link: 'Zgodność z prawem', anchor: 'zgodnosc' },
  free: { link: 'Bezpłatność', anchor: 'bezplatnosc' },
  contact: { link: 'Skontaktuj się', anchor: 'kontakt' },
} as const

export type LandingSection = keyof typeof LANDING_SECTIONS

export class LandingCarousel {
  readonly title: Locator
  readonly counter: Locator
  readonly previousButton: Locator
  readonly nextButton: Locator
  readonly dots: Locator
  readonly slides: Locator

  constructor(readonly root: Locator) {
    this.title = root.getByRole('heading', { level: 3 })
    this.counter = root.getByText(/^Slajd \d+ z \d+$/)
    this.previousButton = root.getByRole('button', { name: 'Previous slide' })
    this.nextButton = root.getByRole('button', { name: 'Next slide' })
    this.dots = root.getByRole('button', { name: /^Przejdź do: / })
    this.slides = root.locator('[data-slot="carousel-content"]')
  }

  dot(slideTitle: string) {
    return this.root.getByRole('button', {
      name: `Przejdź do: ${slideTitle}`,
      exact: true,
    })
  }

  async expectSlide(position: number, total: number) {
    await expect(this.counter).toHaveText(`Slajd ${position} z ${total}`)
  }
}

export class LandingPage {
  static readonly path = '/'

  readonly heroHeading: Locator
  readonly nav: Locator
  readonly signInButton: Locator
  readonly menuToggle: Locator
  readonly mobileMenu: Locator

  readonly contactSection: Locator
  readonly contactEmailLink: Locator
  readonly copyEmailButton: Locator

  readonly featureCarousel: LandingCarousel
  readonly reportCarousel: LandingCarousel
  readonly screenshotDialog: Locator

  readonly footer: Locator

  constructor(readonly page: Page) {
    this.heroHeading = page.getByRole('heading', {
      level: 1,
      name: 'Cała ewidencja schroniska w jednym bezpłatnym rejestrze',
    })
    this.nav = page.getByRole('navigation').first()
    this.signInButton = this.nav.getByRole('button', { name: 'Zaloguj się' })
    this.menuToggle = this.nav.getByRole('button', {
      name: /^(Otwórz|Zamknij) menu$/,
    })
    this.mobileMenu = page.locator('header > ul')

    this.contactSection = page.locator('#kontakt')
    this.contactEmailLink = this.contactSection.getByRole('link', {
      name: CONTACT_EMAIL,
    })
    this.copyEmailButton = this.contactSection.getByRole('button', {
      name: `Skopiuj adres e-mail ${CONTACT_EMAIL}`,
    })

    const carousels = page.locator('[data-slot="carousel"]')
    this.featureCarousel = new LandingCarousel(
      page.locator('#funkcje').locator(carousels),
    )
    this.reportCarousel = new LandingCarousel(
      page.locator('#zgodnosc').locator(carousels),
    )
    this.screenshotDialog = page.getByRole('dialog')

    this.footer = page.locator('footer')
  }

  async goto() {
    await this.page.goto(LandingPage.path)
    await expect(this.heroHeading).toBeVisible()
  }

  section(section: LandingSection) {
    return this.page.locator(`#${LANDING_SECTIONS[section].anchor}`)
  }

  navLink(section: Exclude<LandingSection, 'contact'>) {
    return this.nav.getByRole('link', {
      name: LANDING_SECTIONS[section].link,
      exact: true,
    })
  }

  async expectScrolledTo(section: LandingSection) {
    await expect(this.page).toHaveURL(
      new RegExp(`#${LANDING_SECTIONS[section].anchor}$`),
    )
    await expect(this.section(section)).toBeInViewport()
  }
}
