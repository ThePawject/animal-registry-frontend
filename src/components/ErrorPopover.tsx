import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

type ErrorPopoverProps = {
  error?: string
}
export function ErrorPopover({ error }: ErrorPopoverProps) {
  return (
    <Popover open={!!error}>
      <PopoverTrigger></PopoverTrigger>
      <PopoverContent className="mt-4">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </PopoverContent>
    </Popover>
  )
}
