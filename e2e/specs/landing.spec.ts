import { URLS } from '../config/env.ts'
import { CONTACT_EMAIL } from '../pages/landing.page.ts'
import { PanelPage } from '../pages/panel.page.ts'
import { PDF_MAGIC } from '../support/files.ts'
import { expect, test } from '../support/fixtures.ts'

test.use({ signedIn: false })

const FEATURE_SLIDES = [
  'Rejestr zwierząt',
  'Karta zwierzęcia z galerią',
  'Historia zdarzeń',
  'Raporty PDF',
  'Karty zdrowia i dokumenty',
  'Konta dla pracowników',
]

const REPORT_SLIDES = [
  { title: 'Zrzut repozytorium zwierząt', file: 'raport-pelny-rejestr.pdf' },
  { title: 'Raport wybranych zwierząt', file: 'raport-wybrane-zwierzeta.pdf' },
]

const AUTOPLAY_INTERVAL_MS = 5_000

test.describe('Landing page', () => {
  test.beforeEach(async ({ landing }) => {
    await landing.goto()
  })

  test('presents the product to an anonymous visitor', async ({
    landing,
    page,
  }) => {
    await expect(page).toHaveTitle(/MojeSchronisko\.pl/)
    await expect(landing.heroHeading).toBeVisible()

    await test.step('every section of the page is rendered', async () => {
      for (const heading of [
        'Dwa schroniska pracują na naszym rejestrze',
        'Wszystko, czego schronisko potrzebuje na co dzień',
        'Porozmawiajmy o Waszym schronisku',
      ]) {
        await expect(page.getByRole('heading', { name: heading })).toBeVisible()
      }
      await expect(landing.section('compliance')).toBeVisible()
      await expect(landing.section('free')).toBeVisible()
    })

    await test.step('shelters using the app link to their own sites', async () => {
      const shelterSite = page.getByRole('link', { name: 'kundelek.rsoz.org' })
      await expect(shelterSite).toHaveAttribute(
        'href',
        'http://kundelek.rsoz.org/',
      )
      await expect(shelterSite).toHaveAttribute('target', '_blank')
    })
  })

  test('navigation bar scrolls to the matching section', async ({
    landing,
  }) => {
    for (const section of ['features', 'compliance', 'free'] as const) {
      await test.step(`"${section}" link`, async () => {
        await landing.navLink(section).click()
        await landing.expectScrolledTo(section)
      })
    }
  })

  test('hero call-to-action buttons lead to features and contact', async ({
    landing,
    page,
  }) => {
    const hero = page.locator('#gora')

    await hero.getByRole('link', { name: 'Zobacz funkcje' }).click()
    await landing.expectScrolledTo('features')

    await landing.goto()
    await hero.getByRole('link', { name: 'Skontaktuj się' }).click()
    await landing.expectScrolledTo('contact')
  })

  test('every "Skontaktuj się" button leads to the contact section', async ({
    landing,
    page,
  }) => {
    const callsToAction = [
      { where: 'navigation bar', scope: landing.nav },
      { where: 'hero', scope: page.locator('#gora') },
      { where: '"free of charge" section', scope: landing.section('free') },
    ]
    for (const { where, scope } of callsToAction) {
      await test.step(where, async () => {
        await landing.goto()
        await scope.getByRole('link', { name: 'Skontaktuj się' }).click()
        await landing.expectScrolledTo('contact')
      })
    }
  })

  test('the logo scrolls back to the top', async ({ landing, page }) => {
    await landing.navLink('free').click()
    await landing.expectScrolledTo('free')

    await landing.nav.getByRole('link', { name: 'MojeSchronisko.pl' }).click()

    await expect(page).toHaveURL(/#gora$/)
    await expect(landing.heroHeading).toBeInViewport()
  })

  test('the compliance section links to the regulation it refers to', async ({
    landing,
  }) => {
    const regulation = landing.section('compliance').getByRole('link', {
      name: 'Treść rozporządzenia (PDF, isap.sejm.gov.pl)',
    })

    await expect(regulation).toHaveAttribute(
      'href',
      /isap\.sejm\.gov\.pl.*\.pdf$/,
    )
    await expect(regulation).toHaveAttribute('target', '_blank')
    await expect(regulation).toHaveAttribute('rel', /noopener/)
  })

  test('contact section offers the e-mail address as a link and to copy', async ({
    landing,
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await test.step('the address opens a pre-filled e-mail', async () => {
      const href = await landing.contactEmailLink.getAttribute('href')
      expect(href).toContain(`mailto:${CONTACT_EMAIL}?`)
      expect(decodeURIComponent(href ?? '')).toContain(
        'subject=Zapytanie o eRejestr MojeSchronisko.pl',
      )
      expect(decodeURIComponent(href ?? '')).toContain('Nazwa schroniska:')
    })

    await test.step('the copy button puts the address on the clipboard', async () => {
      await landing.copyEmailButton.click()
      await expect(landing.copyEmailButton).toHaveText('Skopiowano')
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        CONTACT_EMAIL,
      )
    })

    await test.step('the confirmation disappears after a moment', async () => {
      await expect(landing.copyEmailButton).toHaveText('Skopiuj adres e-mail')
    })
  })

  test('feature carousel can be browsed with arrows and dots', async ({
    landing,
  }) => {
    const carousel = landing.featureCarousel
    const total = FEATURE_SLIDES.length
    await carousel.pauseAutoplay()

    await expect(carousel.dots).toHaveCount(total)
    await carousel.expectSlide(1, total)
    await expect(carousel.title).toHaveText(FEATURE_SLIDES[0])

    await test.step('next arrow advances one slide', async () => {
      await carousel.nextButton.click()
      await carousel.expectSlide(2, total)
      await expect(carousel.title).toHaveText(FEATURE_SLIDES[1])
    })

    await test.step('a dot jumps straight to its slide', async () => {
      await carousel.dot(FEATURE_SLIDES[4]).click()
      await carousel.expectSlide(5, total)
      await expect(carousel.title).toHaveText(FEATURE_SLIDES[4])
      await expect(carousel.dot(FEATURE_SLIDES[4])).toHaveAttribute(
        'aria-current',
        'true',
      )
    })

    await test.step('previous arrow goes back one slide', async () => {
      await carousel.previousButton.click()
      await carousel.expectSlide(4, total)
      await expect(carousel.title).toHaveText(FEATURE_SLIDES[3])
    })

    await test.step('the carousel wraps around at the end', async () => {
      await carousel.dot(FEATURE_SLIDES[total - 1]).click()
      await carousel.expectSlide(total, total)
      await carousel.nextButton.click()
      await carousel.expectSlide(1, total)
    })
  })

  test('feature carousel advances on its own and pauses under the pointer', async ({
    landing,
    page,
  }) => {
    const carousel = landing.featureCarousel
    const total = FEATURE_SLIDES.length
    await carousel.root.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)

    await test.step('it moves to the next slide by itself', async () => {
      await carousel.expectSlide(1, total)
      await carousel.expectSlide(2, total)
    })

    await test.step('hovering it keeps the current slide in place', async () => {
      await carousel.pauseAutoplay()
      const shown = await carousel.counter.innerText()
      await page.waitForTimeout(AUTOPLAY_INTERVAL_MS * 1.5)
      await expect(carousel.counter).toHaveText(shown)
    })
  })

  test('a feature screenshot opens enlarged in a dialog', async ({
    landing,
    page,
  }) => {
    const alt =
      'Lista zwierząt w panelu schroniska z wyszukiwaniem, filtrami i statusami'
    await landing.featureCarousel.pauseAutoplay()

    await page.getByRole('button', { name: `Powiększ zrzut: ${alt}` }).click()

    await expect(landing.screenshotDialog).toBeVisible()
    const enlarged = landing.screenshotDialog.getByAltText(alt)
    await expect(enlarged).toBeVisible()
    await expect(enlarged).toHaveJSProperty('complete', true)

    await landing.screenshotDialog
      .getByRole('button', { name: 'Close' })
      .click()
    await expect(landing.screenshotDialog).toBeHidden()
  })

  test('sample reports can be browsed and downloaded as PDF', async ({
    landing,
    page,
    request,
  }) => {
    const carousel = landing.reportCarousel
    const downloadLink = carousel.root.getByRole('link', {
      name: 'Pobierz PDF',
    })
    const openLink = carousel.root.getByRole('link', {
      name: 'Otwórz w nowej karcie',
      exact: true,
    })
    await carousel.pauseAutoplay()

    for (const [index, report] of REPORT_SLIDES.entries()) {
      await test.step(`report "${report.title}"`, async () => {
        if (index > 0) await carousel.dot(report.title).click()
        await expect(carousel.title).toHaveText(report.title)

        const href = `/landing/reports/${report.file}`
        await expect(downloadLink).toHaveAttribute('href', href)
        await expect(downloadLink).toHaveAttribute('download', '')
        await expect(openLink).toHaveAttribute('href', href)
        await expect(openLink).toHaveAttribute('target', '_blank')

        const response = await request.get(`${URLS.frontend}${href}`)
        expect(response.status()).toBe(200)
        const body = await response.body()
        expect(body.subarray(0, PDF_MAGIC.length).toString('latin1')).toBe(
          PDF_MAGIC,
        )
      })
    }

    await test.step('clicking a neighbouring preview brings that report forward', async () => {
      const next = { title: 'Raport zwierząt z zakresem dat' }
      await carousel.root
        .getByRole('link', {
          name: new RegExp(`^Otwórz w nowej karcie: ${next.title} \\(PDF`),
        })
        .click()
      await expect(carousel.title).toHaveText(next.title)

      await carousel.dot(REPORT_SLIDES[1].title).click()
      await expect(carousel.title).toHaveText(REPORT_SLIDES[1].title)
    })

    await test.step('clicking "Pobierz PDF" downloads the file', async () => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadLink.click(),
      ])
      expect(download.suggestedFilename()).toBe(REPORT_SLIDES[1].file)
    })
  })

  test('footer links to contact, the panel and the regulation', async ({
    landing,
    auth,
    page,
  }) => {
    await expect(
      landing.footer.getByRole('link', { name: CONTACT_EMAIL }),
    ).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`)

    const regulation = landing.footer.getByRole('link', {
      name: 'Rozporządzenie (PDF)',
    })
    await expect(regulation).toHaveAttribute('href', /isap\.sejm\.gov\.pl/)
    await expect(regulation).toHaveAttribute('target', '_blank')

    await landing.footer.getByRole('link', { name: 'Napisz do nas' }).click()
    await landing.expectScrolledTo('contact')

    await test.step('"Panel schroniska" leads to the login-protected panel', async () => {
      await landing.footer
        .getByRole('link', { name: 'Panel schroniska' })
        .click()
      await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
      await auth.expectLoginCard()
    })
  })

  test('"Zaloguj się" sends the visitor to the identity provider', async ({
    landing,
    mockLogin,
  }) => {
    await landing.signInButton.click()
    await mockLogin.expectOpen()
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('section links live behind a collapsible menu', async ({
      landing,
    }) => {
      await expect(landing.navLink('features')).toBeHidden()
      await expect(landing.mobileMenu).toBeHidden()

      await test.step('the toggle opens the menu', async () => {
        await landing.menuToggle.click()
        await expect(landing.menuToggle).toHaveAttribute(
          'aria-expanded',
          'true',
        )
        await expect(landing.mobileMenu.getByRole('link')).toHaveText([
          'Funkcje',
          'Zgodność z prawem',
          'Bezpłatność',
        ])
      })

      await test.step('choosing a section closes the menu and scrolls', async () => {
        await landing.mobileMenu
          .getByRole('link', { name: 'Zgodność z prawem' })
          .click()
        await expect(landing.mobileMenu).toBeHidden()
        await landing.expectScrolledTo('compliance')
      })
    })
  })
})
