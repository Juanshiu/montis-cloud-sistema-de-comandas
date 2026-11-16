import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  titulo: string
  subtitulo?: string
  onCerrar: () => void
  children: ReactNode
  pie?: ReactNode
  ancho?: 'md' | 'lg' | 'xl'
}

const ANCHOS = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ titulo, subtitulo, onCerrar, children, pie, ancho = 'md' }: ModalProps) {
  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPresionar)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPresionar)
      document.body.style.overflow = overflowAnterior
    }
  }, [onCerrar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/50 p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div
        className={`animate-scale-in flex max-h-[90vh] w-full ${ANCHOS[ancho]} flex-col overflow-hidden rounded-xl bg-white shadow-2xl`}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-secondary-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-secondary-800">{titulo}</h2>
            {subtitulo && <p className="text-sm text-secondary-500">{subtitulo}</p>}
          </div>
          <button
            className="ml-auto rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {pie && (
          <div className="flex items-center gap-3 border-t border-secondary-200 bg-secondary-25 px-6 py-4">
            {pie}
          </div>
        )}
      </div>
    </div>
  )
}
