import { useState } from 'react';
import { TeacherDashboard } from './components/teacher-dashboard';
import { StudentView } from './components/student-view';
import { AIValuationMobile } from './components/ai-valuation-mobile';
import { Login } from './components/login';
import { Register, RegisterData } from './components/register';
import { GraduationCap, Users, Sparkles, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userRole, setUserRole] = useState<'teacher' | 'student'>('teacher');
  const [userName, setUserName] = useState('');

  const handleLogin = (email: string, password: string, userType: 'teacher' | 'student') => {
    // Aquí se haría la llamada al backend de Spring Boot
    console.log('Login:', { email, password, userType });
    setUserRole(userType);
    setUserName(email.split('@')[0]);
    setIsAuthenticated(true);
  };

  const handleRegister = (data: RegisterData) => {
    // Aquí se haría la llamada al backend de Spring Boot
    console.log('Register:', data);
    setUserRole(data.userType);
    setUserName(data.name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
    setShowRegister(false);
  };

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
        <Tabs defaultValue="teacher" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-6 grid-cols-3">
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Profesor
            </TabsTrigger>
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Alumno
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Tasación IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teacher">
            <TeacherDashboard />
          </TabsContent>

          <TabsContent value="student">
            <StudentView />
          </TabsContent>

          <TabsContent value="ai">
            <AIValuationMobile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
