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
  AlertCircle
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

export function TeacherDashboard() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreatingClass, setIsCreatingClass] = useState(false);
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

  // Cargar clases al iniciar
  useEffect(() => {
    loadClases();
  }, []);

  // Cargar estudiantes cuando se selecciona una clase
  useEffect(() => {
    if (selectedClase) {
      loadEstudiantes(selectedClase.id);
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
            <CardTitle>Estudiantes de {selectedClase.nombre}</CardTitle>
            <CardDescription>
              {estudiantes.length === 0
                ? 'No hay estudiantes inscritos aún. Añade estudiantes a esta clase.'
                : `${estudiantes.length} estudiante${estudiantes.length !== 1 ? 's' : ''} inscrito${estudiantes.length !== 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {estudiantes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aún no hay estudiantes en esta clase</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Estudiante
                </Button>
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
                        <Button variant="ghost" size="sm">
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
    </div>
  );
}
