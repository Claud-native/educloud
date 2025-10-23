import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Sparkles, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  Package,
  CheckCircle2,
  Clock,
  Camera,
  Zap,
  BarChart3
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';

export function AIValuation() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setHasResult(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Mock data for recent valuations
  const recentValuations = [
    { 
      id: 1, 
      item: 'Proyector Epson EB-X41', 
      category: 'Electrónica',
      estimatedPrice: 285, 
      confidence: 92,
      condition: 'Bueno',
      date: '2025-10-20'
    },
    { 
      id: 2, 
      item: 'Mesa de Oficina 120x80cm', 
      category: 'Mobiliario',
      estimatedPrice: 120, 
      confidence: 88,
      condition: 'Usado',
      date: '2025-10-18'
    },
    { 
      id: 3, 
      item: 'Microscopio Olympus CX23', 
      category: 'Laboratorio',
      estimatedPrice: 450, 
      confidence: 95,
      condition: 'Muy Bueno',
      date: '2025-10-15'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-purple-700">Powered by AI</span>
        </div>
        <h2 className="text-3xl">Tasación Inteligente de Objetos</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Utiliza nuestra IA para calcular el precio de venta estimado del material no utilizado del centro educativo
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Objetos Tasados</p>
                <p className="text-3xl mt-1">47</p>
              </div>
              <div className="bg-purple-600 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Estimado</p>
                <p className="text-3xl mt-1">€12,450</p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Precisión Media</p>
                <p className="text-3xl mt-1">91%</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valuation Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Nueva Tasación
            </CardTitle>
            <CardDescription>Completa la información del objeto para obtener una estimación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Nombre del Objeto</Label>
              <Input 
                id="item-name" 
                placeholder="Ej: Proyector Epson EB-X41"
                defaultValue={hasResult ? "Proyector Epson EB-X41" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select defaultValue={hasResult ? "electronics" : ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electrónica</SelectItem>
                  <SelectItem value="furniture">Mobiliario</SelectItem>
                  <SelectItem value="laboratory">Laboratorio</SelectItem>
                  <SelectItem value="sports">Material Deportivo</SelectItem>
                  <SelectItem value="books">Libros</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Estado del Objeto</Label>
              <Select defaultValue={hasResult ? "good" : ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="excellent">Excelente</SelectItem>
                  <SelectItem value="good">Bueno</SelectItem>
                  <SelectItem value="fair">Regular</SelectItem>
                  <SelectItem value="poor">Deteriorado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description" 
                placeholder="Proporciona detalles adicionales sobre el objeto..."
                rows={3}
                defaultValue={hasResult ? "Proyector en buen estado, poco uso, incluye cables y control remoto" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photos">Fotografías</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Haz clic o arrastra imágenes aquí</p>
                <p className="text-xs text-gray-500 mt-1">Máximo 5 imágenes, hasta 10MB cada una</p>
                <Input id="photos" type="file" multiple accept="image/*" className="hidden" />
              </div>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Analizando con IA...</span>
                  <span className="text-blue-600">{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={handleAnalyze} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Tasar con IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <div className="space-y-4">
          {hasResult && (
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    Tasación Completada
                  </CardTitle>
                  <Badge className="bg-green-600">Alta confianza</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6 border-b border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Precio Estimado</p>
                  <p className="text-5xl text-green-700">€285</p>
                  <p className="text-sm text-gray-600 mt-2">Rango: €250 - €320</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Confianza de la IA</span>
                    <span className="text-sm">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />

                  <Alert className="bg-blue-50 border-blue-200">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                      Basado en 1,247 ventas similares de proyectores Epson en los últimos 6 meses
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-sm">Factores de Precio:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Buen estado</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Marca reconocida</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Alta demanda</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Accesorios incluidos</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Publicar en Venta
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Guardar Tasación
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Valuations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasaciones Recientes</CardTitle>
              <CardDescription>Historial de objetos tasados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentValuations.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="text-sm">{item.item}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-green-700">€{item.estimatedPrice}</p>
                      <p className="text-xs text-gray-500">{item.confidence}% confianza</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Info Section */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg mb-2">¿Cómo funciona nuestra IA?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Nuestro sistema de inteligencia artificial analiza múltiples factores para proporcionar una tasación precisa:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span>Análisis de mercado en tiempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span>Reconocimiento de imágenes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span>Comparación con ventas similares</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span>Evaluación de estado y antigüedad</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
