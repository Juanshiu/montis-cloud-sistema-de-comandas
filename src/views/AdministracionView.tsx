import {
  BadgeDollarSign,
  Boxes,
  Building2,
  ClipboardList,
  CreditCard,
  DoorOpen,
  FileSignature,
  FileText,
  Layers,
  LayoutGrid,
  Package,
  Settings,
  Shield,
  Sliders,
  Tags,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'

interface Seccion {
  nombre: string
  descripcion: string
  icono: typeof Package
}

interface Grupo {
  nombre: string
  descripcion: string
  icono: typeof Package
  clases: {
    borde: string
    cabecera: string
    icono: string
    texto: string
  }
  secciones: Seccion[]
}

const GRUPOS: Grupo[] = [
  {
    nombre: 'Gestión de Menú',
    descripcion: 'Carta, precios y personalizaciones',
    icono: Layers,
    clases: {
      borde: 'border-blue-200',
      cabecera: 'bg-blue-50',
      icono: 'bg-blue-500',
      texto: 'text-blue-700',
    },
    secciones: [
      { nombre: 'Productos', descripcion: 'Carta, precios e impuestos', icono: Package },
      { nombre: 'Categorías', descripcion: 'Organización de la carta', icono: Tags },
      { nombre: 'Personalizaciones', descripcion: 'Adiciones, términos y retiros', icono: Sliders },
      { nombre: 'Inventario', descripcion: 'Insumos y stock mínimo', icono: Boxes },
    ],
  },
  {
    nombre: 'Gestión de Espacios',
    descripcion: 'Salones, mesas y servicio',
    icono: LayoutGrid,
    clases: {
      borde: 'border-green-200',
      cabecera: 'bg-green-50',
      icono: 'bg-green-500',
      texto: 'text-green-700',
    },
    secciones: [
      { nombre: 'Salones', descripcion: 'Zonas del restaurante', icono: DoorOpen },
      { nombre: 'Mesas', descripcion: 'Número, capacidad y estado', icono: LayoutGrid },
      { nombre: 'Comandas', descripcion: 'Historial y anulaciones', icono: ClipboardList },
    ],
  },
  {
    nombre: 'Recursos Humanos',
    descripcion: 'Usuarios, roles y empleados',
    icono: Users,
    clases: {
      borde: 'border-purple-200',
      cabecera: 'bg-purple-50',
      icono: 'bg-purple-500',
      texto: 'text-purple-700',
    },
    secciones: [
      { nombre: 'Usuarios', descripcion: 'Accesos y contraseñas', icono: Users },
      { nombre: 'Empleados', descripcion: 'Datos laborales y turnos', icono: UserCog },
      { nombre: 'Roles y permisos', descripcion: 'Qué puede hacer cada rol', icono: Shield },
      { nombre: 'Liquidaciones', descripcion: 'Nómina y prestaciones', icono: BadgeDollarSign },
    ],
  },
  {
    nombre: 'Operaciones',
    descripcion: 'Facturación y documentos',
    icono: FileText,
    clases: {
      borde: 'border-orange-200',
      cabecera: 'bg-orange-50',
      icono: 'bg-orange-500',
      texto: 'text-orange-700',
    },
    secciones: [
      { nombre: 'Facturación', descripcion: 'Resolución DIAN y numeración', icono: CreditCard },
      { nombre: 'Contratos', descripcion: 'Documentos del personal', icono: FileText },
      { nombre: 'Generar Contrato', descripcion: 'Plantillas y firmas', icono: FileSignature },
    ],
  },
  {
    nombre: 'Finanzas',
    descripcion: 'Nómina, liquidaciones y caja',
    icono: Wallet,
    clases: {
      borde: 'border-teal-200',
      cabecera: 'bg-teal-50',
      icono: 'bg-teal-500',
      texto: 'text-teal-700',
    },
    secciones: [
      { nombre: 'Nómina', descripcion: 'Pagos del periodo', icono: BadgeDollarSign },
      { nombre: 'Liquidaciones', descripcion: 'Prestaciones y retiros', icono: FileText },
      { nombre: 'Arqueo de Caja', descripcion: 'Apertura y cierre de turno', icono: Wallet },
    ],
  },
  {
    nombre: 'Configuración',
    descripcion: 'Empresa y parámetros generales',
    icono: Settings,
    clases: {
      borde: 'border-secondary-200',
      cabecera: 'bg-secondary-100',
      icono: 'bg-secondary-600',
      texto: 'text-secondary-700',
    },
    secciones: [
      { nombre: 'Empresa', descripcion: 'Datos y sucursales', icono: Building2 },
      { nombre: 'Configuración del Sistema', descripcion: 'Parámetros generales', icono: Settings },
      { nombre: 'Impresoras', descripcion: 'Tickets y comandas', icono: LayoutGrid },
    ],
  },
]

export default function AdministracionView() {
  return (
    <div className="bg-gradient-to-br from-secondary-50 via-white to-secondary-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
              <h1 className="text-sm md:text-xl font-bold text-secondary-800">
                Administración - Montis Cloud
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {GRUPOS.map((grupo) => {
            const IconoGrupo = grupo.icono
            return (
              <div
                key={grupo.nombre}
                className={`bg-white rounded-xl shadow-sm border-2 ${grupo.clases.borde} overflow-hidden`}
              >
                <div className={`${grupo.clases.cabecera} p-6 border-b-2 ${grupo.clases.borde}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`${grupo.clases.icono} p-3 rounded-lg`}>
                      <IconoGrupo className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${grupo.clases.texto} mb-1`}>
                        {grupo.nombre}
                      </h3>
                      <p className="text-sm text-secondary-600">{grupo.descripcion}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {grupo.secciones.map((seccion) => {
                    const IconoSeccion = seccion.icono
                    return (
                      <div
                        key={seccion.nombre}
                        className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-transparent cursor-default"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="p-2 bg-secondary-100 rounded-lg">
                            <IconoSeccion className={`h-5 w-5 ${grupo.clases.texto}`} />
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-semibold text-secondary-900">
                              {seccion.nombre}
                            </h4>
                            <p className="text-xs text-secondary-500 line-clamp-1">
                              {seccion.descripcion}
                            </p>
                          </div>
                        </div>
                        <span className="text-secondary-400">›</span>
                      </div>
                    )
                  })}
                </div>

                <div className={`${grupo.clases.cabecera} px-6 py-3 border-t border-secondary-200`}>
                  <p className="text-xs text-secondary-600">
                    {grupo.secciones.length}{' '}
                    {grupo.secciones.length === 1 ? 'sección' : 'secciones'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
