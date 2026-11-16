import { useMemo, useState } from 'react'
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Printer,
  Receipt,
  User,
  UtensilsCrossed,
} from 'lucide-react'
import { MESAS, SALONES } from '@/data/salones'
import { useDemo } from '@/store/demo-store'
import type { Comanda } from '@/types'
import {
  claveDia,
  desglosarIva,
  etiquetaTipoServicio,
  formatearFechaCorta,
  formatearHora,
  formatearMoneda,
  precioLinea,
  totalComanda,
  totalItems,
} from '@/utils/format'

const ubicacion = (comanda: Comanda) => {
  if (comanda.tipo !== 'mesa') return comanda.cliente ?? etiquetaTipoServicio(comanda.tipo)
  const mesa = MESAS.find((item) => item.id === comanda.mesaId)
  if (!mesa) return 'Mesa'
  const salon = SALONES.find((item) => item.id === mesa.salonId)?.nombre ?? ''
  return `Mesa ${salon}-${mesa.numero}`
}

export default function HistorialView() {
  const { historial } = useDemo()
  const [fecha, setFecha] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [expandida, setExpandida] = useState<string | null>(null)

  const comandas = useMemo(
    () =>
      historial.filter((comanda) => {
        const coincideFecha = !fecha || claveDia(comanda.creadaEn) === fecha
        const coincideTipo = !filtroTipo || comanda.tipo === filtroTipo
        const coincideEstado = !filtroEstado || comanda.estado === filtroEstado
        return coincideFecha && coincideTipo && coincideEstado
      }),
    [historial, fecha, filtroTipo, filtroEstado],
  )

  const comandasHoy = historial.filter(
    (comanda) => claveDia(comanda.creadaEn) === claveDia(new Date().toISOString()),
  ).length

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary-500" />
            <label htmlFor="fecha-filtro" className="text-sm font-medium text-secondary-700">
              Fecha:
            </label>
          </div>
          <input
            id="fecha-filtro"
            type="date"
            value={fecha}
            onChange={(evento) => setFecha(evento.target.value)}
            className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-secondary-500" />
            <label htmlFor="tipo-pedido-filtro" className="text-sm font-medium text-secondary-700">
              Tipo de pedido:
            </label>
          </div>
          <select
            id="tipo-pedido-filtro"
            value={filtroTipo}
            onChange={(evento) => setFiltroTipo(evento.target.value)}
            className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">Todos</option>
            <option value="mesa">Mesa</option>
            <option value="domicilio">Domicilio</option>
            <option value="llevar">Para llevar</option>
          </select>

          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-secondary-500" />
            <label htmlFor="estado-filtro" className="text-sm font-medium text-secondary-700">
              Estado:
            </label>
          </div>
          <select
            id="estado-filtro"
            value={filtroEstado}
            onChange={(evento) => setFiltroEstado(evento.target.value)}
            className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">Todos</option>
            <option value="pagada">Pagadas</option>
            <option value="anulada">Canceladas</option>
          </select>

          {(fecha || filtroTipo || filtroEstado) && (
            <button
              onClick={() => {
                setFecha('')
                setFiltroTipo('')
                setFiltroEstado('')
              }}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Total Comandas</p>
                <p className="text-2xl font-bold text-secondary-900">{comandas.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Comandas hechas HOY</p>
                <p className="text-2xl font-bold text-emerald-600">{comandasHoy}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {comandas.map((comanda) => {
            const abierta = expandida === comanda.id
            const { subtotal, iva } = desglosarIva(totalComanda(comanda))
            return (
              <div
                key={comanda.id}
                className="bg-white rounded-lg shadow border border-secondary-200 overflow-hidden"
              >
                <div
                  className="flex flex-wrap items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary-50"
                  onClick={() => setExpandida(abierta ? null : comanda.id)}
                >
                  <span className="font-bold text-secondary-900">#{comanda.numero}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      comanda.estado === 'pagada'
                        ? 'bg-secondary-50 text-secondary-700 border-secondary-200'
                        : 'bg-white text-red-600 border-red-300'
                    }`}
                  >
                    {comanda.estado === 'pagada' ? 'Pagada' : 'Cancelada'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    <User size={13} />
                    {comanda.mesero}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                    <UtensilsCrossed size={13} />
                    {ubicacion(comanda)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-secondary-500">
                    <Clock size={14} />
                    {formatearFechaCorta(comanda.creadaEn)}, {formatearHora(comanda.creadaEn)}
                  </span>
                  <div className="ml-auto text-right">
                    <div className="text-base font-bold text-secondary-900">
                      {formatearMoneda(totalComanda(comanda) + (comanda.pago?.propina ?? 0))}
                    </div>
                    <div className="text-xs text-secondary-500">{totalItems(comanda)} {totalItems(comanda) === 1 ? 'ítem' : 'ítems'}</div>
                  </div>
                  <button
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded flex items-center gap-1"
                    onClick={(evento) => evento.stopPropagation()}
                    title="Ver recibo"
                  >
                    <Printer size={14} />
                    Recibo
                  </button>
                  <span className="text-secondary-400">
                    {abierta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>

                {abierta && (
                  <div className="border-t border-secondary-200 bg-secondary-25 px-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-secondary-800 mb-2">
                          Items de la Comanda
                        </h4>
                        <div className="space-y-2">
                          {comanda.items.map((item) => (
                            <div key={item.id} className="flex justify-between gap-3">
                              <div>
                                <p className="font-medium text-secondary-800 text-sm">
                                  {item.cantidad}x {item.nombre}
                                </p>
                                {item.opciones.length > 0 && (
                                  <p className="text-xs text-secondary-500">
                                    {item.opciones.map((opcion) => opcion.nombre).join(' · ')}
                                  </p>
                                )}
                                {item.nota && (
                                  <p className="text-xs italic text-secondary-500">{item.nota}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-secondary-900 text-sm">
                                  {formatearMoneda(precioLinea(item))}
                                </p>
                                <p className="text-xs text-secondary-500">
                                  {formatearMoneda(item.precioUnitario)} c/u
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-secondary-800 mb-2">
                          Información Adicional
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-secondary-600">Subtotal:</span>
                            <span className="font-medium">{formatearMoneda(subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary-600">IVA incluido:</span>
                            <span className="font-medium">{formatearMoneda(iva)}</span>
                          </div>
                          {comanda.pago && (
                            <div className="flex justify-between">
                              <span className="text-secondary-600">Método de pago:</span>
                              <span className="font-medium capitalize">
                                {comanda.pago.metodo}
                              </span>
                            </div>
                          )}
                          {comanda.pago && comanda.pago.propina > 0 && (
                            <div className="flex justify-between">
                              <span className="text-secondary-600">Propina:</span>
                              <span className="font-medium">
                                {formatearMoneda(comanda.pago.propina)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-secondary-200 pt-2">
                            <span className="font-semibold text-secondary-800">Total:</span>
                            <span className="font-bold text-primary-600">
                              {formatearMoneda(
                                totalComanda(comanda) + (comanda.pago?.propina ?? 0),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {comandas.length === 0 && (
            <div className="bg-white rounded-lg shadow border p-8 text-center text-secondary-500">
              No hay comandas que coincidan con los filtros.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
