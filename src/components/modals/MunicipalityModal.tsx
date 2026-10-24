import { Building2, LucideLoaderCircle } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { FormField } from '../FormField'
import type { Municipality } from '@/api/municipalities/types'
import { MUNICIPALITY_NAME_MAX_LENGTH } from '@/api/municipalities/types'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEditMunicipality } from '@/api/municipalities/queries'
import { genericErrorMessage } from '@/lib/utils'

interface MunicipalityModalProps {
  open: boolean
  municipality: Municipality
  onClose: () => void
}

export default function MunicipalityModal({
  open,
  municipality,
  onClose,
}: MunicipalityModalProps) {
  const {
    mutateAsync: editMunicipality,
    isPending,
    error,
    reset,
  } = useEditMunicipality()

  const form = useForm({
    defaultValues: { name: municipality.name },
    onSubmit: async ({ value }) => {
      await editMunicipality({ id: municipality.id, name: value.name.trim() })
      handleClose()
    },
  })

  const handleClose = () => {
    form.reset()
    reset()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState) handleClose()
      }}
    >
      <DialogContent className="p-0 bg-transparent shadow-none border-none max-w-lg">
        <Card className="overflow-hidden py-0 gap-0">
          <div className="flex-1 p-4 shadow-md">
            <h2 className="text-2xl font-semibold">Edytuj gminę</h2>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="p-6 space-y-4"
          >
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value.trim()) return 'Nazwa gminy jest wymagana'
                  if (value.trim().length > MUNICIPALITY_NAME_MAX_LENGTH)
                    return `Nazwa gminy może mieć maksymalnie ${MUNICIPALITY_NAME_MAX_LENGTH} znaków`
                  return undefined
                },
              }}
              children={(field) => {
                return (
                  <FormField
                    icon={Building2}
                    label="Nazwa gminy"
                    error={field.state.meta.errors[0]}
                  >
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      id="Nazwa gminy"
                      className="bg-background"
                    />
                  </FormField>
                )
              }}
            />

            {error && (
              <p role="alert" className="text-sm text-red-500 font-medium">
                {genericErrorMessage}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Anuluj
                </Button>
              </DialogClose>
              <form.Subscribe
                selector={(state) => [state.canSubmit]}
                children={([canSubmit]) => (
                  <Button type="submit" disabled={!canSubmit || isPending}>
                    {isPending && (
                      <LucideLoaderCircle className="animate-spin" />
                    )}
                    Zapisz
                  </Button>
                )}
              />
            </div>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
