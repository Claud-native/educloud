import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { uploadAndAnalyze, validateFile, type EcoPriceResponse } from '@/services/ecopriceApi';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  CheckCircle2,
  Camera,
  Zap,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function AIValuationMobile() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<EcoPriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const data = await uploadAndAnalyze(selectedFile);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar la imagen');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-purple-700">Powered by Gemini Pro AI</span>
        </div>
        <h2 className="text-3xl font-bold">Tasación Inteligente de Objetos</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Utiliza IA de Google Gemini para identificar objetos y comparar precios en economía circular
        </p>
      </div>

      {/* Stats */}
      {result && result.success && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Precio Mínimo</p>
                  <p className="text-3xl font-bold mt-1">€{result.statistics.min}</p>
                </div>
                <div className="bg-green-600 p-3 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Precio Promedio</p>
                  <p className="text-3xl font-bold mt-1">€{result.statistics.avg.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-600 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Precio Máximo</p>
                  <p className="text-3xl font-bold mt-1">€{result.statistics.max}</p>
                </div>
                <div className="bg-red-600 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Analizar Objeto
            </CardTitle>
            <CardDescription>Sube una foto para obtener una tasación con IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                dragActive ? 'border-purple-500 bg-purple-50' : preview ? 'border-gray-300' : 'border-gray-300 hover:border-purple-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {preview ? (
                <div className="text-center">
                  <img src={preview} alt="Preview" className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg object-contain" />
                  <button onClick={handleReset} className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block text-center">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-purple-100 rounded-full">
                      <Camera className="w-10 h-10 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-1">{dragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz click'}</p>
                      <p className="text-sm text-gray-500">PNG, JPG, JPEG, GIF, WEBP (máx 16MB)</p>
                    </div>
                  </div>
                </label>
              )}
            </div>

            <Button onClick={handleAnalyze} disabled={!selectedFile || loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analizando con Gemini Pro...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tasar con IA
                </>
              )}
            </Button>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {result && result.success && (
            <>
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <CheckCircle2 className="h-5 w-5" />
                      Objeto Identificado
                    </CardTitle>
                    <Badge className="bg-purple-600">{(result.object.confidence * 100).toFixed(0)}% confianza</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{result.object.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-3">
                      {result.object.brand && <span><strong>Marca:</strong> {result.object.brand}</span>}
                      {result.object.model && <span><strong>Modelo:</strong> {result.object.model}</span>}
                      {result.object.category && <span><strong>Categoría:</strong> {result.object.category}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.object.labels.map((label, i) => (
                        <Badge key={i} variant="outline" className="bg-purple-50">{label}</Badge>
                      ))}
                    </div>
                    {result.object.note && (
                      <Alert className="mt-4 bg-blue-50 border-blue-200">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-800">{result.object.note}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Precios en Plataformas
                  </CardTitle>
                  <CardDescription>{result.statistics.count} resultados encontrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.prices.platforms.map((platform, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{platform.name}</h4>
                          <Badge variant="outline">{platform.type === 'segunda_mano' ? '♻️ Segunda mano' : '🆕 Nuevo'}</Badge>
                        </div>
                        {platform.listings.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No se encontraron resultados</p>
                        ) : (
                          <div className="space-y-2">
                            {platform.listings.slice(0, 3).map((listing, i) => (
                              <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{listing.title}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {listing.location && `📍 ${listing.location} • `}
                                    {listing.condition}
                                  </div>
                                </div>
                                <div className="text-xl font-bold text-green-600 ml-3">€{listing.price}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!result && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">¿Cómo funciona?</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Nuestro sistema utiliza Google Gemini Pro para analizar imágenes:
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span>Identificación automática del objeto con IA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span>Búsqueda de precios en tiempo real</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span>Comparación en múltiples plataformas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span>Estadísticas de mercado automáticas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
