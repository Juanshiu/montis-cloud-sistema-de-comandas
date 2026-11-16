import { useMemo, useState } from 'react'
import {
  Box,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Flame,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { useDemo } from '@/store/demo-store'
import {
  claveDia,
  claveHoy,
  formatearMoneda,
  precioLinea,
  totalComanda,
} from '@/utils/format'

type Vista = 'dia' | 'rango'

const METODOS_COLOR: Record<string, string> = {
  efectivo: 'bg-green-50 text-green-900',
  tarjeta: 'bg-blue-50 text-blue-900',
  transferencia: 'bg-purple-50 text-purple-900',
}

export default function ReportesView() {
  const { historial } = useDemo()
  const [fecha, setFecha] = useState(claveHoy)
  const [vista, setVista] = useState<Vista>('dia')
  const [categoriasAbiertas, setCategoriasAbiertas] = useState<Set<string>>(new Set())

  const pagadas = useMemo(
    () => historial.filter((comanda) => comanda.estado === 'pagada'),
    [historial],
  )

  const delPeriodo = useMemo(() => {
    if (vista === 'rango') {
      const limite = new Date()
      limite.setDate(limite.getDate() - 6)
      limite.setHours(0, 0, 0, 0)
      return pagadas.filter((comanda) => new Date(comanda.creadaEn) >= limite)
    }
    return pagadas.filter((comanda) => claveDia(comanda.creadaEn) === fecha)
  }, [pagadas, fecha, vista])

  const ventasAyer = useMemo(() => {
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    const clave = claveDia(ayer.toISOString())
    return pagadas
      .filter((comanda) => claveDia(comanda.creadaEn) === clave)
      .reduce((suma, comanda) => suma + totalComanda(comanda), 0)
  }, [pagadas])

  const ventas = delPeriodo.reduce((suma, comanda) => suma + totalComanda(comanda), 0)
  const comandas = delPeriodo.length
  const promedio = comandas > 0 ? Math.round(ventas / comandas) : 0
  const variacion = ventasAyer > 0 ? ((ventas - ventasAyer) / ventasAyer) * 100 : 0

  const porMetodo = useMemo(() => {
    const mapa = new Map<string, { total: number; transacciones: number }>()
    delPeriodo.forEach((comanda) => {
      const metodo = comanda.pago?.metodo ?? 'efectivo'
      const actual = mapa.get(metodo) ?? { total: 0, transacciones: 0 }
      mapa.set(metodo, {
        total: actual.total + totalComanda(comanda),
        transacciones: actual.transacciones + 1,
      })
    })
    return [...mapa.entries()].sort((a, b) => b[1].total - a[1].total)
  }, [delPeriodo])

  const topProductos = useMemo(() => {
    const mapa = new Map<string, { nombre: string; cantidad: number; valor: number }>()
    delPeriodo.forEach((comanda) => {
      comanda.items.forEach((item) => {
        const actual = mapa.get(item.nombre) ?? { nombre: item.nombre, cantidad: 0, valor: 0 }
        actual.cantidad += item.cantidad
        actual.valor += precioLinea(item)
        mapa.set(item.nombre, actual)
      })
    })
    return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad).slice(0, 6)
  }, [delPeriodo])

  const porHora = useMemo(() => {
    const mapa = new Map<string, { total: number; comandas: number }>()
    delPeriodo.forEach((comanda) => {
      const clave = new Date(comanda.creadaEn).getHours()
      const actual = mapa.get(String(clave)) ?? { total: 0, comandas: 0 }
      mapa.set(String(clave), {
        total: actual.total + totalComanda(comanda),
        comandas: actual.comandas + 1,
      })
    })
    return [...mapa.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))
  }, [delPeriodo])

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, { valor: number; unidades: number; productos: Set<string> }>()
    delPeriodo.forEach((comanda) => {
      comanda.items.forEach((item) => {
        const actual = mapa.get(item.categoria) ?? {
          valor: 0,
          unidades: 0,
          productos: new Set<string>(),
        }
        actual.valor += precioLinea(item)
        actual.unidades += item.cantidad
        actual.productos.add(item.nombre)
        mapa.set(item.categoria, actual)
      })
    })
    return [...mapa.entries()].sort((a, b) => b[1].valor - a[1].valor)
  }, [delPeriodo])

  const maximoHora = Math.max(...porHora.map(([, datos]) => datos.total), 1)
  const etiquetaVariacion = `${variacion >= 0 ? '+' : ''}${variacion.toFixed(1)}% vs ayer`

  const exportar = () => {
    const filas = [
      ['Comanda', 'Fecha', 'Tipo', 'Atendido por', 'Metodo', 'Total'],
      ...delPeriodo.map((comanda) => [
        `#${comanda.numero}`,
        new Date(comanda.creadaEn).toLocaleString('es-CO'),
        comanda.tipo,
        comanda.mesero,
        comanda.pago?.metodo ?? '',
        String(totalComanda(comanda)),
      ]),
    ]
    const csv = filas.map((fila) => fila.join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `reporte-${fecha}.csv`
    enlace.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary-500" />
            <label htmlFor="fecha-reporte" className="text-sm font-medium text-secondary-700">
              Fecha:
            </label>
          </div>
          <input
            id="fecha-reporte"
            type="date"
            value={fecha}
            onChange={(evento) => setFecha(evento.target.value)}
            disabled={vista === 'rango'}
            className="border border-secondary-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-secondary-100 disabled:text-secondary-400"
          />
          <button
            onClick={() => setFecha(claveHoy())}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
          <button
            onClick={exportar}
            className="bg-secondary-200 hover:bg-secondary-300 text-secondary-800 text-sm font-medium px-4 py-1.5 rounded-lg flex items-center gap-2"
          >
            <Download size={14} />
            Exportar
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setVista('dia')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                vista === 'dia'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setVista('rango')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                vista === 'rango'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              Rango
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="relative overflow-hidden rounded-xl p-5 text-white bg-gradient-to-br from-green-500 to-green-600 shadow">
          <p className="text-sm text-green-50">Total Ventas</p>
          <p className="text-3xl font-bold mt-1">{formatearMoneda(ventas)}</p>
          <p className="text-xs text-green-100 mt-2">{etiquetaVariacion}</p>
          <p className="text-xs text-green-100">vs promedio del periodo</p>
          <TrendingUp className="absolute -right-2 -bottom-2 h-24 w-24 opacity-20" />
        </div>

        <div className="relative overflow-hidden rounded-xl p-5 text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow">
          <p className="text-sm text-blue-50">Comandas</p>
          <p className="text-3xl font-bold mt-1">{comandas}</p>
          <p className="text-xs text-blue-100 mt-2">{etiquetaVariacion}</p>
          <p className="text-xs text-blue-100">vs promedio del periodo</p>
          <ShoppingCart className="absolute -right-2 -bottom-2 h-24 w-24 opacity-20" />
        </div>

        <div className="relative overflow-hidden rounded-xl p-5 text-white bg-gradient-to-br from-purple-500 to-purple-600 shadow">
          <p className="text-sm text-purple-50">Promedio por Comanda</p>
          <p className="text-3xl font-bold mt-1">{formatearMoneda(promedio)}</p>
          <p className="text-xs text-purple-100 mt-2">{etiquetaVariacion}</p>
          <p className="text-xs text-purple-100">vs promedio del periodo</p>
          <TrendingUp className="absolute -right-2 -bottom-2 h-24 w-24 opacity-20" />
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="bg-white rounded-xl shadow-sm border p-5 mb-5">
        <h3 className="font-semibold text-secondary-800 flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-secondary-500" />
          Métodos de Pago
        </h3>
        {porMetodo.length === 0 ? (
          <p className="text-sm text-secondary-500">Sin ventas registradas para el periodo.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {porMetodo.map(([metodo, datos]) => (
              <div
                key={metodo}
                className={`rounded-lg p-4 ${METODOS_COLOR[metodo] ?? 'bg-secondary-50 text-secondary-800'}`}
              >
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-sm font-medium capitalize">{metodo}</span>
                  <span className="text-lg font-bold">{formatearMoneda(datos.total)}</span>
                </div>
                <div className="text-xs opacity-80 mt-1">
                  {ventas > 0 ? ((datos.total / ventas) * 100).toFixed(1) : '0.0'}% del total
                </div>
                <div className="text-xs opacity-80">{datos.transacciones} transacciones</div>
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
                <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {indice + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary-800 truncate">{producto.nombre}</p>
                  <p className="text-xs text-secondary-500">{producto.cantidad} {producto.cantidad === 1 ? 'unidad' : 'unidades'}</p>
                </div>
                <span className="text-sm font-bold text-red-600 whitespace-nowrap">
                  {formatearMoneda(producto.valor)}
                </span>
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
              <div key={hora} className="flex items-center gap-2">
                <span className="w-10 text-xs font-medium text-secondary-700">{hora}:00</span>
                <span className="text-xs text-secondary-500">({datos.comandas} {datos.comandas === 1 ? 'comanda' : 'comandas'})</span>
                <div className="h-2 flex-1 rounded-full bg-secondary-100">
                  <div
                    className="h-2 rounded-full bg-orange-300"
                    style={{ width: `${Math.max(6, (datos.total / maximoHora) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-red-600 whitespace-nowrap">
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
        <div className="divide-y divide-secondary-100">
          {porCategoria.map(([categoria, datos]) => {
            const abierta = categoriasAbiertas.has(categoria)
            return (
              <div key={categoria}>
                <button
                  onClick={() =>
                    setCategoriasAbiertas((previas) => {
                      const copia = new Set(previas)
                      copia.has(categoria) ? copia.delete(categoria) : copia.add(categoria)
                      return copia
                    })
                  }
                  className="flex w-full items-center gap-2 py-2 text-left"
                >
                  {abierta ? (
                    <ChevronDown size={16} className="text-secondary-400" />
                  ) : (
                    <ChevronRight size={16} className="text-secondary-400" />
                  )}
                  <span className="text-sm font-medium text-secondary-800">{categoria}</span>
                  <span className="text-xs text-secondary-500">
                    ({datos.productos.size} {datos.productos.size === 1 ? 'producto' : 'productos'}) ·{' '}
                    {datos.unidades} {datos.unidades === 1 ? 'unidad' : 'unidades'}
                  </span>
                  <span className="ml-auto text-sm font-bold text-red-600">
                    {formatearMoneda(datos.valor)}
                  </span>
                </button>
                {abierta && (
                  <div className="pb-2 pl-6">
                    {[...datos.productos].map((producto) => (
                      <p key={producto} className="text-xs text-secondary-500">
                        {producto}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {porCategoria.length === 0 && (
            <p className="text-sm text-secondary-500 py-2">Sin ventas registradas.</p>
          )}
        </div>
      </div>
    </div>
  )
}
