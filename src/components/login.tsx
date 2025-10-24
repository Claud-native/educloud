import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, Lock, Mail, Eye, EyeOff, LogIn, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { login, healthCheck, HealthCheckResponse } from '../services/api';

interface LoginProps {
  onLogin: (email: string, password: string, userType: 'teacher' | 'student') => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const handleHealthCheck = async () => {
    setIsCheckingHealth(true);
    setError('');

    try {
      const result = await healthCheck();
      setHealthStatus(result);

      if (result.status === 'DOWN') {
        setError('El servidor backend no está disponible');
      }
    } catch (error) {
      console.error('Error en health check:', error);
      setError('Error al verificar el estado del servidor');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, introduce un email válido');
      return;
    }

    setIsLoading(true);

    try {
      // Llamada real al backend
      const result = await login({ email, password });

      if (result.success && result.user) {
        // Login exitoso
        const userType = result.user.userType === 'TEACHER' ? 'teacher' : 'student';
        onLogin(email, password, userType);
      } else {
        // Login fallido
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error al conectar con el servidor. Verifica que el backend esté disponible.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl mb-2">EduCloud Platform</h1>
          <p className="text-gray-600">Bienvenido al sistema educativo integral</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-t-4 border-t-blue-600">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Health Check Status */}
            <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Estado del Backend</span>
              </div>
              <div className="flex items-center gap-2">
                {healthStatus && (
                  <div className="flex items-center gap-2">
                    {healthStatus.status === 'UP' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">
                          Conectado ({healthStatus.responseTime}ms)
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-red-600 font-medium">Desconectado</span>
                      </>
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleHealthCheck}
                  disabled={isCheckingHealth}
                  className="h-7 text-xs"
                >
                  {isCheckingHealth ? (
                    <>
                      <div className="h-3 w-3 mr-1 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Verificando...
                    </>
                  ) : (
                    'Verificar'
                  )}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Recordarme
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="outline" disabled={isLoading}>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" disabled={isLoading}>
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z" />
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿No tienes una cuenta? </span>
              <button
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Regístrate aquí
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Conexión segura mediante VPN</span>
        </div>
      </div>
    </div>
  );
}
