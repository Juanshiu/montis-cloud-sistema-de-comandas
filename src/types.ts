export type VistaId = 'comandas' | 'caja' | 'historial' | 'reportes' | 'administracion'

export type TipoServicio = 'mesa' | 'llevar' | 'domicilio'
export type EstadoComanda = 'abierta' | 'pagada' | 'anulada'
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

export interface Salon {
  id: string
  nombre: string
  descripcion: string
}

export interface Mesa {
  id: string
  salonId: string
  numero: string
  capacidad: number
}

export interface Opcion {
  id: string
  nombre: string
  precio: number
}

export interface GrupoOpciones {
  id: string
  nombre: string
  tipo: 'unica' | 'multiple'
  requerido: boolean
  opciones: Opcion[]
}

export interface Producto {
  id: string
  nombre: string
  precio: number
  categoria: string
  descripcion?: string
  grupos: GrupoOpciones[]
}

export interface OpcionSeleccionada {
  grupo: string
  nombre: string
  precio: number
}

export interface ItemComanda {
  id: string
  productoId: string
  nombre: string
  categoria: string
  precioUnitario: number
  cantidad: number
  opciones: OpcionSeleccionada[]
  nota?: string
}

export interface PagoComanda {
  metodo: MetodoPago
  recibido: number
  propina: number
  cambio: number
  referencia?: string
}

export interface Comanda {
  id: string
  numero: number
  tipo: TipoServicio
  estado: EstadoComanda
  mesero: string
  mesaId?: string
  cliente?: string
  telefono?: string
  direccion?: string
  items: ItemComanda[]
  nota?: string
  creadaEn: string
  cerradaEn?: string
  pago?: PagoComanda
}

export interface Mesero {
  id: string
  nombre: string
  turno: string
}
