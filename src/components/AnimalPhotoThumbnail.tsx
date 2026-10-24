import type { Animal } from '@/api/animals/types'
import { cn } from '@/lib/utils'

interface AnimalPhotoThumbnailProps {
  animal: Pick<Animal, 'name' | 'mainPhoto'>
  className?: string
}

export default function AnimalPhotoThumbnail({
  animal,
  className,
}: AnimalPhotoThumbnailProps) {
  if (animal.mainPhoto?.url) {
    return (
      <img
        src={animal.mainPhoto.url}
        alt={animal.name || 'Zdjęcie zwierzęcia'}
        className={cn('size-12 rounded-lg object-cover', className)}
      />
    )
  }
  return (
    <div
      className={cn(
        'flex size-12 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-400',
        className,
      )}
    >
      Brak
    </div>
  )
}
