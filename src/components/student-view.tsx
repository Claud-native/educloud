import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Clock,
  FileText,
  Star,
  Send,
  Upload,
  File,
  X,
  Download
} from 'lucide-react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  claseNombre: string;
  claseId: number;
  entregada: boolean;
  entregaId?: number;
  contenidoEntrega?: string;
  fechaEntregaAlumno?: string;
  estado: string;
  calificacion?: number;
  comentarioProfesor?: string;
  archivoUrl?: string;
}

export function StudentView() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null);
  const [showClaseDialog, setShowClaseDialog] = useState(false);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [showTareaDialog, setShowTareaDialog] = useState(false);
  const [contenidoEntrega, setContenidoEntrega] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    loadClases();
    loadTareas();
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

  const loadTareas = async () => {
    try {
      setLoadingTareas(true);
      console.log('=== FRONTEND: Cargando tareas del estudiante ===');
      console.log('Usuario actual:', user);
      const response = await api.get('/tareas/mis-tareas');
      console.log('Tareas recibidas:', response);
      setTareas(response || []);
    } catch (err: any) {
      console.error('Error al cargar tareas:', err);
      setTareas([]);
    } finally {
      setLoadingTareas(false);
    }
  };

  const handleSubmitTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarea) return;

    try {
      setIsSubmitting(true);

      // Si hay archivo, usar el endpoint con FormData
      if (selectedFile) {
        const formData = new FormData();
        formData.append('tareaId', selectedTarea.id.toString());
        formData.append('contenido', contenidoEntrega);
        formData.append('archivo', selectedFile);

        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/tareas/entregar-con-archivo`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Error al entregar tarea con archivo');
        }
      } else {
        // Sin archivo, usar el endpoint normal
        await api.post('/tareas/entregar', {
          tareaId: selectedTarea.id,
          contenido: contenidoEntrega
        });
      }

      // Limpiar y cerrar
      setContenidoEntrega('');
      setSelectedFile(null);
      setShowTareaDialog(false);

      // Recargar tareas
      await loadTareas();
    } catch (err: any) {
      console.error('Error al entregar tarea:', err);
      setError(err.error || err.message || 'Error al entregar tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validar tamaño máximo (50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('El archivo no puede superar los 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleDownloadFile = async (entregaId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/tareas/entregas/${entregaId}/archivo`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar archivo');
      }

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'archivo';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error al descargar archivo:', err);
      setError('Error al descargar el archivo');
    }
  };

  const handleViewTarea = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setContenidoEntrega(tarea.contenidoEntrega || '');
    setShowTareaDialog(true);
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
            <div className="text-2xl font-bold text-green-600">{tareas.filter(t => !t.entregada).length}</div>
            <div className="text-xs text-gray-600 mt-1">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {tareas.filter(t => t.calificacion !== undefined).length > 0
                ? (tareas.filter(t => t.calificacion !== undefined).reduce((sum, t) => sum + (t.calificacion || 0), 0) / tareas.filter(t => t.calificacion !== undefined).length).toFixed(1)
                : '-'}
            </div>
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

      {/* Mis Tareas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Mis Tareas
          </CardTitle>
          <CardDescription className="text-xs">
            Mantente al día con tus entregas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTareas ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : tareas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay tareas asignadas</p>
              <p className="text-xs mt-2 text-gray-400">
                Las tareas asignadas por tus profesores aparecerán aquí
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {tareas.map((tarea) => (
                  <Card key={tarea.id} className="border hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{tarea.titulo}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <Badge variant="outline">{tarea.claseNombre}</Badge>
                            <Badge variant={tarea.entregada ? (tarea.calificacion !== undefined ? 'default' : 'secondary') : tarea.estado === 'RETRASADA' ? 'destructive' : 'outline'}>
                              {tarea.entregada ? (tarea.calificacion !== undefined ? 'Calificada' : 'Entregada') : tarea.estado}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Vence: {new Date(tarea.fechaEntrega).toLocaleDateString('es-ES')}
                            </span>
                            {tarea.calificacion !== undefined && (
                              <span className="flex items-center gap-1 text-blue-600 font-medium">
                                <Star className="h-3 w-3" />
                                {tarea.calificacion}/10
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {tarea.descripcion && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{tarea.descripcion}</p>
                      )}
                      <div className="mt-3">
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          variant={tarea.entregada ? 'outline' : 'default'}
                          onClick={() => handleViewTarea(tarea)}
                        >
                          {tarea.entregada ? 'Ver Entrega' : 'Entregar Tarea'}
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

      {/* Mis Calificaciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Mis Calificaciones
          </CardTitle>
          <CardDescription className="text-xs">
            Revisa tus calificaciones y comentarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTareas ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : tareas.filter(t => t.calificacion !== undefined).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay calificaciones aún</p>
              <p className="text-xs mt-2 text-gray-400">
                Tus calificaciones aparecerán aquí cuando sean publicadas
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {tareas
                  .filter(t => t.calificacion !== undefined)
                  .sort((a, b) => {
                    // Ordenar por fecha de entrega (más reciente primero)
                    const dateA = a.fechaEntregaAlumno ? new Date(a.fechaEntregaAlumno).getTime() : 0;
                    const dateB = b.fechaEntregaAlumno ? new Date(b.fechaEntregaAlumno).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map((tarea) => (
                    <Card key={tarea.id} className="border hover:border-purple-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{tarea.titulo}</h4>
                            <Badge variant="outline" className="text-xs mb-2">
                              {tarea.claseNombre}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {tarea.calificacion}
                            </div>
                            <div className="text-xs text-gray-500">/ 10</div>
                          </div>
                        </div>
                        {tarea.comentarioProfesor && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 mb-1">Comentario del profesor:</p>
                            <p className="text-xs text-gray-600">{tarea.comentarioProfesor}</p>
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tarea.fechaEntregaAlumno
                              ? new Date(tarea.fechaEntregaAlumno).toLocaleDateString('es-ES')
                              : 'Sin fecha'}
                          </span>
                          {tarea.estado === 'RETRASADA' && (
                            <Badge variant="destructive" className="text-xs">
                              Entrega tardía
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
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

      {/* Dialog para entregar tarea */}
      <Dialog open={showTareaDialog} onOpenChange={setShowTareaDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTarea?.entregada ? 'Detalles de la Entrega' : 'Entregar Tarea'}</DialogTitle>
            <DialogDescription>
              {selectedTarea && `${selectedTarea.titulo} - Vence: ${new Date(selectedTarea.fechaEntrega).toLocaleDateString('es-ES')}`}
            </DialogDescription>
          </DialogHeader>
          {selectedTarea && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-sm">Descripción de la tarea:</h4>
                </div>
                <p className="text-sm text-gray-700">{selectedTarea.descripcion || 'Sin descripción'}</p>
              </div>

              {selectedTarea.entregada ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium mb-2">Tu entrega:</p>
                    {selectedTarea.contenidoEntrega && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{selectedTarea.contenidoEntrega}</p>
                    )}
                    {selectedTarea.archivoUrl && selectedTarea.entregaId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(selectedTarea.entregaId!)}
                        className="mt-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar archivo adjunto
                      </Button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Entregado el: {selectedTarea.fechaEntregaAlumno && new Date(selectedTarea.fechaEntregaAlumno).toLocaleString('es-ES')}
                    </p>
                  </div>
                  {selectedTarea.calificacion !== undefined && (
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Calificación:</span>
                        <div className="flex items-center gap-1 text-green-700 font-bold text-lg">
                          <Star className="h-5 w-5" />
                          {selectedTarea.calificacion}/10
                        </div>
                      </div>
                      {selectedTarea.comentarioProfesor && (
                        <>
                          <p className="text-xs font-medium text-green-700 mt-2">Comentario del profesor:</p>
                          <p className="text-sm text-green-900 mt-1">{selectedTarea.comentarioProfesor}</p>
                        </>
                      )}
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => setShowTareaDialog(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTarea} className="space-y-4">
                  <div>
                    <Label htmlFor="contenido">Tu respuesta</Label>
                    <Textarea
                      id="contenido"
                      value={contenidoEntrega}
                      onChange={(e) => setContenidoEntrega(e.target.value)}
                      placeholder="Escribe tu respuesta aquí..."
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Describe tu trabajo o adjunta un archivo.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="archivo">Archivo adjunto (opcional, máx. 50MB)</Label>
                    <div className="mt-2">
                      {!selectedFile ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id="archivo"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('archivo')?.click()}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Seleccionar archivo
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          <File className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-900 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-blue-600">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowTareaDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting || (!contenidoEntrega.trim() && !selectedFile)}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Tarea
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}