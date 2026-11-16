import { useEffect, useMemo, useState } from 'react'
import { Banknote, Check, Clock, CreditCard, Printer, Smartphone, UtensilsCrossed } from 'lucide-react'
import { MESAS, SALONES } from '@/data/salones'
import { useDemo, type EstadoPreparacion } from '@/store/demo-store'
import type { Comanda, MetodoPago } from '@/types'
import {
  desglosarIva,
  etiquetaTipoServicio,
  formatearHora,
  formatearMoneda,
  precioLinea,
  totalComanda,
  totalItems,
} from '@/utils/format'

interface Props {
  comandaSeleccionada?: string
  onSeleccionar: (id: string | undefined) => void
  notificar: (mensaje: string) => void
}

const ESTILO_ESTADO: Record<EstadoPreparacion, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  preparando: 'bg-blue-100 text-blue-800',
  lista: 'bg-green-100 text-green-800',
}

const ETIQUETA_ESTADO: Record<EstadoPreparacion, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  lista: 'Lista',
}

const METODOS: { id: MetodoPago; nombre: string; icono: typeof Banknote; clases: string }[] = [
  { id: 'efectivo', nombre: 'Efectivo', icono: Banknote, clases: 'bg-green-500 hover:bg-green-600' },
  { id: 'tarjeta', nombre: 'Tarjeta', icono: CreditCard, clases: 'bg-blue-500 hover:bg-blue-600' },
  {
    id: 'transferencia',
    nombre: 'Transferencia',
    icono: Smartphone,
    clases: 'bg-purple-500 hover:bg-purple-600',
  },
]

const nombreSalon = (salonId?: string) =>
  SALONES.find((salon) => salon.id === salonId)?.nombre ?? ''

const mesaDe = (comanda: Comanda) => MESAS.find((mesa) => mesa.id === comanda.mesaId)

const ubicacion = (comanda: Comanda) => {
  if (comanda.tipo !== 'mesa') return etiquetaTipoServicio(comanda.tipo)
  const mesa = mesaDe(comanda)
  return mesa ? `${nombreSalon(mesa.salonId)} - ${mesa.numero}` : 'Mesa'
}

export default function CajaView({ comandaSeleccionada, onSeleccionar, notificar }: Props) {
  const { comandasAbiertas, cobrarComanda, estadosPreparacion, avanzarEstado } = useDemo()
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [recibido, setRecibido] = useState('')
  const [propina, setPropina] = useState(0)

  const seleccionada =
    comandasAbiertas.find((comanda) => comanda.id === comandaSeleccionada) ?? undefined

  const grupos = useMemo(() => {
    const mapa = new Map<string, Comanda[]>()
    comandasAbiertas.forEach((comanda) => {
      const clave =
        comanda.tipo === 'mesa' ? nombreSalon(mesaDe(comanda)?.salonId) : etiquetaTipoServicio(comanda.tipo)
      mapa.set(clave, [...(mapa.get(clave) ?? []), comanda])
    })
    return [...mapa.entries()]
  }, [comandasAbiertas])

  const total = seleccionada ? totalComanda(seleccionada) : 0
  const { subtotal, iva } = desglosarIva(total)
  const totalConPropina = total + propina
  const recibidoNumero = Number(recibido.replace(/[^\d]/g, '')) || 0
  const cambio = Math.max(0, recibidoNumero - totalConPropina)
  const pagoValido = metodo !== 'efectivo' || recibidoNumero >= totalConPropina

  const estadoDe = (comanda: Comanda): EstadoPreparacion =>
    estadosPreparacion[comanda.id] ?? 'pendiente'

  useEffect(() => {
    setPropina(0)
    setRecibido('')
    setMetodo('efectivo')
  }, [seleccionada?.id])

  const cobrar = () => {
    if (!seleccionada || !pagoValido) return
    cobrarComanda(seleccionada.id, {
      metodo,
      recibido: metodo === 'efectivo' ? recibidoNumero : totalConPropina,
      propina,
    })
    notificar(`Comanda #${seleccionada.numero} cobrada · ${formatearMoneda(totalConPropina)}`)
    onSeleccionar(undefined)
    setRecibido('')
    setPropina(0)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-secondary-800 mb-4 flex items-center">
          <UtensilsCrossed className="mr-2" size={20} />
          Comandas Activas ({comandasAbiertas.length})
        </h2>

        {comandasAbiertas.length === 0 ? (
          <p className="text-secondary-600 text-center py-8">No hay comandas activas</p>
        ) : (
          <div className="space-y-6">
            {grupos.map(([salon, comandas]) => (
              <div key={salon} className="border rounded-lg p-4 bg-secondary-25">
                <h3 className="font-semibold text-lg text-secondary-800 mb-3 border-b pb-2">
                  {salon}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {comandas.map((comanda) => {
                    const estado = estadoDe(comanda)
                    return (
                      <div
                        key={comanda.id}
                        onClick={() => onSeleccionar(comanda.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          seleccionada?.id === comanda.id
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-secondary-200 bg-white hover:border-secondary-300 hover:shadow'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-secondary-800">
                              {comanda.tipo === 'mesa'
                                ? `Mesa ${mesaDe(comanda)?.numero ?? ''}`
                                : comanda.cliente ?? etiquetaTipoServicio(comanda.tipo)}
                            </h4>
                            <p className="text-xs text-secondary-500">
                              #{comanda.numero} · {formatearHora(comanda.creadaEn)} ·{' '}
                              {comanda.mesero}
                            </p>
                          </div>
                          <span
                            className={`ml-2 px-1.5 py-0.5 rounded text-[12px] font-medium flex items-center space-x-0.5 ${ESTILO_ESTADO[estado]}`}
                          >
                            <Clock size={12} />
                            <span>{ETIQUETA_ESTADO[estado]}</span>
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-secondary-600">
                            {totalItems(comanda)} item(s)
                          </span>
                          <span className="text-sm font-bold text-primary-600">
                            {formatearMoneda(totalComanda(comanda))}
                          </span>
                        </div>

                        <div className="flex space-x-1 mt-2">
                          {estado !== 'lista' && (
                            <button
                              onClick={(evento) => {
                                evento.stopPropagation()
                                avanzarEstado(comanda.id)
                              }}
                              className={`text-[12px] px-1.5 py-0.5 border rounded flex-1 ${
                                estado === 'pendiente'
                                  ? 'text-yellow-600 border-yellow-600 hover:text-yellow-800'
                                  : 'text-green-600 border-green-600 hover:text-green-800'
                              }`}
                            >
                              {estado === 'pendiente' ? 'Preparando' : 'Marcar Lista'}
                            </button>
                          )}
                          {estado === 'lista' && (
                            <span className="text-[12px] px-1.5 py-0.5 rounded flex-1 text-center text-green-700 bg-green-50 border border-green-200">
                              Lista para servir
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-secondary-800 mb-4">Procesar Pago</h2>

        {!seleccionada ? (
          <p className="text-secondary-600 text-center py-8">
            Selecciona una comanda para procesar el pago
          </p>
        ) : (
          <div className="space-y-4">
            <div className="bg-secondary-50 p-4 rounded-lg">
              <h3 className="font-semibold text-secondary-800 mb-2">
                {seleccionada.tipo === 'mesa'
                  ? `Mesas: ${ubicacion(seleccionada)}`
                  : `${etiquetaTipoServicio(seleccionada.tipo)} · ${seleccionada.cliente ?? 'Cliente'}`}
              </h3>
              <p className="text-sm text-secondary-600">Atendido por: {seleccionada.mesero}</p>
              <p className="text-sm text-secondary-600">
                Fecha: {new Date(seleccionada.creadaEn).toLocaleString('es-CO')}
              </p>
              {seleccionada.telefono && (
                <p className="text-sm text-secondary-600">📞 {seleccionada.telefono}</p>
              )}
              {seleccionada.direccion && (
                <p className="text-sm text-secondary-600">📍 {seleccionada.direccion}</p>
              )}
              {seleccionada.nota && (
                <p className="text-xs text-secondary-600 italic mt-2 pt-2 border-t border-secondary-200">
                  {seleccionada.nota}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-secondary-800 mb-2">Items:</h4>
              <div className="space-y-3">
                {seleccionada.items.map((item) => (
                  <div
                    key={item.id}
                    className="border-l-2 border-primary-300 bg-white py-2 pl-3"
                  >
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-medium text-secondary-800">
                        {item.nombre} x {item.cantidad}{' '}
                        <span className="text-xs text-secondary-500">
                          ({formatearMoneda(item.precioUnitario)})
                        </span>
                      </span>
                      <span className="font-semibold whitespace-nowrap text-secondary-900">
                        {formatearMoneda(precioLinea(item))}
                      </span>
                    </div>
                    {item.opciones.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.opciones.map((opcion) => (
                          <div key={opcion.nombre} className="text-xs text-secondary-600">
                            <span className="font-medium">{opcion.grupo}:</span> {opcion.nombre}
                            {opcion.precio > 0 && (
                              <span className="text-primary-600 ml-1">
                                (+{formatearMoneda(opcion.precio)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.nota && (
                      <p className="text-xs italic text-secondary-500">Obs: {item.nota}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-secondary-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Subtotal</span>
                <span className="font-medium">{formatearMoneda(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">IVA incluido (19%)</span>
                <span className="font-medium">{formatearMoneda(iva)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Propina</span>
                <span className="font-medium">{formatearMoneda(propina)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-secondary-800">Total</span>
                <span className="font-bold text-primary-600">
                  {formatearMoneda(totalConPropina)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Propina
              </label>
              <div className="flex gap-2">
                {[0, 10, 15].map((porcentaje) => {
                  const valor = Math.round((total * porcentaje) / 100)
                  return (
                    <button
                      key={porcentaje}
                      onClick={() => setPropina(valor)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        propina === valor
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-secondary-600 border-secondary-300 hover:border-primary-300'
                      }`}
                    >
                      {porcentaje === 0 ? 'Sin propina' : `${porcentaje}%`}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Método de pago
              </label>
              <div className="grid grid-cols-3 gap-3">
                {METODOS.map((opcion) => {
                  const Icono = opcion.icono
                  return (
                    <button
                      key={opcion.id}
                      onClick={() => setMetodo(opcion.id)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg py-3 text-sm font-medium text-white transition-colors ${opcion.clases} ${
                        metodo === opcion.id ? 'ring-2 ring-offset-2 ring-secondary-400' : 'opacity-80'
                      }`}
                    >
                      <Icono size={18} />
                      {opcion.nombre}
                    </button>
                  )
                })}
              </div>
            </div>

            {metodo === 'efectivo' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700">
                  Efectivo recibido
                </label>
                <input
                  className="input-field py-2"
                  inputMode="numeric"
                  placeholder="0"
                  value={recibido}
                  onChange={(evento) => setRecibido(evento.target.value)}
                />
                <div className="flex gap-2">
                  {[50000, 100000, 200000].map((billete) => (
                    <button
                      key={billete}
                      onClick={() => setRecibido(String(billete))}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-secondary-300 bg-white hover:border-primary-300"
                    >
                      {formatearMoneda(billete)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-800">
                  <span>Cambio</span>
                  <span className="text-lg font-bold">{formatearMoneda(cambio)}</span>
                </div>
              </div>
            )}

            {metodo !== 'efectivo' && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                {metodo === 'tarjeta'
                  ? 'Acerca la tarjeta al datáfono y confirma el pago.'
                  : 'Confirma la transferencia en la cuenta del restaurante.'}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cobrar}
                disabled={!pagoValido}
                className="btn-primary flex-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} className="mr-2" />
                Cobrar Comanda
              </button>
              <button
                onClick={() => notificar('Precuenta enviada a la impresora de caja')}
                className="btn-secondary flex items-center"
              >
                <Printer size={18} className="mr-2" />
                Imprimir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
