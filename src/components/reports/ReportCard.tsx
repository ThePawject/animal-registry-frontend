import { LucideLoaderCircle } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface ReportCardProps {
  title: string
  description: string
  onSubmit: () => void
  isPending: boolean
  error?: string | null
  disabled?: boolean
  children?: ReactNode
}

export default function ReportCard({
  title,
  description,
  onSubmit,
  isPending,
  error,
  disabled,
  children,
}: ReportCardProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onSubmit()
  }

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <CardHeader className="p-4 shadow-md">
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-4 flex-1 flex flex-col"
      >
        <div className="space-y-4">{children}</div>

        {error && (
          <p role="alert" className="text-sm text-red-500 font-medium">
            {error}
          </p>
        )}

        <div className="flex gap-4 pt-4 mt-auto">
          <Button
            type="submit"
            className="flex-1 h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isPending || disabled}
          >
            {isPending ? (
              <>
                <LucideLoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                Generowanie...
              </>
            ) : (
              'Generuj raport'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
