import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClick: () => void
  loading?: boolean
}

export default function LoginModal({
  open,
  onOpenChange,
  onClick,
  loading,
}: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-emerald-800">
            Witaj w Panelu Elektronicznego Rejestru Zwierząt!
          </DialogTitle>
          <DialogDescription className="text-emerald-700 mb-4">
            Zaloguj się, aby otrzymać dostęp do elektronicznego rejestru
            zwierząt.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
            onClick={onClick}
            disabled={loading}
          >
            Zaloguj się
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
