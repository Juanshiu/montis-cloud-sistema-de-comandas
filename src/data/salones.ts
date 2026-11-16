import type { Mesa, Mesero, Salon } from '@/types'

export const SALONES: Salon[] = [
  { id: 'principal', nombre: 'Salón principal', descripcion: 'Mesas 1 a 8 · área climatizada' },
  { id: 'terraza', nombre: 'Terraza', descripcion: 'Mesas 1 a 5 · zona abierta' },
  { id: 'reservado', nombre: 'Reservado', descripcion: 'Mesas 1 a 3 · eventos y reuniones' },
]

const mesasDe = (salonId: string, cantidad: number, capacidades: number[]): Mesa[] =>
  Array.from({ length: cantidad }, (_, indice) => ({
    id: `${salonId}-${indice + 1}`,
    salonId,
    numero: String(indice + 1),
    capacidad: capacidades[indice % capacidades.length],
  }))

export const MESAS: Mesa[] = [
  ...mesasDe('principal', 8, [4, 2, 4, 6, 4, 2, 8, 4]),
  ...mesasDe('terraza', 5, [2, 4, 4, 2, 6]),
  ...mesasDe('reservado', 3, [8, 10, 6]),
]

export const MESEROS: Mesero[] = [
  { id: 'camila', nombre: 'Camila Restrepo', turno: 'Turno mañana' },
  { id: 'andres', nombre: 'Andrés Felipe Ruiz', turno: 'Turno mañana' },
  { id: 'laura', nombre: 'Laura Camacho', turno: 'Turno tarde' },
  { id: 'sebastian', nombre: 'Sebastián Medina', turno: 'Turno tarde' },
]

export const MESERO_POR_DEFECTO = 'camila'
