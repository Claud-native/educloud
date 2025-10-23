import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Sparkles, 
  Camera, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2,
  X,
  Image as ImageIcon,
  Zap,
  BarChart3,
  Package
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';

export function AIValuationMobile() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const recentValuations = [
    { 
      id: 1, 
      item: 'Proyector Epson', 
      category: 'Electrónica',
      price: 285, 
      confidence: 92,
      date: '20/10/2025'
    },
    { 
      id: 2, 
      item: 'Mesa Oficina', 
      category: 'Mobiliario',
      price: 120, 
      confidence: 88,
      date: '18/10/2025'
    },
    { 
      id: 3, 
      item: 'Microscopio', 
      category: 'Laboratorio',
      price: 450, 
      confidence: 95,
      date: '15/10/2025'
    },
  ];

  return (
    <div className="max-w-md mx-auto space-y-4 pb-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl">Tasación IA</h2>
                <p className="text-sm text-purple-100">Valoración inteligente</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <Package className="h-4 w-4 mx-auto mb-1" />
              <p className="text-lg">47</p>
              <p className="text-xs text-purple-100">Tasados</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <DollarSign className="h-4 w-4 mx-auto mb-1" />
              <p className="text-lg">€12K</p>
              <p className="text-xs text-purple-100">Total</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <TrendingUp className="h-4 w-4 mx-auto mb-1" />
              <p className="text-lg">91%</p>
              <p className="text-xs text-purple-100">Precisión</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera/Upload Section */}
      {!hasResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Nueva Tasación
            </CardTitle>
            <CardDescription>Captura o selecciona fotos del objeto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Camera/Upload Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-6 w-6 text-blue-600" />
                <span className="text-sm">Usar Cámara</span>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                  multiple
                />
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-6 w-6 text-purple-600" />
                <span className="text-sm">Galería</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  multiple
                />
              </Button>
            </div>

            {selectedImages.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="item-name">Nombre del Objeto</Label>
                  <Input 
                    id="item-name" 
                    placeholder="Ej: Proyector Epson EB-X41"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
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
                  <Label htmlFor="condition">Estado</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado del objeto" />
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
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Detalles adicionales..."
                    rows={3}
                  />
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
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isAnalyzing ? 'Analizando...' : 'Tasar con IA'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result Card */}
      {hasResult && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Tasación Completada
              </CardTitle>
              <Badge className="bg-green-600">92% confianza</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price Display */}
            <div className="text-center py-6 border-b border-green-200">
              <p className="text-sm text-gray-600 mb-2">Precio Estimado</p>
              <p className="text-5xl text-green-700">€285</p>
              <p className="text-sm text-gray-600 mt-2">Rango: €250 - €320</p>
            </div>

            {/* Confidence */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Confianza de la IA</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>

            {/* AI Insight */}
            <Alert className="bg-blue-50 border-blue-200">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                Basado en 1,247 ventas similares en los últimos 6 meses
              </AlertDescription>
            </Alert>

            {/* Price Factors */}
            <div className="space-y-2">
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
                  <span>Con accesorios</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Publicar Venta
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setHasResult(false);
                  setSelectedImages([]);
                }}
              >
                Nueva Tasación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Valuations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de Tasaciones</CardTitle>
          <CardDescription>Objetos valorados recientemente</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {recentValuations.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-purple-600">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm">{item.item}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{item.date}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <Progress value={item.confidence} className="h-1 flex-1" />
                            <span className="text-xs text-gray-500">{item.confidence}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-lg text-green-700">€{item.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* AI Info */}
      <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm mb-2">Cómo funciona</h4>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Análisis de mercado en tiempo real</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Reconocimiento de imágenes con IA</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Comparación con ventas similares</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
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
