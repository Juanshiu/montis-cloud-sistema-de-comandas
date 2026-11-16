import type { Comanda, ItemComanda, TipoServicio } from '@/types'

const formateadorMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export const formatearMoneda = (valor: number) => formateadorMoneda.format(valor)

export const formatearHora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

export const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

export const formatearFechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const mismoDia = (iso: string, referencia = new Date()) => {
  const fecha = new Date(iso)
  return (
    fecha.getDate() === referencia.getDate() &&
    fecha.getMonth() === referencia.getMonth() &&
    fecha.getFullYear() === referencia.getFullYear()
  )
}

export const claveDia = (iso: string) => {
  const fecha = new Date(iso)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(
    fecha.getDate(),
  ).padStart(2, '0')}`
}

/** Minutos transcurridos desde una hora ISO. */
export const minutosTranscurridos = (iso: string) => {
  const diferencia = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.round(diferencia / 60000))
}

export const tiempoRelativo = (iso: string) => {
  const minutos = minutosTranscurridos(iso)
  if (minutos < 1) return 'ahora'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h ${minutos % 60} min`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'ayer' : `hace ${dias} días`
}

export const totalComanda = (comanda: Comanda) =>
  comanda.items.reduce(
    (total, item) =>
      total +
      item.cantidad *
        (item.precioUnitario + item.opciones.reduce((suma, opcion) => suma + opcion.precio, 0)),
    0,
  )

export const precioUnitarioConOpciones = (item: ItemComanda) =>
  item.precioUnitario + item.opciones.reduce((suma, opcion) => suma + opcion.precio, 0)

export const precioLinea = (item: ItemComanda) => item.cantidad * precioUnitarioConOpciones(item)

export const totalItems = (comanda: Comanda) =>
  comanda.items.reduce((total, item) => total + item.cantidad, 0)

/** En Colombia los precios de carta llevan el IVA incluido; aquí se desglosa. */
export const desglosarIva = (total: number, porcentaje = 19) => {
  const subtotal = Math.round(total / (1 + porcentaje / 100))
  return { subtotal, iva: total - subtotal, total }
}

export const etiquetaTipoServicio = (tipo: TipoServicio) =>
  tipo === 'mesa' ? 'Mesa' : tipo === 'llevar' ? 'Para llevar' : 'Domicilio'
