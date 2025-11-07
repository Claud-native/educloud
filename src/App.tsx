import { useState, useEffect } from 'react';
import { TeacherDashboard } from './components/teacher-dashboard';
import { StudentView } from './components/student-view';
import { AIValuationMobile } from './components/ai-valuation-mobile';
import { Login } from './components/login';
import { Register, FormRegisterData } from './components/register';
import { GraduationCap, Users, Sparkles, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { getCurrentUser, logout } from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userRole, setUserRole] = useState<'teacher' | 'student'>('teacher');
  const [userName, setUserName] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar si hay una sesión existente al cargar la aplicación
  useEffect(() => {
    const checkExistingSession = () => {
      const user = getCurrentUser();

      if (user && user.userType) {
        // Hay un usuario en localStorage, restaurar la sesión
        setUserRole(user.userType === 'TEACHER' ? 'teacher' : 'student');
        setUserName(`${user.nombre} ${user.apellido1}`);
        setIsAuthenticated(true);
      }

      setIsCheckingAuth(false);
    };

    checkExistingSession();
  }, []);

  const handleLogin = (email: string, password: string, userType: 'teacher' | 'student') => {
    // El login real ya se hace en el componente Login
    // Aquí solo actualizamos el estado de la UI
    const user = getCurrentUser();

    if (user) {
      setUserRole(userType);
      setUserName(`${user.nombre} ${user.apellido1}`);
      setIsAuthenticated(true);
    }
  };

  const handleRegister = (data: FormRegisterData) => {
    // El registro real ya se hace en el componente Register
    // Aquí solo actualizamos el estado de la UI
    const user = getCurrentUser();

    if (user) {
      setUserRole(data.userType);
      setUserName(data.name);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    // Llamar al logout del backend
    await logout();

    // Limpiar el estado de la UI
    setIsAuthenticated(false);
    setUserName('');
    setShowRegister(false);
  };

  // Mostrar un loader mientras verificamos la sesión
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login o register
  if (!isAuthenticated) {
    if (showRegister) {
      return <Register onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
  }

  // Si está autenticado, mostrar la aplicación
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">EduCloud Platform</h1>
                <p className="text-sm text-gray-500">Sistema educativo integral</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole === 'teacher' ? 'Profesor' : 'Alumno'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700">Conectado a la nube</span>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-blue-700">VPN Segura</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue={userRole === 'teacher' ? 'teacher' : 'student'} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-6 grid-cols-2">
            {userRole === 'teacher' ? (
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Profesor
              </TabsTrigger>
            ) : (
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Alumno
              </TabsTrigger>
            )}
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Tasación IA
            </TabsTrigger>
          </TabsList>

          {userRole === 'teacher' && (
            <TabsContent value="teacher">
              <TeacherDashboard />
            </TabsContent>
          )}

          {userRole === 'student' && (
            <TabsContent value="student">
              <StudentView />
            </TabsContent>
          )}

          <TabsContent value="ai">
            <AIValuationMobile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
