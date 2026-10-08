import { URLS } from '../config/env.ts'
import { AnimalDetailsPage } from '../pages/animal-details.page.ts'
import { MockLoginPage } from '../pages/auth.page.ts'
import { LandingPage } from '../pages/landing.page.ts'
import { PanelPage } from '../pages/panel.page.ts'
import {
  expireSession,
  newAnonymousContext,
  signInThroughUi,
} from '../support/auth-session.ts'
import { buildAnimal } from '../support/data.ts'
import { expect, test } from '../support/fixtures.ts'
import { waitForBackendResponse } from '../support/network.ts'
import {
  createColleagueOf,
  createShelterUser,
  createUserWithoutRole,
} from '../support/users.ts'

test.describe('Signing in', () => {
  test.use({ signedIn: false })

  test('the panel is hidden behind a login card for anonymous visitors', async ({
    page,
    auth,
    panel,
  }) => {
    await page.goto(PanelPage.path)

    await auth.expectLoginCard()
    await expect(panel.table).toBeHidden()
    await expect(panel.addAnimalLink).toBeHidden()
  })

  test('deep links into the panel are protected as well', async ({
    page,
    auth,
    animalForm,
  }) => {
    await page.goto('/create')

    await auth.expectLoginCard()
    await expect(animalForm.createButton).toBeHidden()
  })

  test('the login card links back to the landing page', async ({
    page,
    auth,
    landing,
  }) => {
    await page.goto(PanelPage.path)
    await auth.expectLoginCard()

    await auth.learnMoreLink.click()

    await expect(page).toHaveURL(`${URLS.frontend}${LandingPage.path}`)
    await expect(landing.heroHeading).toBeVisible()
  })

  test('staff sign in from the landing page and land in their shelter panel', async ({
    landing,
    mockLogin,
    auth,
    panel,
    page,
  }) => {
    const user = createShelterUser()

    await landing.goto()
    await landing.signInButton.click()
    await mockLogin.signInAs(user)

    await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
    await auth.expectSignedInTo(user)
    await panel.expectEmpty()
  })

  test('a signed-in user opening the landing page is sent to the panel', async ({
    page,
    auth,
  }) => {
    const user = createShelterUser()
    await signInThroughUi(page, user)
    await auth.expectSignedInTo(user)

    await page.goto(LandingPage.path)

    await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
    await auth.expectSignedInTo(user)
  })

  test('the session survives a page reload', async ({ page, auth, panel }) => {
    const user = createShelterUser()
    await signInThroughUi(page, user)
    await auth.expectSignedInTo(user)

    await page.reload()

    await auth.expectSignedInTo(user)
    await panel.expectLoaded()
  })

  test('logging out returns to the landing page and locks the panel again', async ({
    page,
    auth,
    landing,
  }) => {
    const user = createShelterUser()
    await signInThroughUi(page, user)
    await auth.expectSignedInTo(user)

    await auth.logout()

    await expect(page).toHaveURL(`${URLS.frontend}${LandingPage.path}`)
    await expect(landing.heroHeading).toBeVisible()

    await test.step('the panel asks to log in again', async () => {
      await page.goto(PanelPage.path)
      await auth.expectLoginCard()
    })
  })

  test('an account without a role sees an explanation instead of the panel', async ({
    page,
    auth,
    panel,
    landing,
  }) => {
    await signInThroughUi(page, createUserWithoutRole())

    await expect(auth.noAccessHeading).toBeVisible()
    await expect(
      page.getByText(
        'Musisz poczekać, aż administrator nada Ci odpowiednią rolę.',
      ),
    ).toBeVisible()
    await expect(panel.table).toBeHidden()

    await test.step('the only way forward is to sign out', async () => {
      await auth.backToLoginButton.click()
      await expect(page).toHaveURL(`${URLS.frontend}${LandingPage.path}`)
      await expect(landing.heroHeading).toBeVisible()
    })
  })
})

test.describe('Shelter isolation', () => {
  test.use({ shelter: 'isolated' })

  test('staff only ever see animals of their own shelter', async ({
    api,
    apiFor,
    user,
    panel,
    auth,
    animalDetails,
    page,
  }) => {
    const ownAnimal = await api.createAnimal(buildAnimal())
    const otherShelter = await apiFor(createShelterUser('other'))
    const foreignAnimal = await otherShelter.createAnimal(buildAnimal())

    await panel.goto()
    await auth.expectSignedInTo(user)

    await test.step('the register lists only the own animal', async () => {
      await panel.expectAnimals([ownAnimal.name!])
    })

    await test.step('searching for the other shelter’s animal finds nothing', async () => {
      await panel.search(foreignAnimal.name!)
      await panel.expectEmpty()
    })

    await test.step('its card cannot be opened by guessing the address', async () => {
      expect(await api.getAnimalStatus(foreignAnimal.id)).toBe(404)

      const lookup = waitForBackendResponse(page, {
        method: 'GET',
        pathname: `/animals/${foreignAnimal.id}`,
      })
      await page.goto(AnimalDetailsPage.path(foreignAnimal.id))

      expect((await lookup).status()).toBe(404)
      await expect(page.getByText(foreignAnimal.name!)).toBeHidden()
      await expect(animalDetails.editLink).toBeHidden()
    })
  })

  test('colleagues of one shelter share the same register', async ({
    api,
    user,
    browser,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const colleague = createColleagueOf(user)

    const context = await newAnonymousContext(browser)
    try {
      const page = await context.newPage()
      await signInThroughUi(page, colleague)

      const panel = new PanelPage(page)
      await panel.expectAnimals([animal.name!])
    } finally {
      await context.close()
    }
  })
})

test.describe('Expired session', () => {
  test('asks to log in again in a dialog and resumes where the user was', async ({
    page,
    auth,
    panel,
    user,
    context,
  }) => {
    await panel.goto()
    await auth.expectSignedInTo(user)

    await expireSession(page)
    await page.reload()

    await expect(auth.sessionExpiredDialog).toBeVisible()
    await expect(auth.sessionExpiredDialog).toContainText(
      'Zaloguj się, aby otrzymać dostęp do elektronicznego rejestru zwierząt.',
    )

    await test.step('logging in happens in a popup, the page stays put', async () => {
      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        auth.sessionExpiredDialog
          .getByRole('button', { name: 'Zaloguj się' })
          .click(),
      ])
      await new MockLoginPage(popup).signInAs(user)

      await expect(auth.sessionExpiredDialog).toBeHidden()
      await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
      await auth.expectSignedInTo(user)
      await panel.expectLoaded()
    })
  })
})
