import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users, 
  ClipboardList, 
  AlertCircle, 
  TrendingUp, 
  Upload, 
  Plus,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export function TeacherDashboard() {
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedClass, setSelectedClass] = useState('2-bach-a');

  // Mock data - Clases disponibles
  const classes = [
    { id: '2-bach-a', name: '2º Bachillerato A', students: 28, subject: 'Matemáticas' },
    { id: '2-bach-b', name: '2º Bachillerato B', students: 25, subject: 'Matemáticas' },
    { id: '1-bach-a', name: '1º Bachillerato A', students: 30, subject: 'Física' },
    { id: '4-eso-c', name: '4º ESO C', students: 27, subject: 'Matemáticas' },
    { id: '3-eso-a', name: '3º ESO A', students: 24, subject: 'Física' },
  ];

  // Mock data - Stats por clase seleccionada
  const getStatsForClass = (classId: string) => {
    const classData: { [key: string]: any } = {
      '2-bach-a': {
        students: '28',
        tasks: '8',
        absences: '12',
        average: '7.8'
      },
      '2-bach-b': {
        students: '25',
        tasks: '6',
        absences: '8',
        average: '8.2'
      },
      '1-bach-a': {
        students: '30',
        tasks: '5',
        absences: '15',
        average: '7.5'
      },
      '4-eso-c': {
        students: '27',
        tasks: '10',
        absences: '18',
        average: '7.2'
      },
      '3-eso-a': {
        students: '24',
        tasks: '7',
        absences: '10',
        average: '8.0'
      },
    };
    return classData[classId] || classData['2-bach-a'];
  };

  const currentStats = getStatsForClass(selectedClass);
  const currentClass = classes.find(c => c.id === selectedClass);

  const stats = [
    { label: 'Total Alumnos', value: currentStats.students, icon: Users, color: 'bg-blue-500', change: '+5%' },
    { label: 'Tareas Pendientes', value: currentStats.tasks, icon: ClipboardList, color: 'bg-purple-500', change: '-2' },
    { label: 'Faltas del Mes', value: currentStats.absences, icon: AlertCircle, color: 'bg-orange-500', change: '+3' },
    { label: 'Promedio Clase', value: currentStats.average, icon: TrendingUp, color: 'bg-green-500', change: '+0.3' },
  ];

  const recentStudents = [
    { id: 1, name: 'Ana García', grade: 8.5, attendance: 95, tasks: 12, status: 'excellent' },
    { id: 2, name: 'Carlos Ruiz', grade: 7.2, attendance: 88, tasks: 10, status: 'good' },
    { id: 3, name: 'María López', grade: 9.1, attendance: 98, tasks: 15, status: 'excellent' },
    { id: 4, name: 'David Martínez', grade: 6.5, attendance: 75, tasks: 8, status: 'warning' },
    { id: 5, name: 'Laura Sánchez', grade: 8.8, attendance: 92, tasks: 13, status: 'excellent' },
  ];

  const pendingTasks = [
    { id: 1, title: 'Ejercicios de Matemáticas', dueDate: '2025-10-25', submitted: 45, total: 60, status: 'pending' },
    { id: 2, title: 'Ensayo de Literatura', dueDate: '2025-10-28', submitted: 30, total: 60, status: 'pending' },
    { id: 3, title: 'Laboratorio de Física', dueDate: '2025-10-24', submitted: 58, total: 60, status: 'due' },
    { id: 4, title: 'Proyecto de Historia', dueDate: '2025-11-01', submitted: 12, total: 60, status: 'pending' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Bien</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">Atención</Badge>;
      default:
        return <Badge>Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Class Selector */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Clase Seleccionada</p>
                <p className="text-lg">{currentClass?.name} - {currentClass?.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Cambiar clase</p>
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.students} alumnos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students">Alumnos</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="attendance">Faltas</TabsTrigger>
          <TabsTrigger value="grades">Notas</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Alumnos</CardTitle>
              <CardDescription>Estado actual de los estudiantes en tus clases</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Nota Media</TableHead>
                    <TableHead>Asistencia</TableHead>
                    <TableHead>Tareas</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.attendance} className="w-16" />
                          <span className="text-sm">{student.attendance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.tasks}</TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl">Gestión de Tareas</h3>
              <p className="text-sm text-gray-600">Crea y administra tareas para tus alumnos</p>
            </div>
            <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Tarea
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Tarea</DialogTitle>
                  <DialogDescription>
                    Completa la información para crear una tarea para tus alumnos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Título de la Tarea</Label>
                    <Input id="task-title" placeholder="Ej: Ejercicios de Matemáticas" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Descripción</Label>
                    <Textarea 
                      id="task-description" 
                      placeholder="Describe los detalles de la tarea..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-date">Fecha de Entrega</Label>
                      <Input id="task-date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-points">Puntuación Máxima</Label>
                      <Input id="task-points" type="number" placeholder="10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-files">Archivos Adjuntos (hasta 5MB)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="task-files" type="file" multiple />
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreatingTask(false)}>
                      Cancelar
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreatingTask(false)}>
                      Crear Tarea
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </CardDescription>
                    </div>
                    {task.status === 'due' ? (
                      <Badge className="bg-red-100 text-red-800">Urgente</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800">Activa</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Entregas</span>
                        <span>{task.submitted}/{task.total}</span>
                      </div>
                      <Progress value={(task.submitted / task.total) * 100} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-3 w-3 mr-1" />
                        Ver Entregas
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Faltas</CardTitle>
              <CardDescription>Control de asistencia en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Justificada</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>David Martínez</TableCell>
                    <TableCell>23/10/2025</TableCell>
                    <TableCell><Badge className="bg-orange-100 text-orange-800">Falta</Badge></TableCell>
                    <TableCell><XCircle className="h-4 w-4 text-red-500" /></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Justificar</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Carlos Ruiz</TableCell>
                    <TableCell>22/10/2025</TableCell>
                    <TableCell><Badge className="bg-yellow-100 text-yellow-800">Retraso</Badge></TableCell>
                    <TableCell><CheckCircle2 className="h-4 w-4 text-green-500" /></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Ver Detalle</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ana García</TableCell>
                    <TableCell>20/10/2025</TableCell>
                    <TableCell><Badge className="bg-orange-100 text-orange-800">Falta</Badge></TableCell>
                    <TableCell><CheckCircle2 className="h-4 w-4 text-green-500" /></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Ver Detalle</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Notas</CardTitle>
              <CardDescription>Administra las calificaciones de tus alumnos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Trimestre 1</TableHead>
                    <TableHead>Trimestre 2</TableHead>
                    <TableHead>Trimestre 3</TableHead>
                    <TableHead>Media</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>8.5</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          placeholder="--" 
                          className="w-16 h-8"
                          step="0.1"
                          min="0"
                          max="10"
                        />
                      </TableCell>
                      <TableCell>--</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Actualizar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
