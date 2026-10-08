import { Buffer } from 'node:buffer'
import { deflateSync } from 'node:zlib'

export type UploadFile = {
  name: string
  mimeType: string
  buffer: Buffer
}

type Rgb = readonly [red: number, green: number, blue: number]

export const COLORS = {
  red: [220, 38, 38],
  green: [22, 163, 74],
  blue: [37, 99, 235],
  yellow: [234, 179, 8],
} as const satisfies Record<string, Rgb>

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }
  return value >>> 0
})

function crc32(data: Buffer) {
  let crc = 0xffffffff
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(typeAndData))
  return Buffer.concat([length, typeAndData, checksum])
}

export function pngImage(
  name: string,
  { color = COLORS.green as Rgb, width = 48, height = 32 } = {},
): UploadFile {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header.writeUInt8(8, 8)
  header.writeUInt8(2, 9)

  const row = Buffer.concat([
    Buffer.from([0]),
    Buffer.alloc(width * 3, Buffer.from(color)),
  ])
  const pixels = Buffer.concat(Array.from({ length: height }, () => row))

  return {
    name,
    mimeType: 'image/png',
    buffer: Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pngChunk('IHDR', header),
      pngChunk('IDAT', deflateSync(pixels)),
      pngChunk('IEND', Buffer.alloc(0)),
    ]),
  }
}

export function pdfDocument(name: string, text = 'E2E document'): UploadFile {
  const body = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] >> endobj',
    `% ${text}`,
    'trailer << /Root 1 0 R >>',
    '%%EOF',
  ].join('\n')
  return { name, mimeType: 'application/pdf', buffer: Buffer.from(body) }
}

export function textFile(name: string, content = 'not allowed'): UploadFile {
  return { name, mimeType: 'text/plain', buffer: Buffer.from(content) }
}

export function withSize(file: UploadFile, bytes: number): UploadFile {
  if (file.buffer.length >= bytes) return file
  return {
    ...file,
    buffer: Buffer.concat([
      file.buffer,
      Buffer.alloc(bytes - file.buffer.length),
    ]),
  }
}

export const PDF_MAGIC = '%PDF-'
export const MEGABYTE = 1024 * 1024
