import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText,
  AlertTriangle,
  TrendingUp,
  Bell,
  Download,
  Star
} from 'lucide-react';

export function StudentView() {
  // Mock data
  const studentInfo = {
    name: 'Ana García',
    class: '2º Bachillerato A',
    avatar: 'AG',
    overallGrade: 8.5,
    attendance: 95,
  };

  const grades = [
    { subject: 'Matemáticas', grade: 8.5, trend: 'up', color: 'bg-blue-500' },
    { subject: 'Lengua', grade: 9.0, trend: 'up', color: 'bg-purple-500' },
    { subject: 'Inglés', grade: 8.8, trend: 'up', color: 'bg-green-500' },
    { subject: 'Física', grade: 7.5, trend: 'down', color: 'bg-orange-500' },
    { subject: 'Historia', grade: 9.2, trend: 'up', color: 'bg-pink-500' },
  ];

  const tasks = [
    { 
      id: 1, 
      title: 'Ejercicios de Matemáticas', 
      subject: 'Matemáticas',
      dueDate: '2025-10-25', 
      status: 'pending',
      priority: 'high',
      description: 'Resolver ejercicios del tema 3'
    },
    { 
      id: 2, 
      title: 'Ensayo de Literatura', 
      subject: 'Lengua',
      dueDate: '2025-10-28', 
      status: 'in-progress',
      priority: 'medium',
      description: 'Análisis de Don Quijote'
    },
    { 
      id: 3, 
      title: 'Laboratorio de Física', 
      subject: 'Física',
      dueDate: '2025-10-24', 
      status: 'submitted',
      priority: 'high',
      description: 'Informe práctica de laboratorio'
    },
  ];

  const absences = [
    { date: '2025-10-15', type: 'Justificada', reason: 'Cita médica' },
    { date: '2025-10-10', type: 'Retraso', reason: '10 minutos' },
  ];

  const notifications = [
    { id: 1, text: 'Nueva tarea: Ejercicios de Matemáticas', time: '2h', type: 'task' },
    { id: 2, text: 'Calificación publicada: Física (7.5)', time: '5h', type: 'grade' },
    { id: 3, text: 'Recordatorio: Entrega mañana', time: '1d', type: 'reminder' },
  ];

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pendiente</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>;
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800">Entregada</Badge>;
      default:
        return <Badge>Normal</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Mobile App Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-full flex items-center justify-center">
                <span className="text-xl">{studentInfo.avatar}</span>
              </div>
              <div>
                <h3 className="text-lg">{studentInfo.name}</h3>
                <p className="text-sm text-blue-100">{studentInfo.class}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-blue-100">Nota Media</p>
              <p className="text-2xl mt-1">{studentInfo.overallGrade}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-blue-100">Asistencia</p>
              <p className="text-2xl mt-1">{studentInfo.attendance}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl">{grades.length}</p>
            <p className="text-xs text-gray-600">Asignaturas</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl">{tasks.length}</p>
            <p className="text-xs text-gray-600">Tareas</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl">{absences.length}</p>
            <p className="text-xs text-gray-600">Faltas</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Notificaciones</CardTitle>
            <Badge className="bg-red-500">{notifications.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <Bell className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notif.text}</p>
                    <p className="text-xs text-gray-500">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Grades Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Mis Notas
          </CardTitle>
          <CardDescription>Actualización en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {grades.map((grade, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`${grade.color} w-2 h-12 rounded-full`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{grade.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{grade.grade}</span>
                      {grade.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                      )}
                    </div>
                  </div>
                  <Progress value={grade.grade * 10} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Mis Tareas
          </CardTitle>
          <CardDescription>Próximas entregas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-blue-600">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      {getPriorityIcon(task.priority)}
                      <div>
                        <h4 className="text-sm">{task.title}</h4>
                        <p className="text-xs text-gray-600">{task.subject}</p>
                      </div>
                    </div>
                    {getTaskStatusBadge(task.status)}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {task.dueDate}
                    </div>
                    {task.status === 'submitted' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Subir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Absences Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Mis Faltas
          </CardTitle>
          <CardDescription>Registro de asistencia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {absences.map((absence, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-600" />
                    <span className="text-sm">{absence.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{absence.reason}</p>
                </div>
                <Badge className={absence.type === 'Justificada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {absence.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VPN Access Button */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm">Acceso a Intranet</h4>
                <p className="text-xs text-gray-600">Apuntes y recursos</p>
              </div>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-3 w-3 mr-1" />
              Conectar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
