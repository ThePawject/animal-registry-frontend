import { TriangleAlertIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export default function EmptyMunicipalitiesNotice({
  children,
}: {
  children?: ReactNode
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900"
    >
      <div className="flex items-center gap-2 text-lg font-semibold">
        <TriangleAlertIcon className="size-5 shrink-0" />
        Brak gmin – uzupełnij listę
      </div>
      <p>
        Przy dodawaniu i edycji każdego zwierzęcia trzeba wskazać gminę, w
        której zostało znalezione, oraz gminę zlecającą jego pobyt. Dopóki lista
        gmin jest pusta, nie da się wybrać żadnej z nich, a zwierzęcia nie
        będzie można zapisać.
      </p>
      <p>
        Dodaj gminy, z którymi współpracuje schronisko, a potem będziesz je
        wybierać z listy.
      </p>
      {children}
    </div>
  )
}
