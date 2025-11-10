import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Users,
  Plus,
  GraduationCap,
  Loader2,
  AlertCircle,
  ClipboardList,
  Calendar,
  Star,
  FileText,
  Clock,
  Download,
  File
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import api from '../services/api';
import { getCurrentUser } from '../services/api';

interface Clase {
  id: number;
  nombre: string;
  descripcion: string;
  materia: string;
  curso: string;
  grupo: string;
  anoEscolar: string;
  activa: boolean;
}

interface Estudiante {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
}

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  activa: boolean;
}

interface EntregaTarea {
  id: number;
  estudianteId: number;
  estudianteNombre: string;
  contenido: string;
  fechaEntrega: string;
  estado: string;
  calificacion: number | null;
  comentarioProfesor: string | null;
  archivoUrl?: string;
}

export function TeacherDashboard() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [allStudents, setAllStudents] = useState<Estudiante[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [showEstudianteDialog, setShowEstudianteDialog] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [showTareaDialog, setShowTareaDialog] = useState(false);
  const [entregas, setEntregas] = useState<EntregaTarea[]>([]);
  const [isLoadingEntregas, setIsLoadingEntregas] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaTarea | null>(null);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [gradeForm, setGradeForm] = useState({ calificacion: '', comentario: '' });
  const [isGrading, setIsGrading] = useState(false);
  const currentUser = getCurrentUser();

  // Form state
  const [newClass, setNewClass] = useState({
    nombre: '',
    descripcion: '',
    materia: '',
    curso: '',
    grupo: '',
    anoEscolar: '2024-2025'
  });

  const [newTask, setNewTask] = useState({
    titulo: '',
    descripcion: '',
    fechaEntrega: ''
  });

  // Cargar clases al iniciar
  useEffect(() => {
    loadClases();
  }, []);

  // Cargar estudiantes y tareas cuando se selecciona una clase
  useEffect(() => {
    if (selectedClase) {
      loadEstudiantes(selectedClase.id);
      loadTareas(selectedClase.id);
    }
  }, [selectedClase]);

  const loadClases = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/clases');
      // El api.get() devuelve directamente el JSON, no un objeto con .data
      setClases(response || []);

      // Seleccionar la primera clase por defecto
      if (response && response.length > 0 && !selectedClase) {
        setSelectedClase(response[0]);
      }
    } catch (err: any) {
      console.error('Error al cargar clases:', err);
      setError(err.error || err.message || 'Error al cargar clases');
    } finally {
      setLoading(false);
    }
  };

  const loadEstudiantes = async (claseId: number) => {
    try {
      const response = await api.get(`/clases/${claseId}/estudiantes`);
      // El api.get() devuelve directamente el JSON
      setEstudiantes(response || []);
    } catch (err: any) {
      console.error('Error al cargar estudiantes:', err);
      setEstudiantes([]);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreatingClass(true);
      const response = await api.post('/clases', newClass);

      // El backend devuelve { mensaje: "...", clase: {...} }
      // y api.post() devuelve directamente el JSON
      if (response.clase) {
        setClases([...clases, response.clase]);
      }

      // Limpiar formulario
      setNewClass({
        nombre: '',
        descripcion: '',
        materia: '',
        curso: '',
        grupo: '',
        anoEscolar: '2024-2025'
      });

      // Cerrar diálogo
      document.getElementById('close-dialog')?.click();

      // Recargar clases
      await loadClases();
    } catch (err: any) {
      console.error('Error al crear clase:', err);
      setError(err.error || err.message || 'Error al crear clase');
    } finally {
      setIsCreatingClass(false);
    }
  };

  const loadAllStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const response = await api.get('/usuarios/estudiantes');
      setAllStudents(response || []);
    } catch (err: any) {
      console.error('Error al cargar estudiantes:', err);
      setAllStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleAddStudent = async (estudianteId: number) => {
    if (!selectedClase) return;

    try {
      setIsAddingStudent(true);
      await api.post(`/clases/${selectedClase.id}/estudiantes`, { estudianteId });

      // Recargar lista de estudiantes
      await loadEstudiantes(selectedClase.id);

      // Cerrar diálogo
      setShowAddStudentDialog(false);
      setSearchEmail('');
    } catch (err: any) {
      console.error('Error al añadir estudiante:', err);
      setError(err.error || err.message || 'Error al añadir estudiante');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const loadTareas = async (claseId: number) => {
    try {
      const response = await api.get(`/tareas/clase/${claseId}`);
      setTareas(response || []);
    } catch (err: any) {
      console.error('Error al cargar tareas:', err);
      setTareas([]);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClase) return;

    try {
      setIsCreatingTask(true);
      await api.post('/tareas', {
        ...newTask,
        claseId: selectedClase.id
      });

      // Limpiar formulario
      setNewTask({
        titulo: '',
        descripcion: '',
        fechaEntrega: ''
      });

      // Cerrar diálogo
      setShowCreateTaskDialog(false);

      // Recargar tareas
      await loadTareas(selectedClase.id);
    } catch (err: any) {
      console.error('Error al crear tarea:', err);
      setError(err.error || err.message || 'Error al crear tarea');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const loadEntregas = async (tareaId: number) => {
    try {
      setIsLoadingEntregas(true);
      const response = await api.get(`/tareas/${tareaId}/entregas`);
      setEntregas(response || []);
    } catch (err: any) {
      console.error('Error al cargar entregas:', err);
      setEntregas([]);
    } finally {
      setIsLoadingEntregas(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntrega) return;

    try {
      setIsGrading(true);
      await api.put(`/tareas/entregas/${selectedEntrega.id}/calificar`, {
        calificacion: parseFloat(gradeForm.calificacion),
        comentario: gradeForm.comentario
      });

      // Limpiar formulario
      setGradeForm({ calificacion: '', comentario: '' });

      // Cerrar diálogo
      setShowGradeDialog(false);

      // Recargar entregas
      if (selectedTarea) {
        await loadEntregas(selectedTarea.id);
      }
    } catch (err: any) {
      console.error('Error al calificar entrega:', err);
      setError(err.error || err.message || 'Error al calificar entrega');
    } finally {
      setIsGrading(false);
    }
  };

  const handleViewTarea = async (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setShowTareaDialog(true);
    await loadEntregas(tarea.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Cargando clases...</p>
      </div>
    );
  }

  if (clases.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              Bienvenido, Profesor
            </CardTitle>
            <CardDescription>
              No tienes clases creadas aún. Crea tu primera clase para empezar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Clase
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Clase</DialogTitle>
                  <DialogDescription>
                    Completa los datos para crear una nueva clase
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre de la Clase *</Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Matemáticas 1º ESO A"
                        value={newClass.nombre}
                        onChange={(e) => setNewClass({ ...newClass, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materia">Materia *</Label>
                      <Input
                        id="materia"
                        placeholder="Ej: Matemáticas"
                        value={newClass.materia}
                        onChange={(e) => setNewClass({ ...newClass, materia: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="curso">Curso</Label>
                      <Input
                        id="curso"
                        placeholder="Ej: 1º ESO"
                        value={newClass.curso}
                        onChange={(e) => setNewClass({ ...newClass, curso: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grupo">Grupo</Label>
                      <Input
                        id="grupo"
                        placeholder="Ej: A"
                        value={newClass.grupo}
                        onChange={(e) => setNewClass({ ...newClass, grupo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="anoEscolar">Año Escolar</Label>
                      <Input
                        id="anoEscolar"
                        placeholder="2024-2025"
                        value={newClass.anoEscolar}
                        onChange={(e) => setNewClass({ ...newClass, anoEscolar: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Descripción de la clase..."
                      rows={3}
                      value={newClass.descripcion}
                      onChange={(e) => setNewClass({ ...newClass, descripcion: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isCreatingClass} className="flex-1">
                      {isCreatingClass ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        'Crear Clase'
                      )}
                    </Button>
                    <Button type="button" variant="outline" id="close-dialog">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning if user is not a teacher */}
      {currentUser && currentUser.userType !== 'TEACHER' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Acceso restringido</p>
                <p className="text-sm">Tu cuenta es de tipo <strong>{currentUser.userType}</strong>. Solo los profesores pueden crear y gestionar clases.</p>
                <p className="text-sm mt-1">Por favor, regístrate con una cuenta de profesor para acceder a estas funcionalidades.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header con selector de clase */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard del Profesor</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus clases, estudiantes y tareas
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Clase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Clase</DialogTitle>
              <DialogDescription>
                Completa los datos para crear una nueva clase
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Clase *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Matemáticas 1º ESO A"
                    value={newClass.nombre}
                    onChange={(e) => setNewClass({ ...newClass, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materia">Materia *</Label>
                  <Input
                    id="materia"
                    placeholder="Ej: Matemáticas"
                    value={newClass.materia}
                    onChange={(e) => setNewClass({ ...newClass, materia: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="curso">Curso</Label>
                  <Input
                    id="curso"
                    placeholder="Ej: 1º ESO"
                    value={newClass.curso}
                    onChange={(e) => setNewClass({ ...newClass, curso: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grupo">Grupo</Label>
                  <Input
                    id="grupo"
                    placeholder="Ej: A"
                    value={newClass.grupo}
                    onChange={(e) => setNewClass({ ...newClass, grupo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anoEscolar">Año Escolar</Label>
                  <Input
                    id="anoEscolar"
                    placeholder="2024-2025"
                    value={newClass.anoEscolar}
                    onChange={(e) => setNewClass({ ...newClass, anoEscolar: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Descripción de la clase..."
                  rows={3}
                  value={newClass.descripcion}
                  onChange={(e) => setNewClass({ ...newClass, descripcion: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isCreatingClass} className="flex-1">
                  {isCreatingClass ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Clase'
                  )}
                </Button>
                <Button type="button" variant="outline" id="close-dialog">
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selector de clase */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            {clases.map((clase) => (
              <Button
                key={clase.id}
                variant={selectedClase?.id === clase.id ? 'default' : 'outline'}
                onClick={() => setSelectedClase(clase)}
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                {clase.nombre}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información de la clase seleccionada */}
      {selectedClase && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estudiantes.length}</div>
              <p className="text-xs text-muted-foreground">
                {selectedClase.nombre}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materia</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedClase.materia}</div>
              <p className="text-xs text-muted-foreground">
                {selectedClase.curso} {selectedClase.grupo}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Año Escolar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedClase.anoEscolar}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">Activa</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de estudiantes */}
      {selectedClase && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Estudiantes de {selectedClase.nombre}</CardTitle>
                <CardDescription>
                  {estudiantes.length === 0
                    ? 'No hay estudiantes inscritos aún. Añade estudiantes a esta clase.'
                    : `${estudiantes.length} estudiante${estudiantes.length !== 1 ? 's' : ''} inscrito${estudiantes.length !== 1 ? 's' : ''}`
                  }
                </CardDescription>
              </div>
              {estudiantes.length > 0 && (
                <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={loadAllStudents}>
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Estudiante
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Añadir Estudiante a {selectedClase?.nombre}</DialogTitle>
                      <DialogDescription>
                        Busca y selecciona un estudiante para añadirlo a esta clase
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="search-email-header">Buscar por email</Label>
                        <Input
                          id="search-email-header"
                          placeholder="email@ejemplo.com"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                        />
                      </div>

                      {isLoadingStudents ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {allStudents
                            .filter(student =>
                              !searchEmail ||
                              student.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
                              student.nombre.toLowerCase().includes(searchEmail.toLowerCase()) ||
                              student.apellido1.toLowerCase().includes(searchEmail.toLowerCase())
                            )
                            .filter(student => !estudiantes.some(e => e.id === student.id))
                            .map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                              >
                                <div>
                                  <p className="font-medium">{student.nombre} {student.apellido1} {student.apellido2}</p>
                                  <p className="text-sm text-gray-500">{student.email}</p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddStudent(student.id)}
                                  disabled={isAddingStudent}
                                >
                                  {isAddingStudent ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="mr-1 h-4 w-4" />
                                      Añadir
                                    </>
                                  )}
                                </Button>
                              </div>
                            ))}
                          {allStudents.filter(student =>
                            !searchEmail ||
                            student.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
                            student.nombre.toLowerCase().includes(searchEmail.toLowerCase()) ||
                            student.apellido1.toLowerCase().includes(searchEmail.toLowerCase())
                          ).filter(student => !estudiantes.some(e => e.id === student.id)).length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                              No se encontraron estudiantes disponibles
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {estudiantes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aún no hay estudiantes en esta clase</p>
                <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
                  <DialogTrigger asChild>
                    <Button className="mt-4" onClick={loadAllStudents}>
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Estudiante
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Añadir Estudiante a {selectedClase?.nombre}</DialogTitle>
                      <DialogDescription>
                        Busca y selecciona un estudiante para añadirlo a esta clase
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="search-email">Buscar por email</Label>
                        <Input
                          id="search-email"
                          placeholder="email@ejemplo.com"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                        />
                      </div>

                      {isLoadingStudents ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {allStudents
                            .filter(student =>
                              !searchEmail ||
                              student.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
                              student.nombre.toLowerCase().includes(searchEmail.toLowerCase()) ||
                              student.apellido1.toLowerCase().includes(searchEmail.toLowerCase())
                            )
                            .filter(student => !estudiantes.some(e => e.id === student.id))
                            .map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                              >
                                <div>
                                  <p className="font-medium">{student.nombre} {student.apellido1} {student.apellido2}</p>
                                  <p className="text-sm text-gray-500">{student.email}</p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddStudent(student.id)}
                                  disabled={isAddingStudent}
                                >
                                  {isAddingStudent ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="mr-1 h-4 w-4" />
                                      Añadir
                                    </>
                                  )}
                                </Button>
                              </div>
                            ))}
                          {allStudents.filter(student =>
                            !searchEmail ||
                            student.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
                            student.nombre.toLowerCase().includes(searchEmail.toLowerCase()) ||
                            student.apellido1.toLowerCase().includes(searchEmail.toLowerCase())
                          ).length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                              No se encontraron estudiantes
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellidos</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiantes.map((estudiante) => (
                    <TableRow key={estudiante.id}>
                      <TableCell className="font-medium">{estudiante.nombre}</TableCell>
                      <TableCell>{estudiante.apellido1} {estudiante.apellido2}</TableCell>
                      <TableCell>{estudiante.email}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEstudiante(estudiante);
                            setShowEstudianteDialog(true);
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sección de Tareas */}
      {selectedClase && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Tareas de {selectedClase.nombre}
                </CardTitle>
                <CardDescription>
                  {tareas.length === 0
                    ? 'No hay tareas creadas aún. Crea la primera tarea para evaluar a tus estudiantes.'
                    : `${tareas.length} tarea${tareas.length !== 1 ? 's' : ''} creada${tareas.length !== 1 ? 's' : ''}`
                  }
                </CardDescription>
              </div>
              <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Tarea
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Tarea</DialogTitle>
                    <DialogDescription>
                      Crea una nueva tarea para {selectedClase?.nombre}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título de la Tarea *</Label>
                      <Input
                        id="titulo"
                        placeholder="Ej: Ejercicios de Álgebra"
                        value={newTask.titulo}
                        onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion-tarea">Descripción</Label>
                      <Textarea
                        id="descripcion-tarea"
                        placeholder="Descripción de la tarea..."
                        rows={4}
                        value={newTask.descripcion}
                        onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaEntrega" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha de Entrega *
                      </Label>
                      <Input
                        id="fechaEntrega"
                        type="date"
                        value={newTask.fechaEntrega}
                        onChange={(e) => setNewTask({ ...newTask, fechaEntrega: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={isCreatingTask} className="flex-1">
                        {isCreatingTask ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creando...
                          </>
                        ) : (
                          'Crear Tarea'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateTaskDialog(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {tareas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aún no hay tareas en esta clase</p>
                <p className="text-sm mt-2">Crea tareas para evaluar a tus estudiantes</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha de Entrega</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tareas.map((tarea) => (
                    <TableRow key={tarea.id}>
                      <TableCell className="font-medium">{tarea.titulo}</TableCell>
                      <TableCell className="max-w-xs truncate">{tarea.descripcion || 'Sin descripción'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {new Date(tarea.fechaEntrega).toLocaleDateString('es-ES')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTarea(tarea)}
                        >
                          Ver Entregas
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para ver detalles del estudiante */}
      <Dialog open={showEstudianteDialog} onOpenChange={setShowEstudianteDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles del Estudiante</DialogTitle>
            <DialogDescription>
              Información completa del estudiante y su desempeño
            </DialogDescription>
          </DialogHeader>
          {selectedEstudiante && selectedClase && (
            <div className="space-y-6">
              {/* Información básica */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nombre Completo</Label>
                      <p className="mt-1 text-base font-semibold">
                        {selectedEstudiante.nombre} {selectedEstudiante.apellido1} {selectedEstudiante.apellido2}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="mt-1 text-base">{selectedEstudiante.email}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-500">Clase Actual</Label>
                    <p className="mt-1 text-base">{selectedClase.nombre} - {selectedClase.materia}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas del estudiante en esta clase */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  Rendimiento en {selectedClase.nombre}
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <Card className="border">
                    <CardContent className="pt-4 pb-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {tareas.length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Tareas Totales</div>
                    </CardContent>
                  </Card>
                  <Card className="border">
                    <CardContent className="pt-4 pb-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {entregas.filter(e => e.estudianteId === selectedEstudiante.id).length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Entregadas</div>
                    </CardContent>
                  </Card>
                  <Card className="border">
                    <CardContent className="pt-4 pb-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {tareas.length - entregas.filter(e => e.estudianteId === selectedEstudiante.id).length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Pendientes</div>
                    </CardContent>
                  </Card>
                  <Card className="border">
                    <CardContent className="pt-4 pb-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(() => {
                          const entregasCalificadas = entregas.filter(
                            e => e.estudianteId === selectedEstudiante.id && e.calificacion !== null
                          );
                          if (entregasCalificadas.length === 0) return '-';
                          const promedio = entregasCalificadas.reduce((sum, e) => sum + (e.calificacion || 0), 0) / entregasCalificadas.length;
                          return promedio.toFixed(1);
                        })()}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Promedio</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Historial de entregas */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  Historial de Entregas
                </h4>
                {entregas.filter(e => e.estudianteId === selectedEstudiante.id).length === 0 ? (
                  <Card className="border">
                    <CardContent className="pt-6 pb-6 text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Este estudiante no ha entregado ninguna tarea aún</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto pr-2">
                    <div className="space-y-2">
                      {entregas
                        .filter(e => e.estudianteId === selectedEstudiante.id)
                        .sort((a, b) => new Date(b.fechaEntrega).getTime() - new Date(a.fechaEntrega).getTime())
                        .map((entrega) => {
                          const tarea = tareas.find(t => entregas.some(e => e.id === entrega.id));
                          return (
                            <Card key={entrega.id} className="border hover:border-blue-300 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-sm mb-1">
                                      {tareas.find(t => t.id === selectedTarea?.id)?.titulo || 'Tarea'}
                                    </h5>
                                    <Badge variant={entrega.calificacion !== null ? 'default' : entrega.estado === 'RETRASADA' ? 'destructive' : 'secondary'} className="text-xs">
                                      {entrega.calificacion !== null ? 'REVISADA' : entrega.estado}
                                    </Badge>
                                  </div>
                                  {entrega.calificacion !== null && (
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-purple-600">{entrega.calificacion}</div>
                                      <div className="text-xs text-gray-500">/ 10</div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(entrega.fechaEntrega).toLocaleDateString('es-ES')}
                                  </span>
                                  {entrega.archivoUrl && (
                                    <span className="flex items-center gap-1 text-blue-600">
                                      <File className="h-3 w-3" />
                                      Archivo adjunto
                                    </span>
                                  )}
                                </div>
                                {entrega.comentarioProfesor && (
                                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                                    <span className="font-medium">Comentario:</span> {entrega.comentarioProfesor}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Tareas pendientes */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Tareas Pendientes
                </h4>
                {(() => {
                  const entregasIds = entregas.filter(e => e.estudianteId === selectedEstudiante.id).map(e => e.id);
                  const tareasPendientes = tareas.filter(t => !entregasIds.includes(t.id));

                  if (tareasPendientes.length === 0) {
                    return (
                      <Card className="border border-green-200 bg-green-50">
                        <CardContent className="pt-6 pb-6 text-center text-green-700">
                          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm font-medium">¡Excelente! Todas las tareas están al día</p>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {tareasPendientes.map((tarea) => (
                        <Card key={tarea.id} className="border border-orange-200 hover:border-orange-300 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-sm">{tarea.titulo}</h5>
                                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Vence: {new Date(tarea.fechaEntrega).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">Pendiente</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para ver entregas de la tarea */}
      <Dialog open={showTareaDialog} onOpenChange={setShowTareaDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Entregas de la Tarea</DialogTitle>
            <DialogDescription>
              {selectedTarea && `${selectedTarea.titulo} - Vencimiento: ${new Date(selectedTarea.fechaEntrega).toLocaleDateString('es-ES')}`}
            </DialogDescription>
          </DialogHeader>
          {selectedTarea && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Descripción de la Tarea</h4>
                <p className="text-sm text-gray-700">
                  {selectedTarea.descripcion || 'Sin descripción'}
                </p>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Entregas ({entregas.length} de {estudiantes.length} estudiantes)
                </h4>
                {isLoadingEntregas ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : entregas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay entregas aún</p>
                    <p className="text-sm mt-2">
                      Las entregas aparecerán aquí cuando los estudiantes envíen sus trabajos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entregas.map((entrega) => (
                      <div key={entrega.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{entrega.estudianteNombre}</h5>
                              <Badge variant={entrega.estado === 'REVISADA' ? 'default' : entrega.estado === 'RETRASADA' ? 'destructive' : 'secondary'}>
                                {entrega.estado}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(entrega.fechaEntrega).toLocaleString('es-ES')}
                              </span>
                              {entrega.calificacion !== null && (
                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                  <Star className="h-4 w-4" />
                                  {entrega.calificacion}/10
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={entrega.calificacion !== null ? 'outline' : 'default'}
                            onClick={() => {
                              setSelectedEntrega(entrega);
                              setGradeForm({
                                calificacion: entrega.calificacion?.toString() || '',
                                comentario: entrega.comentarioProfesor || ''
                              });
                              setShowGradeDialog(true);
                            }}
                          >
                            {entrega.calificacion !== null ? 'Editar Nota' : 'Calificar'}
                          </Button>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Contenido de la entrega:</span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{entrega.contenido}</p>
                        </div>
                        {entrega.archivoUrl && (
                          <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4 text-green-600" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-green-800">Archivo adjunto</span>
                                  <span className="text-xs text-green-600">{entrega.archivoUrl}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('token');
                                    const response = await fetch(
                                      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/tareas/entregas/${entrega.id}/archivo`,
                                      {
                                        headers: {
                                          'Authorization': token ? `Bearer ${token}` : ''
                                        }
                                      }
                                    );

                                    if (!response.ok) throw new Error('Error al descargar archivo');

                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const fileName = entrega.archivoUrl || 'archivo';
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = fileName;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  } catch (err) {
                                    console.error('Error al descargar archivo:', err);
                                    setError('Error al descargar el archivo');
                                  }
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Descargar
                              </Button>
                            </div>
                          </div>
                        )}
                        {entrega.comentarioProfesor && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <span className="text-xs font-medium text-blue-700">Comentario:</span>
                            <p className="text-sm text-blue-900 mt-1">{entrega.comentarioProfesor}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para calificar entrega */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar Entrega</DialogTitle>
            <DialogDescription>
              {selectedEntrega && `Estudiante: ${selectedEntrega.estudianteNombre}`}
            </DialogDescription>
          </DialogHeader>
          {selectedEntrega && (
            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm font-medium mb-2">Contenido entregado:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedEntrega.contenido}</p>
              </div>
              {selectedEntrega.archivoUrl && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-green-600" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-green-800">Archivo adjunto</span>
                        <span className="text-xs text-green-600">{selectedEntrega.archivoUrl}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(
                            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/tareas/entregas/${selectedEntrega.id}/archivo`,
                            {
                              headers: {
                                'Authorization': token ? `Bearer ${token}` : ''
                              }
                            }
                          );

                          if (!response.ok) throw new Error('Error al descargar archivo');

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const fileName = selectedEntrega.archivoUrl || 'archivo';
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = fileName;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (err) {
                          console.error('Error al descargar archivo:', err);
                          setError('Error al descargar el archivo');
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="calificacion">Calificación (0-10) *</Label>
                <Input
                  id="calificacion"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={gradeForm.calificacion}
                  onChange={(e) => setGradeForm({ ...gradeForm, calificacion: e.target.value })}
                  required
                  placeholder="Ej: 8.5"
                />
              </div>
              <div>
                <Label htmlFor="comentario">Comentario (opcional)</Label>
                <Textarea
                  id="comentario"
                  value={gradeForm.comentario}
                  onChange={(e) => setGradeForm({ ...gradeForm, comentario: e.target.value })}
                  placeholder="Escribe un comentario para el estudiante..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowGradeDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isGrading}>
                  {isGrading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Calificación'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
