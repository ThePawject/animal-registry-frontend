import { XIcon } from 'lucide-react'
import { DialogClose } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ModalCloseButtonProps {
  onClick?: () => void
  className?: string
}

export function ModalCloseButton({
  onClick,
  className,
}: ModalCloseButtonProps) {
  return (
    <DialogClose asChild>
      <button
        type="button"
        onClick={onClick}
        aria-label="Close"
        className={cn(
          'absolute z-20 top-4 right-4 rounded-full focus:ring-2 focus:ring-ring focus:outline-none bg-red-600 hover:bg-red-700 p-2 shadow-md',
          className,
        )}
      >
        <XIcon className="w-5 h-5 text-white" />
      </button>
    </DialogClose>
  )
}
