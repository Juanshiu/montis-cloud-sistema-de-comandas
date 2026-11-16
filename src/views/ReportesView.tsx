import { useMemo, useState } from 'react'
import {
  Box,
  Calendar,
  Clock,
  CreditCard,
  Download,
  Flame,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { useDemo } from '@/store/demo-store'
import { claveDia, formatearMoneda, precioLinea, totalComanda } from '@/utils/format'

const METODOS_COLOR: Record<string, string> = {
  efectivo: 'bg-secondary-50 text-secondary-800',
  tarjeta: 'bg-secondary-50 text-secondary-800',
  transferencia: 'bg-secondary-50 text-secondary-800',
}

export default function ReportesView() {
  const { historial } = useDemo()
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))

  const pagadas = useMemo(
    () => historial.filter((comanda) => comanda.estado === 'pagada'),
    [historial],
  )

  const delDia = useMemo(
    () => pagadas.filter((comanda) => claveDia(comanda.creadaEn) === fecha),
    [pagadas, fecha],
  )

  const ventas = delDia.reduce((suma, comanda) => suma + totalComanda(comanda), 0)
  const comandas = delDia.length
  const promedio = comandas > 0 ? Math.round(ventas / comandas) : 0

  const porMetodo = useMemo(() => {
    const mapa = new Map<string, { total: number; transacciones: number }>()
    delDia.forEach((comanda) => {
      const metodo = comanda.pago?.metodo ?? 'efectivo'
      const actual = mapa.get(metodo) ?? { total: 0, transacciones: 0 }
      mapa.set(metodo, {
        total: actual.total + totalComanda(comanda),
        transacciones: actual.transacciones + 1,
      })
    })
    return [...mapa.entries()].sort((a, b) => b[1].total - a[1].total)
  }, [delDia])

  const topProductos = useMemo(() => {
    const mapa = new Map<string, { nombre: string; cantidad: number; valor: number }>()
    delDia.forEach((comanda) => {
      comanda.items.forEach((item) => {
        const actual = mapa.get(item.nombre) ?? { nombre: item.nombre, cantidad: 0, valor: 0 }
        actual.cantidad += item.cantidad
        actual.valor += precioLinea(item)
        mapa.set(item.nombre, actual)
      })
    })
    return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad).slice(0, 6)
  }, [delDia])

  const porHora = useMemo(() => {
    const mapa = new Map<string, { total: number; comandas: number }>()
    delDia.forEach((comanda) => {
      const hora = new Date(comanda.creadaEn).getHours()
      const clave = `${hora}:00`
      const actual = mapa.get(clave) ?? { total: 0, comandas: 0 }
      mapa.set(clave, {
        total: actual.total + totalComanda(comanda),
        comandas: actual.comandas + 1,
      })
    })
    return [...mapa.entries()].sort((a, b) => Number(a[1]) - Number(b[1]))
  }, [delDia])

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, { valor: number; unidades: number }>()
    delDia.forEach((comanda) => {
      comanda.items.forEach((item) => {
        const actual = mapa.get(item.categoria) ?? { valor: 0, unidades: 0 }
        mapa.set(item.categoria, {
          valor: actual.valor + precioLinea(item),
          unidades: actual.unidades + item.cantidad,
        })
      })
    })
    return [...mapa.entries()].sort((a, b) => b[1].valor - a[1].valor)
  }, [delDia])

  const maximoProducto = Math.max(...topProductos.map((producto) => producto.valor), 1)
  const maximoHora = Math.max(...porHora.map(([, datos]) => datos.total), 1)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha:</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="date"
              value={fecha}
              onChange={(evento) => setFecha(evento.target.value)}
              className="pl-9 pr-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
          <RefreshCw size={15} />
          Actualizar
        </button>
        <button className="bg-secondary-200 hover:bg-secondary-300 text-secondary-800 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
          <Download size={15} />
          Exportar
        </button>
        <div className="ml-auto flex rounded-lg overflow-hidden border border-secondary-300">
          <span className="bg-primary-600 text-white text-sm font-medium px-4 py-2">Día</span>
          <span className="bg-white text-secondary-600 text-sm font-medium px-4 py-2">Rango</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl p-5 text-white bg-gradient-to-br from-green-500 to-green-600 shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-50">Total Ventas</p>
              <p className="text-3xl font-bold mt-1">{formatearMoneda(ventas)}</p>
              <p className="text-xs text-green-100 mt-1">0.0% vs ayer</p>
            </div>
            <span className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={22} />
            </span>
          </div>
        </div>

        <div className="rounded-xl p-5 text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-50">Comandas</p>
              <p className="text-3xl font-bold mt-1">{comandas}</p>
              <p className="text-xs text-blue-100 mt-1">0.0% vs promedio</p>
            </div>
            <span className="p-2 bg-white/20 rounded-lg">
              <ShoppingCart size={22} />
            </span>
          </div>
        </div>

        <div className="rounded-xl p-5 text-white bg-gradient-to-br from-purple-500 to-purple-600 shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-50">Promedio por Comanda</p>
              <p className="text-3xl font-bold mt-1">{formatearMoneda(promedio)}</p>
              <p className="text-xs text-purple-100 mt-1">0.0% vs ayer</p>
            </div>
            <span className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={22} />
            </span>
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="bg-white rounded-xl shadow-sm border p-5 mb-5">
        <h3 className="font-semibold text-secondary-800 flex items-center gap-2 mb-4">
          <CreditCard size={18} />
          Métodos de Pago
        </h3>
        {porMetodo.length === 0 ? (
          <p className="text-sm text-secondary-500">Sin ventas registradas para esta fecha.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {porMetodo.map(([metodo, datos]) => (
              <div
                key={metodo}
                className={`rounded-lg border border-secondary-200 p-3 ${METODOS_COLOR[metodo] ?? 'bg-secondary-50'}`}
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium capitalize">{metodo}</span>
                  <span className="font-bold">{formatearMoneda(datos.total)}</span>
                </div>
                <div className="text-xs text-secondary-500 mt-1">
                  {ventas > 0 ? ((datos.total / ventas) * 100).toFixed(1) : '0.0'}% del total
                </div>
                <div className="text-xs text-secondary-500">
                  {datos.transacciones} transacciones
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Productos más vendidos */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-secondary-800 flex items-center gap-2 mb-4">
            <Flame size={18} className="text-orange-500" />
            Productos Más Vendidos
          </h3>
          <div className="space-y-3">
            {topProductos.map((producto, indice) => (
              <div key={producto.nombre} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center">
                  {indice + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-secondary-800 truncate">{producto.nombre}</span>
                    <span className="font-semibold text-red-600 whitespace-nowrap">
                      {formatearMoneda(producto.valor)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-secondary-100">
                    <div
                      className="h-1.5 rounded-full bg-primary-400"
                      style={{ width: `${(producto.valor / maximoProducto) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-secondary-500">{producto.cantidad} unidades</span>
                </div>
              </div>
            ))}
            {topProductos.length === 0 && (
              <p className="text-sm text-secondary-500">Sin ventas registradas.</p>
            )}
          </div>
        </div>

        {/* Ventas por hora */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-secondary-800 flex items-center gap-2 mb-4">
            <Clock size={18} className="text-blue-500" />
            Ventas por Hora
          </h3>
          <div className="space-y-3">
            {porHora.map(([hora, datos]) => (
              <div key={hora} className="flex items-center gap-3">
                <span className="w-12 text-xs text-secondary-600 font-medium">{hora}</span>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-secondary-100">
                    <div
                      className="h-2 rounded-full bg-orange-300"
                      style={{ width: `${(datos.total / maximoHora) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-secondary-500">({datos.comandas} comandas)</span>
                </div>
                <span className="text-sm font-semibold text-red-600 whitespace-nowrap">
                  {formatearMoneda(datos.total)}
                </span>
              </div>
            ))}
            {porHora.length === 0 && (
              <p className="text-sm text-secondary-500">Sin ventas registradas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Ventas por categoría */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-semibold text-secondary-800 flex items-center gap-2 mb-4">
          <Box size={18} className="text-purple-500" />
          Ventas por Categoría
        </h3>
        <div className="space-y-3">
          {porCategoria.map(([categoria, datos]) => (
            <div
              key={categoria}
              className="flex items-center justify-between border-b border-secondary-100 pb-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-secondary-800">{categoria}</p>
                <p className="text-xs text-secondary-500">
                  ({datos.unidades} unidades) · {formatearMoneda(datos.valor)}
                </p>
              </div>
              <span className="text-sm font-bold text-red-600">{formatearMoneda(datos.valor)}</span>
            </div>
          ))}
          {porCategoria.length === 0 && (
            <p className="text-sm text-secondary-500">Sin ventas registradas.</p>
          )}
        </div>
      </div>
    </div>
  )
}
