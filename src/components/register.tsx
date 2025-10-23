import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, Lock, Mail, Eye, EyeOff, User, Users, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';

interface RegisterProps {
  onRegister: (data: RegisterData) => void;
  onSwitchToLogin: () => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: 'teacher' | 'student';
  studentId?: string;
  teacherId?: string;
  subject?: string;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    userType: 'student',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name || !formData.email || !formData.password || !confirmPassword) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, introduce un email válido');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    if (formData.userType === 'student' && !formData.studentId) {
      setError('El ID de estudiante es obligatorio para alumnos');
      return;
    }

    if (formData.userType === 'teacher' && (!formData.teacherId || !formData.subject)) {
      setError('El ID de profesor y la asignatura son obligatorios para profesores');
      return;
    }

    setIsLoading(true);

    // Simulación de llamada al backend
    setTimeout(() => {
      setIsLoading(false);
      onRegister(formData);
    }, 1000);
  };

  const updateFormData = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl mb-2">Crear Cuenta</h1>
          <p className="text-gray-600">Únete a EduCloud Platform</p>
        </div>

        {/* Register Card */}
        <Card className="shadow-xl border-t-4 border-t-purple-600">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Registro</CardTitle>
            <CardDescription className="text-center">
              Completa el formulario para crear tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* User Type Selection */}
              <div className="space-y-2">
                <Label>Tipo de Usuario</Label>
                <RadioGroup
                  value={formData.userType}
                  onValueChange={(value) => updateFormData('userType', value as 'teacher' | 'student')}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <RadioGroupItem value="student" id="student" className="peer sr-only" />
                    <Label
                      htmlFor="student"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
                    >
                      <BookOpen className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="text-sm">Alumno</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                    <Label
                      htmlFor="teacher"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 cursor-pointer transition-all"
                    >
                      <Users className="h-6 w-6 mb-2 text-purple-600" />
                      <span className="text-sm">Profesor</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez García"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Student/Teacher ID */}
              {formData.userType === 'student' ? (
                <div className="space-y-2">
                  <Label htmlFor="studentId">ID de Estudiante *</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Ej: EST2024001"
                    value={formData.studentId || ''}
                    onChange={(e) => updateFormData('studentId', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">ID de Profesor *</Label>
                    <Input
                      id="teacherId"
                      type="text"
                      placeholder="Ej: PROF2024001"
                      value={formData.teacherId || ''}
                      onChange={(e) => updateFormData('teacherId', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asignatura Principal *</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Ej: Matemáticas, Física, Lengua..."
                      value={formData.subject || ''}
                      onChange={(e) => updateFormData('subject', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  Acepto los{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    política de privacidad
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿Ya tienes una cuenta? </span>
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Inicia sesión
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Tus datos están protegidos y encriptados</span>
        </div>
      </div>
    </div>
  );
}
