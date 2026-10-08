import { request } from '@playwright/test'
import { URLS } from '../config/env.ts'
import { EVENT_TYPE, SEX, SPECIES } from './domain.ts'
import { retry } from './retry.ts'
import type { APIRequestContext, APIResponse } from '@playwright/test'
import type { EventTypeKey, SexKey, SpeciesKey } from './domain.ts'
import type { UploadFile } from './files.ts'
import type { TestUser } from './users.ts'

/**
 * Talks to the backend directly, as a given user.
 *
 * Tests use it to arrange data (a spec about editing should not depend on
 * the create form working) and to assert on what was actually persisted.
 * The UI under test is never driven through this client.
 */

export type AnimalInput = {
  species: SpeciesKey
  name?: string
  sex?: SexKey
  breed?: string
  color?: string
  distinguishingMarks?: string
  transponderCode?: string
  /** ISO date, `YYYY-MM-DD`. */
  birthDate?: string
  /** Explicit `YYYY/NNNN`; the next free one is generated when omitted. */
  signature?: string
  photos?: Array<UploadFile>
  mainPhotoIndex?: number
}

export type EventInput = {
  type: EventTypeKey
  /** ISO date, `YYYY-MM-DD`. */
  occurredOn: string
  description: string
}

export type HealthRecordInput = {
  /** ISO date, `YYYY-MM-DD`. */
  occurredOn: string
  description: string
  document?: UploadFile
}

export type ApiPhoto = { id: string; url: string; fileName: string }

export type ApiEvent = {
  id: string
  type: number
  occurredOn: string
  description: string
  performedBy: string
}

export type ApiHealthRecord = {
  id: string
  occurredOn: string
  description: string
  performedBy: string
  document: { id: string; fileName: string; url: string } | null
}

export type ApiAnimal = {
  id: string
  signature: string
  transponderCode: string | null
  name: string | null
  color: string
  breed: string
  distinguishingMarks: string
  species: number
  sex: number
  birthDate: string | null
  isInShelter: boolean
  shelterId: string
  mainPhotoId: string | null
  photos: Array<ApiPhoto>
  events: Array<ApiEvent>
  healthRecords: Array<ApiHealthRecord>
}

/** The animal as created, plus the input it was created from. */
export type SeededAnimal = AnimalInput & { id: string; signature: string }

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

const SIGNATURE_TAKEN = /already in use/i

export class ApiClient {
  private constructor(
    private readonly context: APIRequestContext,
    readonly user: TestUser,
  ) {}

  /** Signs `user` in against the mock identity provider and returns a client. */
  static async forUser(user: TestUser) {
    const accessToken = await retry(
      async () => {
        const context = await request.newContext()
        try {
          const response = await context.post(`${URLS.auth}/e2e/token`, {
            data: { id: user.id, email: user.email, roles: user.roles },
          })
          if (!response.ok()) {
            throw new Error(`token endpoint answered ${response.status()}`)
          }
          return ((await response.json()) as { access_token: string })
            .access_token
        } finally {
          await context.dispose()
        }
      },
      { description: `Minting an API token for ${user.email}` },
    )

    const context = await request.newContext({
      baseURL: URLS.backend,
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    })
    return new ApiClient(context, user)
  }

  async dispose() {
    await this.context.dispose()
  }

  // -- animals --------------------------------------------------------------

  async nextSignature(species: SpeciesKey) {
    const body = await this.send<{ signature: string }>(
      'Fetching the next free signature',
      () =>
        this.context.get('/animals/signature', {
          params: { species: SPECIES[species] },
        }),
    )
    return body.signature
  }

  /**
   * Creates an animal. Without an explicit signature the next free one is
   * used; if a concurrent test grabbed it first, a new one is fetched and the
   * request is repeated.
   */
  async createAnimal(input: AnimalInput): Promise<SeededAnimal> {
    return retry(
      async () => {
        const signature =
          input.signature ?? (await this.nextSignature(input.species))

        const form = new FormData()
        form.append('species', String(SPECIES[input.species]))
        form.append('sex', String(SEX[input.sex ?? 'unknown']))
        form.append('signature', signature)
        form.append('color', input.color ?? '')
        form.append('breed', input.breed ?? '')
        form.append('distinguishingMarks', input.distinguishingMarks ?? '')
        form.append('mainPhotoIndex', String(input.mainPhotoIndex ?? 0))
        if (input.name) form.append('name', input.name)
        if (input.birthDate) form.append('birthDate', input.birthDate)
        if (input.transponderCode) {
          form.append('transponderCode', input.transponderCode)
        }
        ;(input.photos ?? []).forEach((photo, index) => {
          form.append(
            `photos[${index}]`,
            new File([new Uint8Array(photo.buffer)], photo.name, {
              type: photo.mimeType,
            }),
          )
        })

        const body = await this.send<{ animalId: string }>(
          `Creating animal "${input.name ?? signature}"`,
          () => this.context.post('/animals', { multipart: form }),
        )
        return { ...input, id: body.animalId, signature }
      },
      {
        description: `Creating animal "${input.name ?? '(unnamed)'}"`,
        // Only a signature race is worth repeating, and only when the
        // signature was ours to pick.
        shouldRetry: (error) =>
          !input.signature &&
          error instanceof ApiError &&
          SIGNATURE_TAKEN.test(error.message),
      },
    )
  }

  /** Creates animals one after another so signatures stay sequential. */
  async createAnimals(inputs: Array<AnimalInput>) {
    const created: Array<SeededAnimal> = []
    for (const input of inputs) created.push(await this.createAnimal(input))
    return created
  }

  getAnimal(id: string) {
    return this.send<ApiAnimal>(`Fetching animal ${id}`, () =>
      this.context.get(`/animals/${id}`),
    )
  }

  /** Status code of a read, for asserting on access rules. */
  async getAnimalStatus(id: string) {
    const response = await this.context.get(`/animals/${id}`)
    return response.status()
  }

  async listAnimals(keyWordSearch?: string) {
    const body = await this.send<{
      items: Array<Omit<ApiAnimal, 'photos' | 'events' | 'healthRecords'>>
      totalCount: number
    }>('Listing animals', () =>
      this.context.get('/animals', {
        params: {
          page: 1,
          pageSize: 100,
          ...(keyWordSearch ? { keyWordSearch } : {}),
        },
      }),
    )
    return body
  }

  // -- events ---------------------------------------------------------------

  async addEvent(animalId: string, input: EventInput) {
    await this.send(`Adding a "${input.type}" event`, () =>
      this.context.post(`/animals/${animalId}/events`, {
        data: {
          type: EVENT_TYPE[input.type],
          occurredOn: input.occurredOn,
          description: input.description,
        },
      }),
    )
  }

  // -- health records -------------------------------------------------------

  async addHealthRecord(animalId: string, input: HealthRecordInput) {
    const form = new FormData()
    form.append('OccurredOn', input.occurredOn)
    form.append('Description', input.description)
    if (input.document) {
      form.append(
        'DocumentFile',
        new File([new Uint8Array(input.document.buffer)], input.document.name, {
          type: input.document.mimeType,
        }),
      )
    }
    await this.send('Adding a health record', () =>
      this.context.post(`/animals/${animalId}/health`, { multipart: form }),
    )
  }

  // -- plumbing -------------------------------------------------------------

  /**
   * Sends a request, repeating it while the backend is unreachable or
   * answers 5xx. Client errors (4xx) are real answers and surface at once.
   */
  private send<T = unknown>(
    description: string,
    perform: () => Promise<APIResponse>,
  ): Promise<T> {
    return retry(
      async () => {
        const response = await perform()
        if (response.ok()) {
          const text = await response.text()
          return (text ? JSON.parse(text) : undefined) as T
        }
        throw new ApiError(
          response.status(),
          `${description} failed with HTTP ${response.status()}: ${await response.text()}`,
        )
      },
      {
        description,
        shouldRetry: (error) =>
          !(error instanceof ApiError) || error.status >= 500,
      },
    )
  }
}
