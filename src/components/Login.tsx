import { useState } from 'react'
import { Building2, Lock, LogIn, Mail } from 'lucide-react'

interface Props {
  onEntrar: () => void
}

export default function Login({ onEntrar }: Props) {
  const [empresaEmail, setEmpresaEmail] = useState('demo@montiscloud.com')
  const [usuarioEmail, setUsuarioEmail] = useState('demo@montiscloud.com')
  const [password, setPassword] = useState("demo1234")
  const [procesando, setProcesando] = useState(false)

  const ingresar = (evento: React.FormEvent) => {
    evento.preventDefault()
    if (procesando) return
    setProcesando(true)
    window.setTimeout(() => {
      setProcesando(false)
      onEntrar()
    }, 350)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <LogIn className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sistema de Comandas</h1>
          <p className="text-primary-100 text-lg">Gestión Profesional</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-secondary-800 mb-6 text-center">
            Iniciar Sesión
          </h2>

          <form onSubmit={ingresar} className="space-y-5">
            <div>
              <label
                htmlFor="empresaEmail"
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Empresa (correo del administrador)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="empresaEmail"
                  type="email"
                  value={empresaEmail}
                  onChange={(evento) => setEmpresaEmail(evento.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="admin@miempresa.com"
                  autoFocus
                />
              </div>
              <p className="mt-1 text-xs text-secondary-500">
                El correo del administrador de tu empresa
              </p>
            </div>

            <div>
              <label
                htmlFor="usuarioEmail"
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Tu Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="usuarioEmail"
                  type="email"
                  value={usuarioEmail}
                  onChange={(evento) => setUsuarioEmail(evento.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
              <p className="mt-1 text-xs text-secondary-500">
                El email con el que te registraron como empleado
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(evento) => setPassword(evento.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!empresaEmail || !usuarioEmail || !password || procesando}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {procesando ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-secondary-500">
            Demostración: los datos se generan en el navegador.
          </p>
        </div>
      </div>
    </div>
  )
}
