import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Layout from '@/components/Layout'
import Login from '@/components/Login'
import ComandasView from '@/views/ComandasView'
import CajaView from '@/views/CajaView'
import HistorialView from '@/views/HistorialView'
import ReportesView from '@/views/ReportesView'
import AdministracionView from '@/views/AdministracionView'
import { DemoProvider } from '@/store/demo-store'
import type { VistaId } from '@/types'

export default function App() {
  const [autenticado, setAutenticado] = useState(false)
  const [vista, setVista] = useState<VistaId>('comandas')
  const [comandaEnCaja, setComandaEnCaja] = useState<string | undefined>(undefined)
  const [aviso, setAviso] = useState<string | null>(null)
  const temporizador = useRef<number | undefined>(undefined)

  const notificar = useCallback((mensaje: string) => {
    setAviso(mensaje)
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => setAviso(null), 4200)
  }, [])

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  const verEnCaja = useCallback((id: string) => {
    setComandaEnCaja(id)
    setVista('caja')
  }, [])

  if (!autenticado) {
    return <Login onEntrar={() => setAutenticado(true)} />
  }

  return (
    <DemoProvider>
      <Layout vista={vista} onVista={setVista}>
        {vista === 'comandas' && <ComandasView onVerComanda={verEnCaja} notificar={notificar} />}
        {vista === 'caja' && (
          <CajaView
            comandaSeleccionada={comandaEnCaja}
            onSeleccionar={setComandaEnCaja}
            notificar={notificar}
          />
        )}
        {vista === 'historial' && <HistorialView />}
        {vista === 'reportes' && <ReportesView />}
        {vista === 'administracion' && <AdministracionView />}
      </Layout>

      {aviso && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-secondary-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          <CheckCircle2 size={16} className="text-green-400" />
          {aviso}
        </div>
      )}
    </DemoProvider>
  )
}
