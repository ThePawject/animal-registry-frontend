import { request } from '@playwright/test'
import { AUTH, URLS } from '../config/env.ts'
import { AuthScreens } from '../pages/auth.page.ts'
import { expectImageLoaded } from '../pages/components.ts'
import { PanelPage } from '../pages/panel.page.ts'
import { ApiClient } from '../support/api-client.ts'
import { newAnonymousContext } from '../support/auth-session.ts'
import { daysAgo } from '../support/data.ts'
import { pdfDocument } from '../support/files.ts'
import { expect, test } from '../support/fixtures.ts'
import { GuideWriter } from './guide-writer.ts'
import { drawIllustrations } from './illustrations.ts'
import type { AnimalInput, SeededAnimal } from '../support/api-client.ts'
import type { UploadFile } from '../support/files.ts'
import type { TestUser } from '../support/users.ts'

const SHELTER_ID = 'Schronisko_Azyl'

const GUIDE_USER: TestUser = {
  id: 'e2e|guide',
  email: 'anna.kowalska@schronisko-azyl.pl',
  roles: [`${AUTH.shelterRolePrefix}${SHELTER_ID}`],
  shelterId: SHELTER_ID,
  shelterName: SHELTER_ID.replace(/_/g, ' '),
}

test.use({ user: GUIDE_USER })

const guide = new GuideWriter(
  'Przewodnik po MojeSchronisko.pl',
  'Ten przewodnik pokazuje krok po kroku, jak prowadzić elektroniczny rejestr zwierząt: od zalogowania, przez dodawanie zwierząt, wydarzeń i kart zdrowia, po pobieranie raportów. Na zrzutach ekranu czerwoną ramką zaznaczono miejsce, w które należy kliknąć. Kliknij dowolny zrzut, aby go powiększyć.',
)

const NEW_ANIMAL = {
  name: 'Tofik',
  transponderCode: '616093900045871',
  breed: 'Mieszaniec',
  distinguishingMarks: 'Jedno ucho oklapnięte',
  color: 'Rudy',
} as const

const NEW_EVENT = 'Spacer po lesie, 40 minut. Dobrze chodzi na smyczy.'
const NEW_HEALTH_RECORD = 'Kontrola po szczepieniu, stan ogólny dobry.'

let photos: Record<string, UploadFile>
let burek: SeededAnimal

function registerAnimals(): Array<AnimalInput> {
  return [
    {
      species: 'dog',
      name: 'Azor',
      sex: 'male',
      breed: 'Owczarek niemiecki',
      color: 'Czarny podpalany',
      birthDate: daysAgo(6 * 365),
      photos: [photos.azor],
    },
    {
      species: 'cat',
      name: 'Luna',
      sex: 'female',
      breed: 'Europejska krótkowłosa',
      color: 'Szylkretowa',
      distinguishingMarks: 'Biała końcówka ogona',
      birthDate: daysAgo(2 * 365),
      photos: [photos.luna],
    },
    {
      species: 'dog',
      name: 'Figa',
      sex: 'female',
      breed: 'Jamnik',
      color: 'Brązowy',
      birthDate: daysAgo(4 * 365),
      photos: [photos.figa],
    },
    {
      species: 'cat',
      name: 'Mruczek',
      sex: 'male',
      breed: 'Europejska krótkowłosa',
      color: 'Bury',
      birthDate: daysAgo(5 * 365),
      photos: [photos.mruczek],
    },
    {
      species: 'dog',
      name: 'Reksio',
      sex: 'male',
      breed: 'Mieszaniec',
      color: 'Biało-brązowy',
      distinguishingMarks: 'Brązowa łata na oku',
      birthDate: daysAgo(3 * 365),
      photos: [photos.reksio],
    },
    {
      species: 'cat',
      name: 'Filemon',
      sex: 'male',
      breed: 'Europejska krótkowłosa',
      color: 'Biały',
      birthDate: daysAgo(300),
      photos: [photos.filemon],
    },
    {
      species: 'dog',
      name: 'Sonia',
      sex: 'female',
      breed: 'Labrador',
      color: 'Biszkoptowy',
      birthDate: daysAgo(7 * 365),
      photos: [photos.sonia],
    },
    {
      species: 'cat',
      name: 'Kleo',
      sex: 'female',
      breed: 'Mieszaniec',
      color: 'Czarny',
      photos: [photos.kleo],
    },
    {
      species: 'dog',
      name: 'Borys',
      sex: 'male',
      breed: 'Mieszaniec',
      color: 'Szary',
      birthDate: daysAgo(9 * 365),
      photos: [photos.borys],
    },
    {
      species: 'cat',
      name: 'Pusia',
      sex: 'female',
      breed: 'Perski',
      color: 'Kremowy',
      birthDate: daysAgo(8 * 365),
      photos: [photos.pusia],
    },
    {
      species: 'dog',
      name: 'Kora',
      sex: 'female',
      breed: 'Mieszaniec',
      color: 'Czarny',
      distinguishingMarks: 'Biała łata na piersi',
      birthDate: daysAgo(400),
      photos: [photos.kora],
    },
    {
      species: 'dog',
      name: 'Burek',
      sex: 'male',
      breed: 'Mieszaniec',
      color: 'Brązowy',
      distinguishingMarks: 'Blizna na lewym uchu',
      transponderCode: '616093900012345',
      birthDate: daysAgo(3 * 365 + 40),
      photos: [photos.burek, photos.burek2, photos.burek3],
    },
  ]
}

async function removeAnimals(api: ApiClient) {
  const context = await request.newContext()
  try {
    const tokenResponse = await context.post(`${URLS.auth}/e2e/token`, {
      data: {
        id: GUIDE_USER.id,
        email: GUIDE_USER.email,
        roles: GUIDE_USER.roles,
      },
    })
    const { access_token: accessToken } = (await tokenResponse.json()) as {
      access_token: string
    }

    for (;;) {
      const { items } = await api.listAnimals()
      if (items.length === 0) break
      for (const animal of items) {
        await context.delete(`${URLS.backend}/animals/${animal.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      }
    }
  } finally {
    await context.dispose()
  }
}

async function seedShelter() {
  const api = await ApiClient.forUser(GUIDE_USER)
  try {
    await removeAnimals(api)

    const animals = await api.createAnimals(registerAnimals())
    const byName = (name: string) =>
      animals.find((animal) => animal.name === name)!

    await api.addEvent(byName('Reksio').id, {
      type: 'adoption',
      occurredOn: daysAgo(5),
      description: 'Adopcja, umowa nr 14/2026',
    })
    await api.addEvent(byName('Pusia').id, {
      type: 'pickedUpByOwner',
      occurredOn: daysAgo(12),
      description: 'Odebrana przez właścicielkę',
    })

    burek = byName('Burek')
    const events = [
      [
        'admission',
        60,
        'Znaleziony przy ul. Leśnej, przywieziony przez straż miejską',
      ],
      ['quarantineStart', 60, 'Kojec kwarantanny nr 2'],
      ['deworming', 58, 'Podano preparat na odrobaczenie'],
      ['rabiesVaccination', 46, 'Szczepienie, seria A1234'],
      ['quarantineEnd', 45, 'Bez objawów chorobowych'],
      ['newKennelNumber', 45, 'Przeniesiony do kojca nr 7'],
      ['weighing', 10, '18,4 kg'],
    ] as const
    for (const [type, days, description] of events) {
      await api.addEvent(burek.id, {
        type,
        occurredOn: daysAgo(days),
        description,
      })
    }

    await api.addHealthRecord(burek.id, {
      occurredOn: daysAgo(59),
      description: 'Badanie wstępne przy przyjęciu, lekka niedowaga',
    })
    await api.addHealthRecord(burek.id, {
      occurredOn: daysAgo(30),
      description: 'Badanie krwi, wyniki w normie',
      document: pdfDocument('wyniki-badania-krwi.pdf'),
    })
  } finally {
    await api.dispose()
  }
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  await GuideWriter.clearOutput()

  const fur = {
    brown: { fur: '#b45309', accent: '#78350f' },
    black: { fur: '#374151', accent: '#111827' },
    sand: { fur: '#e7c98a', accent: '#b8860b' },
    grey: { fur: '#9ca3af', accent: '#6b7280' },
    white: { fur: '#f3f4f6', accent: '#fbcfe8' },
    ginger: { fur: '#ea8a3c', accent: '#c2410c' },
  }
  photos = await drawIllustrations(browser, {
    azor: { kind: 'dog', ...fur.black, background: '#dbeafe' },
    luna: { kind: 'cat', ...fur.ginger, background: '#e0e7ff' },
    figa: { kind: 'dog', ...fur.brown, background: '#fef3c7' },
    mruczek: { kind: 'cat', ...fur.grey, background: '#dcfce7' },
    reksio: {
      kind: 'dog',
      ...fur.white,
      accent: '#b45309',
      background: '#fee2e2',
    },
    filemon: { kind: 'cat', ...fur.white, background: '#cffafe' },
    sonia: { kind: 'dog', ...fur.sand, background: '#d1fae5' },
    kleo: {
      kind: 'cat',
      ...fur.black,
      accent: '#f9a8d4',
      background: '#fef9c3',
    },
    borys: { kind: 'dog', ...fur.grey, background: '#ffe4e6' },
    pusia: {
      kind: 'cat',
      ...fur.sand,
      accent: '#fbcfe8',
      background: '#ede9fe',
    },
    kora: { kind: 'dog', ...fur.black, background: '#ccfbf1' },
    burek: { kind: 'dog', ...fur.brown, background: '#d1fae5' },
    burek2: { kind: 'dog', ...fur.brown, background: '#fde68a' },
    burek3: { kind: 'dog', ...fur.brown, background: '#bfdbfe' },
    tofik: { kind: 'dog', ...fur.ginger, background: '#e0f2fe' },
    tofik2: { kind: 'dog', ...fur.ginger, background: '#fce7f3' },
  })

  await seedShelter()
})

test.afterAll(async () => {
  await guide.write()
})

test('Logowanie', async ({ browser, page, panel, auth }) => {
  guide.chapter(
    'Logowanie',
    'Rejestr jest dostępny tylko dla zalogowanych pracowników schroniska. Każde schronisko widzi wyłącznie swoje zwierzęta.',
  )

  const context = await newAnonymousContext(browser)
  try {
    const anonymousPage = await context.newPage()
    const anonymous = new AuthScreens(anonymousPage)
    await anonymousPage.goto(PanelPage.path)
    await anonymous.expectLoginCard()

    await guide.step(
      anonymousPage,
      'Otwórz stronę logowania',
      'Wejdź na adres panelu schroniska i kliknij **Zaloguj się**. Na następnym ekranie podaj adres e-mail i hasło otrzymane od administratora.',
      { highlight: anonymous.loginCardSignIn },
    )
  } finally {
    await context.close()
  }

  await panel.goto()
  await auth.expectSignedInTo(GUIDE_USER)
  await expectImageLoaded(panel.row('Burek').photo)

  await guide.step(
    page,
    'Sprawdź, czy jesteś w swoim schronisku',
    'Po zalogowaniu otwiera się lista zwierząt. W lewym górnym rogu widzisz nazwę swojego schroniska. Kliknięcie w nią z dowolnego miejsca aplikacji zawsze wraca do listy zwierząt.',
    {
      highlight: auth.header.getByRole('link', {
        name: `Panel ${GUIDE_USER.shelterName}`,
      }),
    },
  )

  await guide.step(
    page,
    'Wyloguj się po zakończeniu pracy',
    'Gdy kończysz pracę, zwłaszcza na wspólnym komputerze, kliknij **Wyloguj się** w prawym górnym rogu.',
    { highlight: auth.logoutButton, area: auth.header },
  )

  guide.note(
    'Jeśli po zalogowaniu widzisz komunikat „Nie masz przypisanej roli”, Twoje konto nie zostało jeszcze przypisane do schroniska. Skontaktuj się z administratorem.',
  )
})

test('Lista zwierząt', async ({ page, panel }) => {
  guide.chapter(
    'Lista zwierząt',
    'Lista zwierząt to ekran startowy panelu. Znajdziesz tu wszystkie zwierzęta wpisane do rejestru schroniska, także te, które już je opuściły.',
  )

  await panel.goto()
  await expectImageLoaded(panel.row('Burek').photo)

  await guide.step(
    page,
    'Przejrzyj listę',
    'Każdy wiersz to jedno zwierzę: zdjęcie główne, oznaczenie, imię, rasa, znaki szczególne, gatunek, płeć, umaszczenie, wiek, status i data dodania.',
  )

  await panel.searchInfoButton.click()
  await expect(panel.searchInfoPopover).toBeVisible()
  await guide.step(
    page,
    'Sprawdź, po czym można szukać',
    'Kliknij ikonę informacji obok pola wyszukiwania, aby zobaczyć listę danych, po których działa wyszukiwarka: oznaczenie, numer chipa, imię, umaszczenie, rasa, znaki szczególne, a także opisy wydarzeń i osoby, które je wpisały.',
    {
      highlight: panel.searchInfoButton,
      area: [panel.searchInput, panel.searchInfoPopover],
    },
  )
  await page.keyboard.press('Escape')
  await expect(panel.searchInfoPopover).toBeHidden()

  await panel.search('mieszaniec')
  await guide.step(
    page,
    'Wyszukaj zwierzę',
    'Wpisz szukany tekst w polu **Szukaj zwierząt...**. Lista odświeża się sama po chwili, nie trzeba niczego zatwierdzać. Na przykładzie wpisano rasę „mieszaniec”.',
    { highlight: panel.searchInput },
  )
  await panel.search('')

  await panel.filterBySpecies('Kot')
  await panel.filterByStatus('W schronisku')
  await guide.step(
    page,
    'Zawęź listę filtrami',
    'Listy **Gatunek** i **Status** ograniczają tabelę do psów lub kotów oraz do zwierząt przebywających w schronisku albo poza nim. Filtry można łączyć ze sobą i z wyszukiwaniem. Aby wrócić do pełnej listy, wybierz **Wszystkie gatunki** i **Wszystkie statusy**.',
    { highlight: [panel.speciesFilter, panel.statusFilter] },
  )
  await panel.filterBySpecies('Wszystkie gatunki')
  await panel.filterByStatus('Wszystkie statusy')

  await panel.setPageSize(10)
  await panel.expectPage(1, 2)
  await guide.step(
    page,
    'Przechodź między stronami',
    'Pod tabelą wybierasz, ile wierszy ma się mieścić na stronie (10, 20 lub 50), i przechodzisz strzałkami do następnej, poprzedniej, pierwszej lub ostatniej strony.',
    {
      highlight: [
        panel.pageSizeSelect,
        panel.firstPageButton,
        panel.previousPageButton,
        panel.nextPageButton,
        panel.lastPageButton,
      ],
    },
  )
  await panel.setPageSize(20)

  await guide.step(
    page,
    'Otwórz kartę zwierzęcia',
    'Kliknij **Szczegóły** na końcu wiersza, aby otworzyć kartę wybranego zwierzęcia.',
    { highlight: panel.row('Burek').detailsLink },
  )

  guide.note(
    'Adres strony zapamiętuje wyszukiwany tekst, filtry i numer strony. Możesz go skopiować i wysłać współpracownikowi, a zobaczy dokładnie tę samą listę.',
  )
})

test('Dodawanie zwierzęcia', async ({ page, panel, animalForm }) => {
  guide.chapter(
    'Dodawanie zwierzęcia',
    'Nowe zwierzę dodajesz jednym formularzem. Obowiązkowe są tylko **Gatunek** i **Oznaczenie**. Pozostałe dane możesz uzupełnić później.',
  )

  await panel.goto()
  await expectImageLoaded(panel.row('Burek').photo)
  await guide.step(
    page,
    'Kliknij „Dodaj zwierzę”',
    'Przycisk **Dodaj zwierzę** znajduje się nad listą zwierząt.',
    { highlight: panel.addAnimalLink },
  )

  await panel.addAnimalLink.click()
  await expect(animalForm.createButton).toBeVisible()
  await animalForm.fill({ ...NEW_ANIMAL, species: 'dog', sex: 'male' })
  await animalForm.birthDate.fill(daysAgo(2 * 365))
  await guide.step(
    page,
    'Uzupełnij dane zwierzęcia',
    'Wpisz imię, numer chipa, rasę, znaki szczególne, umaszczenie i datę urodzenia oraz wybierz gatunek i płeć. Jeśli zwierzę nie ma jeszcze imienia, zostaw to pole puste. Na liście będzie rozpoznawane po oznaczeniu.',
    { fullPage: true },
  )

  await animalForm.generateSignature()
  await guide.step(
    page,
    'Nadaj oznaczenie',
    'Oznaczenie to numer zwierzęcia w rejestrze w formacie **RRRR/NNNN** (rok i kolejny numer). Oznaczenie można wygenerować dopiero po wybraniu gatunku: dopóki pole **Gatunek** jest puste, przycisk **Generuj unikalne oznaczenie** jest nieaktywny. Wybierz więc najpierw gatunek, a potem kliknij ten przycisk, a aplikacja podpowie pierwszy wolny numer. Możesz też wpisać oznaczenie ręcznie. Dwa zwierzęta tego samego gatunku nie mogą mieć tego samego oznaczenia.',
    { fullPage: true, highlight: animalForm.generateSignatureButton },
  )

  await animalForm.photos.upload([photos.tofik, photos.tofik2])
  await expect(animalForm.photos.thumbnails).toHaveCount(2)
  await expectImageLoaded(animalForm.photos.preview)
  await guide.step(
    page,
    'Dodaj zdjęcia',
    'Możesz dodać do 10 zdjęć, każde o rozmiarze do 10 MB. Pierwsze dodane zdjęcie staje się zdjęciem głównym, widocznym na liście zwierząt. Kliknij miniaturę, aby wybrać zdjęcie, a następnie użyj przycisków nad podglądem: **Ustaw jako główne**, **Obróć w prawo** lub **Usuń zdjęcie**.',
    {
      fullPage: true,
      highlight: [
        animalForm.photos.setAsMainButton,
        animalForm.photos.rotateButton,
        animalForm.photos.removeButton,
      ],
    },
  )

  await guide.step(
    page,
    'Zapisz zwierzę',
    'Kliknij **Dodaj zwierzaka**. Jeśli któreś pole jest wypełnione błędnie, pod nim pojawi się czerwony komunikat i formularz nie zostanie wysłany. Przycisk **Anuluj** wraca do listy bez zapisywania.',
    { fullPage: true, highlight: animalForm.createButton },
  )

  await animalForm.submitCreate()
  await expect(page).toHaveURL(new RegExp(PanelPage.path))
  await panel.search(NEW_ANIMAL.name)
  await panel.expectAnimals([NEW_ANIMAL.name])
  await expectImageLoaded(panel.row(NEW_ANIMAL.name).photo)
  await guide.step(
    page,
    'Znajdź nowe zwierzę na liście',
    'Po zapisaniu wracasz do listy zwierząt. Nowe zwierzę jest już w rejestrze ze statusem **W schronisku**.',
    { highlight: panel.row(NEW_ANIMAL.name).root },
  )
})

test('Karta zwierzęcia', async ({ page, panel, animalDetails }) => {
  guide.chapter(
    'Karta zwierzęcia',
    'Karta zbiera w jednym miejscu wszystko, co wiadomo o zwierzęciu, i prowadzi do edycji danych, wydarzeń oraz kart zdrowia.',
  )

  await panel.goto()
  await panel.openDetails('Burek')
  await animalDetails.expectOpen(burek.id)
  await expectImageLoaded(animalDetails.mainPhoto)
  await expectImageLoaded(animalDetails.galleryPreview)

  await guide.step(
    page,
    'Zapoznaj się z kartą',
    'U góry widzisz zdjęcie główne, imię, status oraz podstawowe dane: gatunek, płeć, sygnaturę (oznaczenie), umaszczenie, rasę, znaki szczególne, datę urodzenia i datę dodania. Pola bez danych są oznaczone jako „Brak”.',
    { fullPage: true },
  )

  await guide.step(
    page,
    'Przejdź do edycji, wydarzeń lub kart zdrowia',
    'Przyciski na karcie prowadzą do kolejnych zakładek: **Edytuj dane**, **Wydarzenia** i **Medyczne**. Ścieżka nad przyciskami („Lista Zwierząt > Burek”) pozwala wrócić do listy.',
    {
      highlight: [
        animalDetails.editLink,
        animalDetails.eventsLink,
        animalDetails.medicalLink,
      ],
    },
  )

  await animalDetails.galleryThumbnails.nth(1).click()
  await expectImageLoaded(animalDetails.galleryPreview)
  await guide.step(
    page,
    'Przeglądaj galerię zdjęć',
    'W sekcji **Galeria Zdjęć** znajdziesz wszystkie zdjęcia zwierzęcia. Klikaj miniatury po prawej stronie, aby przeglądać zdjęcia po kolei. Wybrane zdjęcie pokazuje się w całości w dużym podglądzie.',
    {
      fullPage: true,
      highlight: [
        animalDetails.galleryThumbnails.nth(0),
        animalDetails.galleryThumbnails.nth(1),
        animalDetails.galleryThumbnails.nth(2),
      ],
    },
  )

  await guide.step(
    page,
    'Pobierz raport o zwierzęciu',
    'Przycisk **Pobierz raport** zapisuje na komputerze plik PDF z danymi i zdjęciami tego zwierzęcia.',
    { highlight: animalDetails.downloadReportButton },
  )

  await animalDetails.openDeleteDialog()
  await guide.step(
    page,
    'Usuń zwierzę z rejestru',
    'Przycisk **Usuń** otwiera okno z prośbą o potwierdzenie. Dopiero kliknięcie **Usuń** w tym oknie usuwa zwierzę. **Anuluj** zamyka okno bez zmian. Usunięcia nie można cofnąć, dlatego używaj go tylko dla wpisów dodanych przez pomyłkę. Gdy zwierzę opuszcza schronisko, nie usuwaj go z rejestru. Wystarczy dodać mu w zakładce **Wydarzenia** jedno z wydarzeń: **Adopcja**, **Odbiór przez właściciela**, **Wypuszczony do środowiska**, **Eutanazja** lub **Zgon**. Status zwierzęcia zmieni się wtedy na **Poza schroniskiem**, a cała jego historia zostanie w rejestrze. Jeśli zwierzę wróci, dodaj wydarzenie **Przyjęcie do schroniska**, a status wróci na **W schronisku**.',
    { highlight: animalDetails.confirmDeleteButton },
  )
  await animalDetails.cancelDeleteButton.click()
  await expect(animalDetails.deleteDialog).toBeHidden()
})

test('Edycja danych zwierzęcia', async ({
  page,
  animalDetails,
  animalForm,
}) => {
  guide.chapter(
    'Edycja danych zwierzęcia',
    'Dane i zdjęcia zwierzęcia można poprawić w każdej chwili. Formularz edycji wygląda tak samo jak formularz dodawania.',
  )

  await animalDetails.goto(burek.id)
  await expectImageLoaded(animalDetails.mainPhoto)
  await guide.step(
    page,
    'Otwórz formularz edycji',
    'Na karcie zwierzęcia kliknij **Edytuj dane**.',
    { highlight: animalDetails.editLink },
  )

  await animalDetails.editLink.click()
  await expect(animalForm.saveButton).toBeVisible()
  await expectImageLoaded(animalForm.photos.preview)
  await animalForm.fill({
    breed: 'Mieszaniec w typie labradora',
    color: 'Czekoladowy',
  })
  await guide.step(
    page,
    'Zmień dane',
    'Formularz otwiera się z zapisanymi danymi. Popraw wybrane pola. Dane nieobowiązkowe możesz też wyczyścić.',
    {
      fullPage: true,
      highlight: [animalForm.breed, animalForm.color],
    },
  )

  await animalForm.photos.select(3)
  await expectImageLoaded(animalForm.photos.preview)
  await guide.step(
    page,
    'Zmień zdjęcie główne',
    'Kliknij miniaturę zdjęcia, które ma być widoczne na liście zwierząt, a potem **Ustaw jako główne**. W tym samym miejscu dodasz nowe zdjęcia, obrócisz je lub usuniesz.',
    {
      fullPage: true,
      highlight: [
        animalForm.photos.thumbnail(3),
        animalForm.photos.setAsMainButton,
      ],
    },
  )
  await animalForm.photos.setAsMainButton.click()
  await animalForm.photos.expectMainPosition(3)

  await guide.step(
    page,
    'Zapisz zmiany',
    'Kliknij **Zapisz zmiany**. Przycisk jest aktywny dopiero wtedy, gdy coś faktycznie zmienisz. **Anuluj** odrzuca wprowadzone zmiany.',
    { fullPage: true, highlight: animalForm.saveButton },
  )

  await animalForm.submitSave()
  await animalDetails.expectOpen(burek.id)
  await animalDetails.expectDetails({ Umaszczenie: 'Czekoladowy' })
  await expectImageLoaded(animalDetails.mainPhoto)
  await guide.step(
    page,
    'Sprawdź zapisane dane',
    'Po zapisaniu wracasz na kartę zwierzęcia z nowymi danymi i nowym zdjęciem głównym.',
    { fullPage: true },
  )
})

test('Wydarzenia', async ({ page, animalDetails, events }) => {
  guide.chapter(
    'Wydarzenia',
    'Wydarzenia to historia pobytu zwierzęcia w schronisku: przyjęcie, kwarantanna, szczepienia, odrobaczenia, spacery, ważenia, adopcja i inne. To na ich podstawie powstają raporty i ustala się status zwierzęcia.',
  )

  await animalDetails.goto(burek.id)
  await expectImageLoaded(animalDetails.mainPhoto)
  await guide.step(
    page,
    'Otwórz zakładkę „Wydarzenia”',
    'Na karcie zwierzęcia kliknij **Wydarzenia**.',
    { highlight: animalDetails.eventsLink },
  )

  await animalDetails.eventsLink.click()
  await expect(events.heading).toBeVisible()
  await expect(events.rows).toHaveCount(7)
  await guide.step(
    page,
    'Przejrzyj historię',
    'Tabela pokazuje datę, typ i opis każdego wydarzenia oraz osobę, która je wpisała (**Wykonane przez**). Kliknięcie nagłówka ze strzałkami sortuje tabelę po tej kolumnie, a kolejne kliknięcie odwraca kolejność.',
    { fullPage: true },
  )

  await events.openAddForm()
  await events.fillAddForm({
    type: 'walk',
    occurredOn: daysAgo(1),
    description: NEW_EVENT,
  })
  await guide.step(
    page,
    'Dodaj wydarzenie',
    'Kliknij **Dodaj wydarzenie**, wybierz **Typ wydarzenia**, ustaw datę (domyślnie dzisiejsza, nie może być z przyszłości) i wpisz opis. Wszystkie trzy pola są wymagane. Zatwierdź przyciskiem **Zapisz**.',
    {
      fullPage: true,
      highlight: [events.addButton, events.saveButton],
    },
  )

  await events.saveButton.click()
  await expect(events.addForm).toBeHidden()
  await expect(events.row(NEW_EVENT).root).toBeVisible()
  await guide.step(
    page,
    'Sprawdź nowy wpis',
    'Nowe wydarzenie pojawia się w tabeli. W kolumnie **Wykonane przez** aplikacja sama wpisuje zalogowaną osobę.',
    { fullPage: true, highlight: events.row(NEW_EVENT).root },
  )

  const editing = await events.edit(NEW_EVENT)
  await editing.descriptionInput.fill(
    'Spacer po lesie, 60 minut. Dobrze chodzi na smyczy.',
  )
  await guide.step(
    page,
    'Popraw wydarzenie',
    'Kliknij **Edytuj** w wierszu wydarzenia. Typ, data i opis zamieniają się w pola, które możesz poprawić bezpośrednio w tabeli. Zatwierdź przyciskiem **Zapisz** albo wycofaj się przyciskiem **Anuluj**. Jednocześnie można edytować tylko jeden wiersz.',
    {
      fullPage: true,
      highlight: [editing.saveButton, editing.cancelButton],
    },
  )
  await events.saveEdit()

  await events.requestDelete('Spacer po lesie')
  await guide.step(
    page,
    'Usuń błędne wydarzenie',
    'Kliknij **Usuń** w wierszu, a następnie potwierdź w oknie, które się pojawi. **Anuluj** zostawia wydarzenie bez zmian.',
    { highlight: events.confirmDeleteButton },
  )
  await events.cancelDeleteButton.click()
  await expect(events.deleteDialog).toBeHidden()

  guide.note(
    'Wydarzenia takie jak **Adopcja** czy **Odbiór przez właściciela** zmieniają status zwierzęcia na **Poza schroniskiem**. Nie usuwaj wtedy zwierzęcia z rejestru, wystarczy dodać właściwe wydarzenie.',
  )
})

test('Karty zdrowia', async ({ page, animalDetails, healthRecords }) => {
  guide.chapter(
    'Karty zdrowia',
    'W kartach zdrowia zapisujesz badania, zabiegi i zalecenia weterynaryjne. Do każdego wpisu możesz dołączyć dokument, na przykład wynik badania.',
  )

  await animalDetails.goto(burek.id)
  await expectImageLoaded(animalDetails.mainPhoto)
  await guide.step(
    page,
    'Otwórz zakładkę „Medyczne”',
    'Na karcie zwierzęcia kliknij **Medyczne**.',
    { highlight: animalDetails.medicalLink },
  )

  await animalDetails.medicalLink.click()
  await expect(healthRecords.heading).toBeVisible()
  await expect(healthRecords.rows).toHaveCount(2)

  await healthRecords.openAddForm()
  await healthRecords.fillAddForm({
    occurredOn: daysAgo(2),
    description: NEW_HEALTH_RECORD,
    document: pdfDocument('zalecenia-weterynarza.pdf'),
  })
  await guide.step(
    page,
    'Dodaj kartę zdrowia',
    'Kliknij **Dodaj kartę zdrowia**, ustaw datę i wpisz opis. W polu **Dokument (opcjonalnie)** możesz dołączyć jeden plik PDF, DOC, DOCX, JPEG, PNG lub WEBP o rozmiarze do 10 MB. Zatwierdź przyciskiem **Zapisz**.',
    {
      fullPage: true,
      highlight: [healthRecords.addButton, healthRecords.saveButton],
    },
  )

  await healthRecords.saveButton.click()
  await expect(healthRecords.addForm).toBeHidden()
  const added = healthRecords.row(NEW_HEALTH_RECORD)
  await expect(added.root).toBeVisible()
  await guide.step(
    page,
    'Otwórz dołączony dokument',
    'Wpis pojawia się w tabeli. Kliknij nazwę pliku w kolumnie **Dokument**, aby otworzyć go w nowej karcie przeglądarki.',
    {
      fullPage: true,
      highlight: healthRecords.documentCell(added).openButton,
    },
  )

  const editing = await healthRecords.edit(NEW_HEALTH_RECORD)
  await guide.step(
    page,
    'Popraw wpis lub wymień dokument',
    'Kliknij **Edytuj** w wierszu. Możesz zmienić datę i opis, a w kolumnie **Dokument** wymienić plik (**Zmień plik**) lub go usunąć (**Usuń**). Zatwierdź przyciskiem **Zapisz**. Cały wpis usuwasz przyciskiem **Usuń**, po potwierdzeniu.',
    {
      fullPage: true,
      highlight: [editing.saveButton, editing.cancelButton],
    },
  )
  await healthRecords.cancelEdit()
})

test('Raporty', async ({ page, panel, eventReport, dateRangeReport }) => {
  guide.chapter(
    'Raporty',
    'Wszystkie raporty pobierają się jako pliki PDF gotowe do druku. Przyciski raportów znajdują się nad listą zwierząt.',
  )

  await panel.goto()
  await expectImageLoaded(panel.row('Burek').photo)
  await guide.step(
    page,
    'Znajdź przyciski raportów',
    'Nad listą zwierząt są cztery raporty: **Raport zdarzeń**, **Raport wszystkie zwierzeta**, **Raport z wybranych zwierzat** oraz **Raport zdarzen w zakresie**. Po najechaniu kursorem na przycisk zobaczysz krótki opis raportu.',
    {
      highlight: [
        panel.eventReportButton,
        panel.allAnimalsReportButton,
        panel.selectedAnimalsReportButton,
        panel.dateRangeReportButton,
      ],
    },
  )

  await guide.step(
    page,
    'Pobierz raport wszystkich zwierząt',
    'Kliknij **Raport wszystkie zwierzeta**, aby pobrać tekstowe zestawienie danych wszystkich zwierząt z rejestru (bez zdjęć). Plik zapisuje się od razu, bez dodatkowych pytań.',
    {
      highlight: panel.allAnimalsReportButton,
      area: [panel.eventReportButton, panel.dateRangeReportButton],
    },
  )

  for (const name of ['Burek', 'Kora', 'Borys']) {
    await panel.row(name).checkbox.check()
  }
  await expect(panel.selectedAnimalsReportButton).toBeEnabled()
  await guide.step(
    page,
    'Pobierz raport wybranych zwierząt',
    'Zaznacz pola wyboru przy zwierzętach, które mają trafić do raportu. Przycisk **Raport z wybranych zwierzat** staje się wtedy aktywny i pokazuje w nawiasie liczbę zaznaczonych zwierząt. Raport zawiera dane i zdjęcia wybranych zwierząt. Zaznaczenie jest pamiętane także po przejściu na kolejną stronę listy.',
    {
      highlight: [
        panel.row('Burek').checkbox,
        panel.row('Kora').checkbox,
        panel.row('Borys').checkbox,
        panel.selectedAnimalsReportButton,
      ],
    },
  )

  await panel.eventReportButton.click()
  await expect(eventReport.root).toBeVisible()
  await eventReport.period('Własny zakres dat').check()
  await eventReport.customStartDate.fill(daysAgo(60))
  await eventReport.customEndDate.fill(daysAgo(0))
  await guide.step(
    page,
    'Wygeneruj raport zdarzeń',
    'Kliknij **Raport zdarzeń** i zaznacz okresy, które mają się znaleźć w zestawieniu: ostatni tydzień, miesiąc, kwartał lub **Własny zakres dat**. Przy własnym zakresie podaj datę początkową i końcową. Kliknij **Generuj raport**.',
    { highlight: eventReport.generateButton },
  )
  await eventReport.cancelButton.click()
  await eventReport.expectClosed()

  await panel.dateRangeReportButton.click()
  await expect(dateRangeReport.root).toBeVisible()
  await dateRangeReport.setRange(daysAgo(60), daysAgo(0))
  await dateRangeReport.pick(dateRangeReport.speciesField, ['Psy'])
  await dateRangeReport.pick(dateRangeReport.eventTypeField, [
    'Przyjęcie do schroniska',
    'Adopcja',
  ])
  await guide.step(
    page,
    'Wygeneruj raport zdarzeń w zakresie dat',
    'Kliknij **Raport zdarzen w zakresie** i podaj datę początkową oraz końcową. Opcjonalnie zawęź raport do wybranych typów zdarzeń i gatunków. Puste pola oznaczają „wszystkie”. Kliknij **Generuj raport**.',
    { highlight: dateRangeReport.generateButton },
  )
  await dateRangeReport.cancelButton.click()
  await dateRangeReport.expectClosed()

  guide.note(
    'Pobrane raporty znajdziesz w folderze pobierania swojej przeglądarki, zwykle „Pobrane”.',
  )
})
