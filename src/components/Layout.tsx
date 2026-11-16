import { useEffect, useState } from 'react'
import { BarChart3, Calculator, Clock, History, Settings, ShoppingCart, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { useDemo } from '@/store/demo-store'
import type { VistaId } from '@/types'

interface LayoutProps {
  vista: VistaId
  onVista: (vista: VistaId) => void
  children: ReactNode
}

const VISTAS: {
  id: VistaId
  nombre: string
  descripcion: string
  icono: typeof ShoppingCart
}[] = [
  {
    id: 'comandas',
    nombre: 'Tomar Comandas',
    descripcion: 'Crear nuevas comandas',
    icono: ShoppingCart,
  },
  { id: 'caja', nombre: 'Caja', descripcion: 'Procesar pagos y liberar mesas', icono: Calculator },
  {
    id: 'historial',
    nombre: 'Historial',
    descripcion: 'Ver historial de comandas',
    icono: History,
  },
  {
    id: 'reportes',
    nombre: 'Reportes',
    descripcion: 'Ver estadísticas de ventas',
    icono: BarChart3,
  },
  {
    id: 'administracion',
    nombre: 'Administración',
    descripcion: 'Gestionar sistema y productos',
    icono: Settings,
  },
]

const horaActual = () =>
  new Date().toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })

export default function Layout({ vista, onVista, children }: LayoutProps) {
  const { comandasAbiertas } = useDemo()
  const [hora, setHora] = useState(horaActual)
  const actual = VISTAS.find((item) => item.id === vista) ?? VISTAS[0]
  const IconoVista = actual.icono

  useEffect(() => {
    const intervalo = window.setInterval(() => setHora(horaActual()), 1000)
    return () => window.clearInterval(intervalo)
  }, [])

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-secondary-800 hidden md:block whitespace-nowrap">
                Montis Cloud - Sistema de Comandas
              </h1>
              <h1 className="text-lg font-bold text-secondary-800 md:hidden whitespace-nowrap">
                Montis Cloud
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex items-center space-x-2 pr-3 border-r border-secondary-200">
                <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-secondary-500" />
                </div>
                <div className="leading-tight whitespace-nowrap">
                  <div className="text-[13px] font-medium text-secondary-800">
                    Diana Milena Segura Lavao
                  </div>
                  <div className="text-[11px] text-secondary-500">Administrador</div>
                </div>
                <div className="flex items-center space-x-1 pl-2 text-[13px] text-secondary-600 whitespace-nowrap shrink-0">
                  <Clock className="w-3.5 h-3.5 text-secondary-400" />
                  <span className="tabular-nums">{hora}</span>
                </div>
              </div>

              <nav className="hidden lg:flex space-x-0.5">
                {VISTAS.map((item) => {
                  const Icon = item.icono
                  return (
                    <button
                      key={item.id}
                      onClick={() => onVista(item.id)}
                      className={`flex items-center space-x-1.5 px-2 py-2 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
                        vista === item.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.nombre}</span>
                      {item.id === 'caja' && comandasAbiertas.length > 0 && (
                        <span className="ml-0.5 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold">
                          {comandasAbiertas.length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-primary-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <IconoVista size={16} />
            <span className="text-sm font-medium">{actual.nombre}</span>
            <span className="text-primary-200">•</span>
            <span className="text-sm text-primary-200">{actual.descripcion}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full flex-1">{children}</main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-secondary-500">
            Montis Cloud - Sistema de Comandas v3.0 © 2026
          </div>
        </div>
      </footer>
    </div>
  )
}
