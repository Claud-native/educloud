import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Bell,
  GraduationCap,
  Loader2,
  AlertCircle
} from 'lucide-react';
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
}

export function StudentView() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null);
  const [showClaseDialog, setShowClaseDialog] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    loadClases();
  }, []);

  const loadClases = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/clases');
      // Para estudiantes, el backend devuelve las clases en las que está inscrito
      setClases(response.data || response || []);
    } catch (err: any) {
      console.error('Error al cargar clases:', err);
      setError(err.error || 'Error al cargar clases');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Mobile App Header */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {user?.nombre?.[0]}{user?.apellido1?.[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.nombre} {user?.apellido1}</h2>
              <p className="text-white/80 text-sm">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{clases.length}</div>
            <div className="text-xs text-gray-600 mt-1">Clases</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-green-600">-</div>
            <div className="text-xs text-gray-600 mt-1">Tareas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-purple-600">-</div>
            <div className="text-xs text-gray-600 mt-1">Promedio</div>
          </CardContent>
        </Card>
      </div>

      {/* Mis Clases */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Mis Clases
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {clases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No estás inscrito en ninguna clase aún</p>
              <p className="text-xs mt-2 text-gray-400">
                Contacta a tu profesor para que te añada a sus clases
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {clases.map((clase) => (
                  <Card key={clase.id} className="border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{clase.nombre}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Badge variant="outline" className="text-xs">
                              {clase.materia}
                            </Badge>
                            {clase.curso && (
                              <span>{clase.curso} {clase.grupo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {clase.descripcion && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {clase.descripcion}
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs flex-1"
                          onClick={() => {
                            setSelectedClase(clase);
                            setShowClaseDialog(true);
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Próximas Tareas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Próximas Tareas
          </CardTitle>
          <CardDescription className="text-xs">
            Mantente al día con tus entregas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay tareas pendientes</p>
            <p className="text-xs mt-2 text-gray-400">
              Las tareas asignadas aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mis Calificaciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Mis Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay calificaciones aún</p>
            <p className="text-xs mt-2 text-gray-400">
              Tus calificaciones aparecerán aquí cuando sean publicadas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Asistencia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Asistencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Sin registros de asistencia</p>
            <p className="text-xs mt-2 text-gray-400">
              Tu historial de asistencia aparecerá aquí
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold mb-1">Vista del Estudiante</h3>
            <p className="text-sm text-gray-600">
              Consulta tus clases, tareas y calificaciones en un solo lugar
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para ver detalles de la clase */}
      <Dialog open={showClaseDialog} onOpenChange={setShowClaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Clase</DialogTitle>
            <DialogDescription>
              Información completa de la clase
            </DialogDescription>
          </DialogHeader>
          {selectedClase && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nombre de la Clase</p>
                <p className="text-base font-semibold">{selectedClase.nombre}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Materia</p>
                  <p className="text-base">{selectedClase.materia}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Curso</p>
                  <p className="text-base">{selectedClase.curso} {selectedClase.grupo}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Año Escolar</p>
                <p className="text-base">{selectedClase.anoEscolar}</p>
              </div>
              {selectedClase.descripcion && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Descripción</p>
                  <p className="text-base text-gray-700">{selectedClase.descripcion}</p>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Funcionalidades adicionales como lista de compañeros, tareas de esta clase y calificaciones específicas estarán disponibles próximamente.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}