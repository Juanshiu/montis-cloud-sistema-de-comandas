import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { COMANDAS_ABIERTAS, COMANDAS_HISTORIAL } from '@/data/comandas'
import { MESAS } from '@/data/salones'
import type { Comanda, ItemComanda, MetodoPago, PagoComanda, TipoServicio } from '@/types'
import { totalComanda } from '@/utils/format'

export interface NuevaComanda {
  tipo: TipoServicio
  mesero: string
  mesaId?: string
  cliente?: string
  telefono?: string
  direccion?: string
  items: ItemComanda[]
  nota?: string
}

interface DemoContexto {
  comandasAbiertas: Comanda[]
  historial: Comanda[]
  mesasOcupadas: Map<string, Comanda>
  crearComanda: (datos: NuevaComanda) => Comanda
  cobrarComanda: (id: string, datos: { metodo: MetodoPago; recibido: number; propina: number; referencia?: string }) => void
}

const DemoContext = createContext<DemoContexto | null>(null)

const ordenarPorFecha = (comandas: Comanda[]) =>
  [...comandas].sort((a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime())

export function DemoProvider({ children }: { children: ReactNode }) {
  const [comandas, setComandas] = useState<Comanda[]>(() => [
    ...COMANDAS_ABIERTAS,
    ...ordenarPorFecha(COMANDAS_HISTORIAL),
  ])
  const [consecutivo, setConsecutivo] = useState(1106)

  const crearComanda = useCallback(
    (datos: NuevaComanda) => {
      const comanda: Comanda = {
        id: `comanda-${consecutivo}`,
        numero: consecutivo,
        tipo: datos.tipo,
        estado: 'abierta',
        mesero: datos.mesero,
        mesaId: datos.mesaId,
        cliente: datos.cliente,
        telefono: datos.telefono,
        items: datos.items,
        nota: datos.nota,
        creadaEn: new Date().toISOString(),
      }
      setComandas((actuales) => [comanda, ...actuales])
      setConsecutivo((valor) => valor + 1)
      return comanda
    },
    [consecutivo],
  )

  const cobrarComanda = useCallback(
    (id: string, datos: { metodo: MetodoPago; recibido: number; propina: number; referencia?: string }) => {
      setComandas((actuales) =>
        actuales.map((comanda) => {
          if (comanda.id !== id) return comanda
          const total = totalComanda(comanda)
          const aPagar = total + datos.propina
          const pago: PagoComanda = {
            metodo: datos.metodo,
            recibido: datos.metodo === 'efectivo' ? datos.recibido : aPagar,
            propina: datos.propina,
            cambio: datos.metodo === 'efectivo' ? Math.max(0, datos.recibido - aPagar) : 0,
            referencia: datos.referencia,
          }
          return {
            ...comanda,
            estado: 'pagada',
            cerradaEn: new Date().toISOString(),
            pago,
          } as Comanda
        }),
      )
    },
    [],
  )

  const valor = useMemo<DemoContexto>(() => {
    const comandasAbiertas = comandas.filter((comanda) => comanda.estado === 'abierta')
    const historial = ordenarPorFecha(comandas.filter((comanda) => comanda.estado !== 'abierta'))
    const mesasOcupadas = new Map<string, Comanda>()
    comandasAbiertas.forEach((comanda) => {
      if (comanda.mesaId) mesasOcupadas.set(comanda.mesaId, comanda)
    })
    return {
      comandasAbiertas: ordenarPorFecha(comandasAbiertas),
      historial,
      mesasOcupadas,
      crearComanda,
      cobrarComanda,
    }
  }, [comandas, crearComanda, cobrarComanda])

  return <DemoContext.Provider value={valor}>{children}</DemoContext.Provider>
}

export const useDemo = () => {
  const contexto = useContext(DemoContext)
  if (!contexto) throw new Error('useDemo debe usarse dentro de DemoProvider')
  return contexto
}
