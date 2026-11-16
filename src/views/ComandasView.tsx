import { useMemo, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
} from 'lucide-react'
import { CATEGORIAS, PRODUCTOS } from '@/data/menu'
import { MESAS, MESEROS, SALONES } from '@/data/salones'
import { useDemo } from '@/store/demo-store'
import type { ItemComanda, Mesa, Producto } from '@/types'
import { desglosarIva, formatearMoneda, precioLinea } from '@/utils/format'
import Modal from '@/components/ui/Modal'

interface Props {
  onVerComanda: (id: string) => void
  notificar: (mensaje: string) => void
}

interface DatosCliente {
  nombre: string
  telefono: string
  direccion: string
  esParaLlevar: boolean
}

const PASOS = ['Seleccionar Mesa', 'Tipo de Servicio', 'Seleccionar Productos', 'Resumen y Envío']

const ICONOS: Record<string, string> = {
  Almuerzos: '🍲',
  Desayunos: '🍳',
  'Sopas y caldos': '🥣',
  Carnes: '🥩',
  Pechugas: '🍗',
  'Pescados y mariscos': '🐟',
  Pastas: '🍝',
  Arroces: '🍚',
  Porciones: '🍟',
  Bebidas: '🥤',
  Cafetería: '☕',
}

const DESCRIPCIONES: Record<string, string> = {
  Almuerzos: 'Sopa, principio y proteína',
  Desayunos: 'Caldos y proteínas',
  'Sopas y caldos': 'Sopas y caldos',
  Carnes: 'Especialidades de carne',
  Pechugas: 'Especialidades de pechuga',
  'Pescados y mariscos': 'Pescados y mariscos',
  Pastas: 'Variedad de pastas',
  Arroces: 'Diferentes tipos de arroz',
  Porciones: 'Porciones adicionales',
  Bebidas: 'Refrescos, jugos y bebidas',
  Cafetería: 'Postres y cafetería',
}

const nuevoId = () => Math.random().toString(36).slice(2, 9)

const nombreMesa = (mesa: Mesa) =>
  `${SALONES.find((salon) => salon.id === mesa.salonId)?.nombre ?? ''} - ${mesa.numero}`

export default function ComandasView({ onVerComanda, notificar }: Props) {
  const { mesasOcupadas, crearComanda } = useDemo()

  const [paso, setPaso] = useState(0)
  const [tipoPedido, setTipoPedido] = useState<'mesa' | 'domicilio'>('mesa')
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState<Mesa[]>([])
  const [tipoServicio, setTipoServicio] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<ItemComanda[]>([])
  const [cliente, setCliente] = useState<DatosCliente>({
    nombre: '',
    telefono: '',
    direccion: '',
    esParaLlevar: false,
  })
  const [observaciones, setObservaciones] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [productoModal, setProductoModal] = useState<Producto | null>(null)
  const [opcionesModal, setOpcionesModal] = useState<Record<string, string[]>>({})
  const [cantidadModal, setCantidadModal] = useState(1)
  const [notaModal, setNotaModal] = useState('')

  const mesasPorSalon = useMemo(
    () =>
      SALONES.map((salon) => ({
        salon,
        mesas: MESAS.filter((mesa) => mesa.salonId === salon.id),
      })),
    [],
  )

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    return PRODUCTOS.filter((producto) => {
      const coincideCategoria = !tipoServicio || producto.categoria === tipoServicio
      const coincideBusqueda =
        !termino ||
        producto.nombre.toLowerCase().includes(termino) ||
        producto.categoria.toLowerCase().includes(termino)
      return coincideCategoria && coincideBusqueda
    })
  }, [tipoServicio, busqueda])

  const total = items.reduce((suma, item) => suma + precioLinea(item), 0)
  const { subtotal, iva } = desglosarIva(total)
  const unidades = items.reduce((suma, item) => suma + item.cantidad, 0)

  const completado = [
    tipoPedido === 'domicilio'
      ? cliente.nombre.trim().length > 2
      : mesasSeleccionadas.length > 0,
    Boolean(tipoServicio),
    items.length > 0,
    false,
  ]

  const puedeAvanzar = () => {
    if (paso === 0) {
      if (tipoPedido === 'domicilio') return true
      return mesasSeleccionadas.length > 0
    }
    if (paso === 1) return Boolean(tipoServicio)
    if (paso === 2) return items.length > 0
    return false
  }

  const alternarMesa = (mesa: Mesa) => {
    if (mesasOcupadas.has(mesa.id)) return
    setMesasSeleccionadas((actuales) =>
      actuales.some((item) => item.id === mesa.id)
        ? actuales.filter((item) => item.id !== mesa.id)
        : [...actuales, mesa],
    )
  }

  const cantidadDeProducto = (productoId: string) =>
    items
      .filter((item) => item.productoId === productoId)
      .reduce((suma, item) => suma + item.cantidad, 0)

  const agregarRapido = (producto: Producto) => {
    setItems((actuales) => {
      const existente = actuales.find(
        (item) => item.productoId === producto.id && item.opciones.length === 0 && !item.nota,
      )
      if (existente) {
        return actuales.map((item) =>
          item.id === existente.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      }
      return [
        ...actuales,
        {
          id: nuevoId(),
          productoId: producto.id,
          nombre: producto.nombre,
          categoria: producto.categoria,
          precioUnitario: producto.precio,
          cantidad: 1,
          opciones: [],
        },
      ]
    })
  }

  const quitarRapido = (producto: Producto) => {
    setItems((actuales) => {
      const indice = [...actuales]
        .reverse()
        .findIndex((item) => item.productoId === producto.id && item.opciones.length === 0 && !item.nota)
      if (indice === -1) return actuales
      const posicion = actuales.length - 1 - indice
      const copia = [...actuales]
      if (copia[posicion].cantidad > 1) {
        copia[posicion] = { ...copia[posicion], cantidad: copia[posicion].cantidad - 1 }
      } else {
        copia.splice(posicion, 1)
      }
      return copia
    })
  }

  const abrirPersonalizacion = (producto: Producto) => {
    const iniciales: Record<string, string[]> = {}
    producto.grupos.forEach((grupo) => {
      iniciales[grupo.id] = []
    })
    setProductoModal(producto)
    setOpcionesModal(iniciales)
    setCantidadModal(1)
    setNotaModal('')
  }

  const alternarOpcion = (grupoId: string, opcionId: string, unica: boolean) => {
    setOpcionesModal((actuales) => {
      const seleccion = actuales[grupoId] ?? []
      if (unica) {
        return { ...actuales, [grupoId]: seleccion.includes(opcionId) ? [] : [opcionId] }
      }
      return {
        ...actuales,
        [grupoId]: seleccion.includes(opcionId)
          ? seleccion.filter((id) => id !== opcionId)
          : [...seleccion, opcionId],
      }
    })
  }

  const opcionesDelModal = useMemo(() => {
    if (!productoModal) return { opciones: [], extra: 0 }
    const elegidas: { grupo: string; nombre: string; precio: number }[] = []
    productoModal.grupos.forEach((grupo) => {
      const ids = opcionesModal[grupo.id] ?? []
      grupo.opciones
        .filter((opcion) => ids.includes(opcion.id))
        .forEach((opcion) =>
          elegidas.push({ grupo: grupo.nombre, nombre: opcion.nombre, precio: opcion.precio }),
        )
    })
    return { opciones: elegidas, extra: elegidas.reduce((suma, item) => suma + item.precio, 0) }
  }, [productoModal, opcionesModal])

  const agregarDesdeModal = () => {
    if (!productoModal) return
    setItems((actuales) => [
      ...actuales,
      {
        id: nuevoId(),
        productoId: productoModal.id,
        nombre: productoModal.nombre,
        categoria: productoModal.categoria,
        precioUnitario: productoModal.precio,
        cantidad: cantidadModal,
        opciones: opcionesDelModal.opciones,
        nota: notaModal.trim() || undefined,
      },
    ])
    setProductoModal(null)
  }

  const reiniciar = () => {
    setPaso(0)
    setTipoPedido('mesa')
    setMesasSeleccionadas([])
    setTipoServicio(undefined)
    setItems([])
    setObservaciones('')
    setBusqueda('')
    setCliente({ nombre: '', telefono: '', direccion: '', esParaLlevar: false })
  }

  const enviarComanda = () => {
    if (items.length === 0) return
    if (tipoPedido === 'domicilio' && cliente.nombre.trim().length < 3) return
    if (tipoPedido === 'domicilio' && !cliente.esParaLlevar && cliente.direccion.trim().length < 5)
      return

    const comanda = crearComanda({
      tipo: tipoPedido === 'domicilio' ? (cliente.esParaLlevar ? 'llevar' : 'domicilio') : 'mesa',
      mesero: MESEROS[0].nombre,
      mesaId: mesasSeleccionadas[0]?.id,
      cliente: cliente.nombre.trim() || undefined,
      telefono: cliente.telefono.trim() || undefined,
      direccion: cliente.direccion.trim() || undefined,
      items,
      nota: observaciones.trim() || undefined,
    })
    notificar(`Comanda #${comanda.numero} enviada a cocina`)
    reiniciar()
    onVerComanda(comanda.id)
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Indicador de pasos */}
        <div className="card py-1 lg:py-3 mb-6">
          <div className="hidden lg:flex items-center justify-between">
            {PASOS.map((titulo, indice) => (
              <div key={titulo} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    indice === paso
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : completado[indice] && indice < paso
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-secondary-300 bg-white text-secondary-500'
                  }`}
                >
                  {completado[indice] && indice < paso ? (
                    <Check size={20} />
                  ) : (
                    <span className="font-semibold">{indice + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <div
                    className={`font-medium ${
                      indice === paso
                        ? 'text-primary-600'
                        : completado[indice] && indice < paso
                          ? 'text-green-600'
                          : 'text-secondary-500'
                    }`}
                  >
                    {titulo}
                  </div>
                </div>
                {indice < PASOS.length - 1 && (
                  <div
                    className={`mx-4 w-16 h-0.5 ${
                      completado[indice] && indice < paso ? 'bg-green-500' : 'bg-secondary-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Paso 0: tipo de pedido y mesas */}
        {paso === 0 && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg mb-2 font-semibold text-secondary-800">Tipo de Pedido</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setTipoPedido('mesa')
                  }}
                  className={`relative rounded-lg border-2 transition-all duration-200 flex gap-2 items-center justify-center p-4 min-h-[70px] ${
                    tipoPedido === 'mesa'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-secondary-300 bg-white hover:border-primary-300 hover:bg-primary-25'
                  }`}
                >
                  <div
                    className={`rounded-full flex items-center justify-center w-9 h-9 ${
                      tipoPedido === 'mesa'
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-600'
                    }`}
                  >
                    <Store size={22} />
                  </div>
                  <h3
                    className={`font-bold ${
                      tipoPedido === 'mesa' ? 'text-primary-700' : 'text-secondary-700'
                    }`}
                  >
                    Mesa
                  </h3>
                  {tipoPedido === 'mesa' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => {
                    setTipoPedido('domicilio')
                    setMesasSeleccionadas([])
                  }}
                  className={`relative rounded-lg border-2 transition-all duration-200 flex gap-2 items-center justify-center p-4 min-h-[70px] ${
                    tipoPedido === 'domicilio'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-secondary-300 bg-white hover:border-green-300 hover:bg-green-25'
                  }`}
                >
                  <div
                    className={`rounded-full flex items-center justify-center w-9 h-9 ${
                      tipoPedido === 'domicilio'
                        ? 'bg-green-500 text-white'
                        : 'bg-secondary-100 text-secondary-600'
                    }`}
                  >
                    <ShoppingBag size={22} />
                  </div>
                  <h3
                    className={`font-bold ${
                      tipoPedido === 'domicilio' ? 'text-green-700' : 'text-secondary-700'
                    }`}
                  >
                    Domicilio / Para Llevar
                  </h3>
                  {tipoPedido === 'domicilio' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {tipoPedido === 'mesa' ? (
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-secondary-800 flex items-center">
                    <Users className="mr-2" size={20} />
                    Seleccionar Mesa(s)
                  </h2>
                  {mesasSeleccionadas.length > 0 && (
                    <button
                      onClick={() => setMesasSeleccionadas([])}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center"
                    >
                      <X size={16} className="mr-1" />
                      Limpiar selección
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {mesasPorSalon.map(({ salon, mesas }) => (
                    <div key={salon.id} className="border rounded-lg p-4 bg-secondary-25">
                      <h3 className="font-semibold text-lg text-secondary-800 mb-3 border-b pb-2">
                        {salon.nombre}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {mesas.map((mesa) => {
                          const ocupada = mesasOcupadas.has(mesa.id)
                          const seleccionada = mesasSeleccionadas.some(
                            (item) => item.id === mesa.id,
                          )
                          return (
                            <button
                              key={mesa.id}
                              onClick={() => alternarMesa(mesa)}
                              disabled={ocupada}
                              title={ocupada ? 'Mesa ocupada' : `Capacidad: ${mesa.capacidad} personas`}
                              className={`relative p-3 rounded-lg border-2 transition-all duration-200 min-h-[70px] ${
                                seleccionada
                                  ? 'border-primary-500 bg-primary-50 shadow-md'
                                  : ocupada
                                    ? 'border-red-300 bg-red-50 text-red-700 cursor-not-allowed'
                                    : 'border-secondary-300 bg-white hover:border-primary-300 hover:bg-primary-25'
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-semibold text-sm md:text-base">
                                  {mesa.numero}
                                </div>
                                <div className="text-xs text-secondary-600">
                                  Cap: {mesa.capacidad}
                                </div>
                                {ocupada && (
                                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                                {seleccionada && (
                                  <div className="absolute top-1 right-1">
                                    <Check size={16} className="text-primary-600" />
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {mesasSeleccionadas.length > 0 && (
                  <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="text-sm text-primary-800">
                      <div className="font-semibold mb-2">
                        Mesa(s) seleccionada(s): {mesasSeleccionadas.length}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mesasSeleccionadas.map((mesa) => (
                          <span
                            key={mesa.id}
                            className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 rounded-md text-xs"
                          >
                            {nombreMesa(mesa)}
                            <button
                              onClick={() => alternarMesa(mesa)}
                              className="ml-1 hover:text-primary-600"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-primary-600">
                        Capacidad total:{' '}
                        {mesasSeleccionadas.reduce((suma, mesa) => suma + mesa.capacidad, 0)}{' '}
                        personas
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <h2 className="text-xl font-semibold text-secondary-800 mb-4">Datos del Cliente</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      className="input-field"
                      value={cliente.nombre}
                      onChange={(evento) =>
                        setCliente({ ...cliente, nombre: evento.target.value })
                      }
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      className="input-field"
                      value={cliente.telefono}
                      onChange={(evento) =>
                        setCliente({ ...cliente, telefono: evento.target.value })
                      }
                      placeholder="300 000 0000"
                    />
                  </div>
                  {!cliente.esParaLlevar && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Dirección de entrega *
                      </label>
                      <input
                        className="input-field"
                        value={cliente.direccion}
                        onChange={(evento) =>
                          setCliente({ ...cliente, direccion: evento.target.value })
                        }
                        placeholder="Calle 8 #4-21, barrio…"
                      />
                    </div>
                  )}
                  <label className="md:col-span-2 flex items-center gap-2 text-sm text-secondary-700">
                    <input
                      type="checkbox"
                      checked={cliente.esParaLlevar}
                      onChange={(evento) =>
                        setCliente({ ...cliente, esParaLlevar: evento.target.checked })
                      }
                      className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    El cliente recoge en el restaurante (para llevar)
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paso 1: tipo de servicio */}
        {paso === 1 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-secondary-800 mb-6">
              Seleccionar Tipo de Servicio
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIAS.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setTipoServicio(categoria)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                    tipoServicio === categoria
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-secondary-300 bg-white hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{ICONOS[categoria] ?? '🍽️'}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-800 mb-1 capitalize">
                        {categoria}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {DESCRIPCIONES[categoria] ?? `Productos de ${categoria.toLowerCase()}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {tipoServicio && (
              <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="text-sm text-primary-800">
                  <strong>Tipo seleccionado:</strong> <span>{tipoServicio}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paso 2: productos */}
        {paso === 2 && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input
                    className="input-field pl-9 py-2.5"
                    placeholder="Buscar producto por nombre…"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.slice(0, 4).map((categoria) => (
                    <button
                      key={categoria}
                      onClick={() => setTipoServicio(categoria)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        tipoServicio === categoria
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-secondary-600 border-secondary-300 hover:border-primary-300'
                      }`}
                    >
                      {categoria}
                    </button>
                  ))}
                  <select
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-secondary-300 bg-white text-secondary-600"
                    value={tipoServicio ?? ''}
                    onChange={(evento) => setTipoServicio(evento.target.value || undefined)}
                  >
                    <option value="">Todas las categorías</option>
                    {CATEGORIAS.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-secondary-800">
                  Productos Disponibles
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-secondary-500">{productosFiltrados.length} productos</span>
                  {unidades > 0 && (
                    <span className="font-semibold text-primary-600">
                      {unidades} und. · {formatearMoneda(total)}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productosFiltrados.map((producto) => {
                  const cantidad = cantidadDeProducto(producto.id)
                  return (
                    <div
                      key={producto.id}
                      className="border border-secondary-200 rounded-lg p-4 bg-white flex flex-col"
                    >
                      <div className="mb-3 flex-1">
                        <h3 className="font-semibold text-secondary-800 mb-1 flex items-center flex-wrap gap-1">
                          {producto.nombre}
                          {producto.grupos.length > 0 && (
                            <button
                              onClick={() => abrirPersonalizacion(producto)}
                              className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 rounded-full"
                              title="Personalizar producto"
                            >
                              <Settings size={14} />
                            </button>
                          )}
                        </h3>
                        {producto.descripcion && (
                          <p className="text-sm text-secondary-600 mb-2 break-words">
                            {producto.descripcion}
                          </p>
                        )}
                        <p className="text-lg font-bold text-primary-600">
                          {formatearMoneda(producto.precio)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => quitarRapido(producto)}
                            disabled={cantidad === 0}
                            className="w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-semibold">{cantidad}</span>
                          <button
                            onClick={() => agregarRapido(producto)}
                            className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center"
                            title="Agregar producto"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        {cantidad > 0 && (
                          <button
                            onClick={() =>
                              setItems((actuales) =>
                                actuales.filter((item) => item.productoId !== producto.id),
                              )
                            }
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Quitar todos"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-secondary-800">
                  Comanda en curso · {unidades} und.
                </h3>
                <span className="text-lg font-bold text-primary-600">
                  {formatearMoneda(total)}
                </span>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-secondary-500">
                  Aún no hay productos. Usa los botones + de la carta.
                </p>
              ) : (
                <ul className="divide-y divide-secondary-100">
                  {items.map((item) => (
                    <li key={item.id} className="py-2 flex items-start gap-3">
                      <span className="text-sm font-semibold text-secondary-700">
                        {item.cantidad}x
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary-800">{item.nombre}</p>
                        {item.opciones.length > 0 && (
                          <p className="text-xs text-secondary-500">
                            {item.opciones.map((opcion) => opcion.nombre).join(' · ')}
                          </p>
                        )}
                        {item.nota && <p className="text-xs italic text-secondary-500">{item.nota}</p>}
                      </div>
                      <span className="text-sm font-semibold text-secondary-800">
                        {formatearMoneda(precioLinea(item))}
                      </span>
                      <button
                        onClick={() =>
                          setItems((actuales) => actuales.filter((otro) => otro.id !== item.id))
                        }
                        className="text-red-400 hover:text-red-600"
                        aria-label="Quitar"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Paso 3: resumen */}
        {paso === 3 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Resumen y Envío</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="font-semibold text-secondary-700 mb-3">Items de la Comanda</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 border-b border-secondary-100 pb-3"
                    >
                      <div>
                        <p className="font-medium text-secondary-800">
                          {item.cantidad}x {item.nombre}
                        </p>
                        {item.opciones.length > 0 && (
                          <p className="text-xs text-secondary-600">
                            {item.opciones.map((opcion) => opcion.nombre).join(' · ')}
                          </p>
                        )}
                        {item.nota && (
                          <p className="text-xs italic text-secondary-500">{item.nota}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-900">
                          {formatearMoneda(precioLinea(item))}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {formatearMoneda(item.precioUnitario)} c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Observaciones generales
                  </label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={observaciones}
                    onChange={(evento) => setObservaciones(evento.target.value)}
                    placeholder="Ej. servir todo al mismo tiempo, cumpleaños…"
                  />
                </div>
              </div>

              <div>
                <div className="bg-secondary-50 rounded-lg p-4">
                  <h3 className="font-semibold text-secondary-700 mb-3">Información Adicional</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Tipo de pedido:</span>
                      <span className="font-medium text-secondary-800">
                        {tipoPedido === 'mesa'
                          ? 'Mesa'
                          : cliente.esParaLlevar
                            ? 'Para llevar'
                            : 'Domicilio'}
                      </span>
                    </div>
                    {tipoPedido === 'mesa' && (
                      <div className="flex justify-between gap-3">
                        <span className="text-secondary-600">Mesa(s):</span>
                        <span className="font-medium text-secondary-800 text-right">
                          {mesasSeleccionadas.map(nombreMesa).join(', ')}
                        </span>
                      </div>
                    )}
                    {tipoPedido === 'domicilio' && (
                      <>
                        <div className="flex justify-between gap-3">
                          <span className="text-secondary-600">Cliente:</span>
                          <span className="font-medium text-secondary-800 text-right">
                            {cliente.nombre}
                          </span>
                        </div>
                        {cliente.telefono && (
                          <div className="flex justify-between gap-3">
                            <span className="text-secondary-600">Teléfono:</span>
                            <span className="font-medium text-secondary-800 text-right">
                              {cliente.telefono}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Tipo de servicio:</span>
                      <span className="font-medium text-secondary-800">{tipoServicio}</span>
                    </div>
                    <div className="border-t border-secondary-200 pt-2 flex justify-between">
                      <span className="text-secondary-600">Subtotal:</span>
                      <span className="font-medium text-secondary-800">
                        {formatearMoneda(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">IVA incluido (19%):</span>
                      <span className="font-medium text-secondary-800">{formatearMoneda(iva)}</span>
                    </div>
                    <div className="flex justify-between text-base border-t border-secondary-200 pt-2">
                      <span className="font-semibold text-secondary-800">Total:</span>
                      <span className="font-bold text-primary-600">{formatearMoneda(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={enviarComanda}
                  disabled={
                    items.length === 0 ||
                    (tipoPedido === 'domicilio' &&
                      (cliente.nombre.trim().length < 3 ||
                        (!cliente.esParaLlevar && cliente.direccion.trim().length < 5)))
                  }
                  className="btn-primary w-full mt-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="mr-2" size={18} />
                  Enviar Comanda
                </button>
                <button
                  onClick={reiniciar}
                  className="btn-secondary w-full mt-2 flex items-center justify-center"
                >
                  <X className="mr-2" size={18} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setPaso((valor) => Math.max(0, valor - 1))}
            disabled={paso === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft size={20} className="mr-2" />
            Anterior
          </button>

          {paso < PASOS.length - 1 ? (
            <button
              onClick={() => puedeAvanzar() && setPaso((valor) => valor + 1)}
              disabled={!puedeAvanzar()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Siguiente
              <ChevronRight size={20} className="ml-2" />
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {productoModal && (
        <Modal
          titulo={productoModal.nombre}
          subtitulo={`${productoModal.categoria} · ${formatearMoneda(productoModal.precio)}`}
          onCerrar={() => setProductoModal(null)}
          ancho="lg"
          pie={
            <>
              <div className="flex-1">
                <div className="text-xs text-secondary-500">Total de la línea</div>
                <div className="text-lg font-bold text-secondary-900">
                  {formatearMoneda((productoModal.precio + opcionesDelModal.extra) * cantidadModal)}
                </div>
              </div>
              <button className="btn-secondary py-2 px-4" onClick={() => setProductoModal(null)}>
                Cancelar
              </button>
              <button className="btn-primary py-2 px-4 flex items-center" onClick={agregarDesdeModal}>
                <Plus size={16} className="mr-1" /> Agregar
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <span className="block text-sm font-medium text-secondary-700 mb-2">Cantidad</span>
              <div className="inline-flex items-center rounded-lg border border-secondary-300">
                <button
                  onClick={() => setCantidadModal((valor) => Math.max(1, valor - 1))}
                  className="w-9 h-9 flex items-center justify-center text-secondary-600 hover:bg-secondary-100"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-semibold">{cantidadModal}</span>
                <button
                  onClick={() => setCantidadModal((valor) => valor + 1)}
                  className="w-9 h-9 flex items-center justify-center text-secondary-600 hover:bg-secondary-100"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {productoModal.grupos.map((grupo) => (
              <div key={grupo.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-secondary-800">{grupo.nombre}</span>
                  <span className="text-[11px] text-secondary-500">
                    {grupo.tipo === 'unica' ? 'Elige una' : 'Varias opciones'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {grupo.opciones.map((opcion) => {
                    const activa = (opcionesModal[grupo.id] ?? []).includes(opcion.id)
                    return (
                      <button
                        key={opcion.id}
                        onClick={() => alternarOpcion(grupo.id, opcion.id, grupo.tipo === 'unica')}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                          activa
                            ? 'border-primary-500 bg-primary-50 text-primary-800'
                            : 'border-secondary-300 bg-white hover:border-secondary-400'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded ${
                            activa ? 'bg-primary-500 text-white' : 'border border-secondary-300'
                          }`}
                        >
                          {activa && <Check size={11} />}
                        </span>
                        <span className="flex-1">{opcion.nombre}</span>
                        {opcion.precio > 0 && (
                          <span className="text-xs font-semibold text-secondary-500">
                            +{formatearMoneda(opcion.precio)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div>
              <span className="block text-sm font-medium text-secondary-700 mb-2">
                Nota para cocina
              </span>
              <input
                className="input-field py-2"
                value={notaModal}
                onChange={(evento) => setNotaModal(evento.target.value)}
                placeholder="Ej. sin sal, bien cocido…"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
