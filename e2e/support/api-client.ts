import { request } from '@playwright/test'
import { URLS } from '../config/env.ts'
import { EVENT_TYPE, SEX, SPECIES } from './domain.ts'
import { retry } from './retry.ts'
import type { APIRequestContext, APIResponse } from '@playwright/test'
import type { EventTypeKey, SexKey, SpeciesKey } from './domain.ts'
import type { UploadFile } from './files.ts'
import type { TestUser } from './users.ts'

export type AnimalInput = {
  species: SpeciesKey
  name?: string
  sex?: SexKey
  breed?: string
  color?: string
  distinguishingMarks?: string
  transponderCode?: string
  birthDate?: string
  signature?: string
  photos?: Array<UploadFile>
  mainPhotoIndex?: number
}

export type EventInput = {
  type: EventTypeKey
  occurredOn: string
  description: string
}

export type HealthRecordInput = {
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
const CONNECTION_REFUSED = /ECONNREFUSED/

export function mainPhotoOf(animal: ApiAnimal) {
  const photo = animal.photos.find(({ id }) => id === animal.mainPhotoId)
  if (!photo) throw new Error(`Animal ${animal.id} has no main photo`)
  return photo
}

export class ApiClient {
  private constructor(
    private readonly context: APIRequestContext,
    readonly user: TestUser,
  ) {}

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

  async nextSignature(species: SpeciesKey) {
    const body = await this.read<{ signature: string }>(
      'Fetching the next free signature',
      () =>
        this.context.get('/animals/signature', {
          params: { species: SPECIES[species] },
        }),
    )
    return body.signature
  }

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
        shouldRetry: (error) =>
          !input.signature &&
          error instanceof ApiError &&
          SIGNATURE_TAKEN.test(error.message),
      },
    )
  }

  async createAnimals(inputs: Array<AnimalInput>) {
    const created: Array<SeededAnimal> = []
    for (const input of inputs) created.push(await this.createAnimal(input))
    return created
  }

  getAnimal(id: string) {
    return this.read<ApiAnimal>(`Fetching animal ${id}`, () =>
      this.context.get(`/animals/${id}`),
    )
  }

  async getAnimalStatus(id: string) {
    const response = await this.context.get(`/animals/${id}`)
    return response.status()
  }

  async listAnimals(keyWordSearch?: string) {
    const body = await this.read<{
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

  async fetchReport(
    endpoint: string,
    params: Record<string, string | number> = {},
  ) {
    return retry(
      async () => {
        const response = await this.context.get(`/reports/${endpoint}`, {
          params,
        })
        if (!response.ok()) {
          throw new ApiError(
            response.status(),
            `report ${endpoint} answered ${response.status()}`,
          )
        }
        return response.body()
      },
      {
        description: `Fetching report ${endpoint}`,
        shouldRetry: (error) =>
          !(error instanceof ApiError) || error.status >= 500,
      },
    )
  }

  private read<T>(description: string, perform: () => Promise<APIResponse>) {
    return this.send<T>(description, perform, { repeatable: true })
  }

  private send<T = unknown>(
    description: string,
    perform: () => Promise<APIResponse>,
    { repeatable = false } = {},
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
        shouldRetry: (error) => {
          if (error instanceof ApiError)
            return repeatable && error.status >= 500
          return repeatable || CONNECTION_REFUSED.test(String(error))
        },
      },
    )
  }
}
