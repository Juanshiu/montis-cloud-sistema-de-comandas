import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { COMANDAS_ABIERTAS, COMANDAS_HISTORIAL } from '@/data/comandas'
import type { Comanda, ItemComanda, MetodoPago, PagoComanda, TipoServicio } from '@/types'
import { totalComanda } from '@/utils/format'

export type EstadoPreparacion = 'pendiente' | 'preparando' | 'lista'

export interface NuevaComanda {
  tipo: TipoServicio
  mesero: string
  mesaId?: string
  mesaIds?: string[]
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
  estadosPreparacion: Record<string, EstadoPreparacion>
  crearComanda: (datos: NuevaComanda) => Comanda
  cobrarComanda: (
    id: string,
    datos: { metodo: MetodoPago; recibido: number; propina: number; referencia?: string },
  ) => void
  avanzarEstado: (id: string) => void
}

const DemoContext = createContext<DemoContexto | null>(null)

const ordenarPorFecha = (comandas: Comanda[]) =>
  [...comandas].sort((a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime())

const estadosIniciales = (): Record<string, EstadoPreparacion> =>
  Object.fromEntries(COMANDAS_ABIERTAS.map((comanda) => [comanda.id, 'pendiente']))

export function DemoProvider({ children }: { children: ReactNode }) {
  const [comandas, setComandas] = useState<Comanda[]>(() => [
    ...COMANDAS_ABIERTAS,
    ...ordenarPorFecha(COMANDAS_HISTORIAL),
  ])
  const [estadosPreparacion, setEstadosPreparacion] =
    useState<Record<string, EstadoPreparacion>>(estadosIniciales)
  const consecutivo = useRef(1106)

  const crearComanda = useCallback((datos: NuevaComanda) => {
    const numero = consecutivo.current
    consecutivo.current += 1
    const comanda: Comanda = {
      id: `comanda-${numero}`,
      numero,
      tipo: datos.tipo,
      estado: 'abierta',
      mesero: datos.mesero,
      mesaId: datos.mesaId,
      mesaIds: datos.mesaIds,
      cliente: datos.cliente,
      telefono: datos.telefono,
      direccion: datos.direccion,
      items: datos.items,
      nota: datos.nota,
      creadaEn: new Date().toISOString(),
    }
    setComandas((actuales) => [comanda, ...actuales])
    setEstadosPreparacion((previos) => ({ ...previos, [comanda.id]: 'pendiente' }))
    return comanda
  }, [])

  const cobrarComanda = useCallback(
    (
      id: string,
      datos: { metodo: MetodoPago; recibido: number; propina: number; referencia?: string },
    ) => {
      setComandas((actuales) =>
        actuales.map((comanda) => {
          if (comanda.id !== id || comanda.estado !== 'abierta') return comanda
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

  const avanzarEstado = useCallback((id: string) => {
    setEstadosPreparacion((previos) => {
      const actual = previos[id] ?? 'pendiente'
      if (actual === 'lista') return previos
      return { ...previos, [id]: actual === 'pendiente' ? 'preparando' : 'lista' }
    })
  }, [])

  const valor = useMemo<DemoContexto>(() => {
    const comandasAbiertas = ordenarPorFecha(
      comandas.filter((comanda) => comanda.estado === 'abierta'),
    )
    const historial = ordenarPorFecha(comandas.filter((comanda) => comanda.estado !== 'abierta'))
    const mesasOcupadas = new Map<string, Comanda>()
    comandasAbiertas.forEach((comanda) => {
      const ids = comanda.mesaIds?.length ? comanda.mesaIds : comanda.mesaId ? [comanda.mesaId] : []
      ids.forEach((id) => mesasOcupadas.set(id, comanda))
    })
    return {
      comandasAbiertas,
      historial,
      mesasOcupadas,
      estadosPreparacion,
      crearComanda,
      cobrarComanda,
      avanzarEstado,
    }
  }, [comandas, estadosPreparacion, crearComanda, cobrarComanda, avanzarEstado])

  return <DemoContext.Provider value={valor}>{children}</DemoContext.Provider>
}

export const useDemo = () => {
  const contexto = useContext(DemoContext)
  if (!contexto) throw new Error('useDemo debe usarse dentro de DemoProvider')
  return contexto
}
