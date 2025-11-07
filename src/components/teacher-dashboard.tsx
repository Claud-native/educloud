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
  Calendar
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
                          onClick={() => {
                            setSelectedTarea(tarea);
                            setShowTareaDialog(true);
                          }}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Estudiante</DialogTitle>
            <DialogDescription>
              Información completa del estudiante
            </DialogDescription>
          </DialogHeader>
          {selectedEstudiante && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nombre Completo</Label>
                  <p className="mt-1 text-base">
                    {selectedEstudiante.nombre} {selectedEstudiante.apellido1} {selectedEstudiante.apellido2}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="mt-1 text-base">{selectedEstudiante.email}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">ID de Usuario</Label>
                <p className="mt-1 text-base font-mono text-sm">{selectedEstudiante.id}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Funcionalidades adicionales como historial de entregas, notas y asistencia estarán disponibles próximamente.
                </p>
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
                  Entregas ({estudiantes.length} estudiantes)
                </h4>
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sistema de entregas en desarrollo</p>
                  <p className="text-sm mt-2">
                    Próximamente los estudiantes podrán enviar sus trabajos y tú podrás calificarlos aquí.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
