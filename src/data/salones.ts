import type { Mesa, Mesero, Salon } from '@/types'

export const SALONES: Salon[] = [
  { id: 'principal', nombre: 'Principal', descripcion: 'Mesas 1 a 10 · área climatizada' },
  { id: 'salon1', nombre: 'Salón 1', descripcion: 'Mesas 1-1 a 1-4 · zona lateral' },
  { id: 'salon2', nombre: 'Salón 2', descripcion: 'Mesas 2-1 a 2-4 · zona trasera' },
]

const mesasDe = (salonId: string, etiquetas: string[], capacidades: number[]): Mesa[] =>
  etiquetas.map((numero, indice) => ({
    id: `${salonId}-${indice + 1}`,
    salonId,
    numero,
    capacidad: capacidades[indice % capacidades.length],
  }))

export const MESAS: Mesa[] = [
  ...mesasDe(
    'principal',
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 6],
  ),
  ...mesasDe('salon1', ['1-1', '1-2', '1-3', '1-4'], [4, 4, 4, 4]),
  ...mesasDe('salon2', ['2-1', '2-2', '2-3', '2-4'], [4, 4, 4, 4]),
]

export const MESEROS: Mesero[] = [
  { id: 'camila', nombre: 'Camila Restrepo', turno: 'Turno mañana' },
  { id: 'andres', nombre: 'Andrés Felipe Ruiz', turno: 'Turno mañana' },
  { id: 'laura', nombre: 'Laura Camacho', turno: 'Turno tarde' },
  { id: 'sebastian', nombre: 'Sebastián Medina', turno: 'Turno tarde' },
]

export const MESERO_POR_DEFECTO = 'camila'
