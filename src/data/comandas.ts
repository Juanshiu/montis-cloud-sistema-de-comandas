import { PRODUCTOS } from '@/data/menu'
import type { Comanda, ItemComanda, MetodoPago, OpcionSeleccionada, Producto, TipoServicio } from '@/types'

/**
 * Datos de demostración.
 *
 * Todo se genera en memoria al cargar la aplicación: no hay base de datos ni
 * llamadas de red. Las horas se calculan respecto al momento de abrir el
 * navegador para que las comandas activas siempre se vean "en curso".
 */

const buscarProducto = (nombre: string): Producto | undefined =>
  PRODUCTOS.find((producto) => producto.nombre === nombre)

const resolverOpciones = (producto: Producto, nombres: string[]): OpcionSeleccionada[] =>
  nombres.flatMap((nombre) => {
    const grupo = producto.grupos.find((g) => g.opciones.some((o) => o.nombre === nombre))
    const opcion = grupo?.opciones.find((o) => o.nombre === nombre)
    return grupo && opcion ? [{ grupo: grupo.nombre, nombre: opcion.nombre, precio: opcion.precio }] : []
  })

/** Crea una línea de comanda a partir del nombre exacto del producto. */
export const linea = (
  nombre: string,
  cantidad: number,
  opciones: string[] = [],
  nota?: string,
): ItemComanda | null => {
  const producto = buscarProducto(nombre)
  if (!producto) return null
  return {
    id: `${producto.id}-${Math.random().toString(36).slice(2, 8)}`,
    productoId: producto.id,
    nombre: producto.nombre,
    categoria: producto.categoria,
    precioUnitario: producto.precio,
    cantidad,
    opciones: resolverOpciones(producto, opciones),
    nota,
  }
}

const compacto = (items: (ItemComanda | null)[]): ItemComanda[] =>
  items.filter((item): item is ItemComanda => item !== null)

const AHORA = Date.now()
const haceMinutos = (minutos: number) => new Date(AHORA - minutos * 60000).toISOString()

const diaAnterior = (dias: number, hora: number, minuto: number) => {
  const fecha = new Date(AHORA)
  fecha.setDate(fecha.getDate() - dias)
  fecha.setHours(hora, minuto, 0, 0)
  return fecha.toISOString()
}

const CERRADA = (
  numero: number,
  tipo: TipoServicio,
  mesero: string,
  mesaId: string | undefined,
  items: ItemComanda[],
  creadaEn: string,
  metodo: MetodoPago,
  propina: number,
  cliente?: string,
): Comanda => {
  const total = items.reduce(
    (suma, item) =>
      suma +
      item.cantidad * (item.precioUnitario + item.opciones.reduce((s, o) => s + o.precio, 0)),
    0,
  )
  const aPagar = total + propina
  const recibido =
    metodo === 'efectivo' ? Math.ceil(aPagar / 10000) * 10000 : aPagar
  return {
    id: `comanda-${numero}`,
    numero,
    tipo,
    estado: 'pagada',
    mesero,
    mesaId,
    cliente,
    items,
    creadaEn,
    cerradaEn: new Date(new Date(creadaEn).getTime() + 42 * 60000).toISOString(),
    pago: { metodo, recibido, propina, cambio: recibido - aPagar },
  }
}

// ---------------------------------------------------------------------------
// Comandas abiertas (las mismas que aparecen en Caja y ocupan mesas)
// ---------------------------------------------------------------------------
export const COMANDAS_ABIERTAS: Comanda[] = [
  {
    id: 'comanda-1101',
    numero: 1101,
    tipo: 'mesa',
    estado: 'abierta',
    mesero: 'Camila Restrepo',
    mesaId: 'principal-2',
    items: compacto([
      linea('BANDEJA MONTIS', 2, ['Término medio', 'Sin cebolla']),
      linea('JUGO ADICIONAL', 2, ['Sin azúcar']),
      linea('PORCIÓN PATACONA', 1),
    ]),
    nota: 'Cumpleaños: la torta se lleva al final, sin velas.',
    creadaEn: haceMinutos(38),
  },
  {
    id: 'comanda-1102',
    numero: 1102,
    tipo: 'mesa',
    estado: 'abierta',
    mesero: 'Andrés Felipe Ruiz',
    mesaId: 'salon1-1',
    items: compacto([
      linea('PECHUGA GRILLE', 1, ['Tres cuartos', 'Aguacate']),
      linea('ENSALADA', 1),
      linea('GASEOSA PERSONAL', 1, ['Sin hielo']),
    ]),
    creadaEn: haceMinutos(24),
  },
  {
    id: 'comanda-1103',
    numero: 1103,
    tipo: 'mesa',
    estado: 'abierta',
    mesero: 'Camila Restrepo',
    mesaId: 'principal-5',
    items: compacto([
      linea('PASTA AL CARBONARA', 2, ['Queso extra']),
      linea('BOTELLA AGUA 1LT', 1),
      linea('PORCIÓN BESO ANGEL', 2),
    ]),
    creadaEn: haceMinutos(16),
  },
  {
    id: 'comanda-1104',
    numero: 1104,
    tipo: 'llevar',
    estado: 'abierta',
    mesero: 'Laura Camacho',
    cliente: 'Sandra Milena',
    items: compacto([
      linea('MOJARRA FRITA', 1, ['Sin picante']),
      linea('PORCIÓN ARROZ', 1),
      linea('JUGO ADICIONAL', 1),
    ]),
    creadaEn: haceMinutos(9),
  },
  {
    id: 'comanda-1105',
    numero: 1105,
    tipo: 'domicilio',
    estado: 'abierta',
    mesero: 'Sebastián Medina',
    cliente: 'Julián Ortega',
    telefono: '310 482 7715',
    items: compacto([
      linea('CHURRAZCO', 1, ['Término medio']),
      linea('PORCIÓN PATACONA', 1),
      linea('GASEOSA PERSONAL', 2, ['Con hielo']),
    ]),
    creadaEn: haceMinutos(5),
  },
]

// ---------------------------------------------------------------------------
// Historial: ventas de los últimos siete días
// ---------------------------------------------------------------------------

/** Generador pseudoaleatorio con semilla para que el historial sea estable. */
const generador = (semilla: number) => {
  let estado = semilla
  return () => {
    estado = (estado + 0x6d2b79f5) | 0
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const azar = generador(20260317)

const POOL = [
  'ALMUERZO COMPLETO',
  'BANDEJA PAISA',
  'BISTEC A CABALLO COMPLETO',
  'POLLO A LA FRICASE',
  'BANDEJA DESAYUNO',
  'HUEVOS MONTIS CON AMOR',
  'CALDO DE BAGRE',
  'CHURRAZCO',
  'COSTILLAS BBQ',
  'PECHUGA GRILLE',
  'PECHUGA MARINERA',
  'TRUCHA AL AJILLO',
  'MOJARRA FRITA',
  'CEVICHE',
  'PASTA AL CARBONARA',
  'ARROZ CON POLLO',
  'PAELLA',
  'PORCIÓN PATACONA',
  'PAPAS FRANCESA',
  'ENSALADA',
  'JUGO ADICIONAL',
  'GASEOSA PERSONAL',
  'CERVEZA AGUILA',
  'MICHELADA',
  'CAFÉ',
  'PORCIÓN BROWNIE',
]

const MESEROS_HISTORIAL = ['Camila Restrepo', 'Andrés Felipe Ruiz', 'Laura Camacho', 'Sebastián Medina']
const METODOS: MetodoPago[] = ['efectivo', 'tarjeta', 'transferencia', 'tarjeta']
const MESAS_HISTORIAL = [
  'principal-1',
  'principal-2',
  'principal-3',
  'principal-4',
  'principal-6',
  'principal-7',
  'principal-8',
  'salon1-2',
  'salon1-3',
  'salon2-1',
  'salon2-2',
]

const elegir = <T,>(lista: T[]) => lista[Math.floor(azar() * lista.length)]

const generarComanda = (numero: number, creadaEn: string): Comanda => {
  const tipo: TipoServicio = azar() < 0.12 ? 'llevar' : azar() < 0.1 ? 'domicilio' : 'mesa'
  const cantidadItems = 1 + Math.floor(azar() * 3)
  const elegidos = new Set<string>()
  while (elegidos.size < cantidadItems) elegidos.add(elegir(POOL))

  const items = compacto(
    [...elegidos].map((nombre) => {
      const producto = buscarProducto(nombre)
      if (!producto) return null
      const grupo = producto.grupos.find((g) => g.id === 'termino' || g.id === 'hielo')
      const opcion = grupo && azar() < 0.45 ? [elegir(grupo.opciones).nombre] : []
      return linea(nombre, 1 + Math.floor(azar() * 2), opcion as string[])
    }),
  )

  const total = items.reduce(
    (suma, item) =>
      suma +
      item.cantidad * (item.precioUnitario + item.opciones.reduce((s, o) => s + o.precio, 0)),
    0,
  )
  const conPropina = azar() < 0.35 ? Math.round(total * 0.1) : 0

  return CERRADA(
    numero,
    tipo,
    elegir(MESEROS_HISTORIAL),
    tipo === 'mesa' ? elegir(MESAS_HISTORIAL) : undefined,
    items,
    creadaEn,
    elegir(METODOS),
    conPropina,
    tipo === 'llevar' ? elegir(['Sandra Milena', 'Carlos Artunduaga', 'Mónica Perdomo']) : undefined,
  )
}

const construirHistorial = (): Comanda[] => {
  let numero = 1099
  const comandas: Comanda[] = []

  // Ventas de hoy (relativas al momento de abrir la demo). Todas anteriores a
  // la comanda abierta más antigua para que la numeración sea coherente.
  const ventasHoy = [55, 88, 115, 140, 170, 205, 260, 320]
  ventasHoy.forEach((minutos) => {
    comandas.push(generarComanda(numero, haceMinutos(minutos)))
    numero -= 1
  })

  const horarios = [12, 13, 13, 14, 18, 19, 20]
  for (let dia = 1; dia <= 6; dia += 1) {
    const cantidad = dia <= 2 ? 6 : 4
    for (let indice = 0; indice < cantidad; indice += 1) {
      comandas.push(
        generarComanda(numero, diaAnterior(dia, elegir(horarios), Math.floor(azar() * 60))),
      )
      numero -= 1
    }
  }

  // Una comanda cancelada, para que el historial muestre los dos estados.
  const anulada = generarComanda(numero, diaAnterior(2, 13, 25))
  comandas.push({
    ...anulada,
    id: `comanda-${numero}-anulada`,
    estado: 'anulada',
    cerradaEn: undefined,
    pago: undefined,
  })

  return comandas
}

export const COMANDAS_HISTORIAL: Comanda[] = construirHistorial()
