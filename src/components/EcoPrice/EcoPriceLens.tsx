import { useState } from 'react';
import { uploadAndAnalyze, validateFile, type EcoPriceResponse } from '@/services/ecopriceApi';
import { Upload, Loader2, Camera, Search, TrendingDown, TrendingUp } from 'lucide-react';

export default function EcoPriceLens() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<EcoPriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Preview de la imagen
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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          🌱 EcoPrice Lens
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analiza objetos con IA y compara precios en economía circular
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 mb-6 transition-all ${
          dragActive
            ? 'border-green-500 bg-green-50 dark:bg-green-950'
            : preview
            ? 'border-gray-300 dark:border-gray-700'
            : 'border-gray-300 dark:border-gray-700 hover:border-green-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="text-center">
            <img
              src={preview}
              alt="Preview"
              className="max-w-md max-h-96 mx-auto rounded-lg shadow-lg object-contain"
            />
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cambiar imagen
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-green-100 dark:bg-green-900 rounded-full">
                <Camera className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-semibold mb-2">
                  {dragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz click'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  PNG, JPG, JPEG, GIF, WEBP (máx 16MB)
                </p>
              </div>
            </div>
          </label>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!selectedFile || loading}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
          selectedFile && !loading
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analizando con Gemini Pro...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Analizar Imagen
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 flex items-center gap-2">
            <span className="text-xl">❌</span>
            {error}
          </p>
        </div>
      )}

      {/* Results */}
      {result && result.success && (
        <div className="mt-8 space-y-6 animate-in fade-in duration-500">
          {/* Object Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <h2 className="text-3xl font-bold mb-3 text-blue-900 dark:text-blue-100">
              {result.object.name}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <span className="flex items-center gap-1">
                <strong>Confianza:</strong> {(result.object.confidence * 100).toFixed(1)}%
              </span>
              {result.object.brand && (
                <span className="flex items-center gap-1">
                  <strong>Marca:</strong> {result.object.brand}
                </span>
              )}
              {result.object.model && (
                <span className="flex items-center gap-1">
                  <strong>Modelo:</strong> {result.object.model}
                </span>
              )}
              {result.object.category && (
                <span className="flex items-center gap-1">
                  <strong>Categoría:</strong> {result.object.category}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {result.object.labels.map((label, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
            {result.object.note && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                💡 {result.object.note}
              </p>
            )}
          </div>

          {/* Statistics */}
          {result.statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 dark:bg-green-950 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Mínimo
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {result.statistics.min}€
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 text-center">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Promedio
                </div>
                <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                  {result.statistics.avg.toFixed(2)}€
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-xl border border-orange-200 dark:border-orange-800 text-center">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Mediana
                </div>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                  {result.statistics.median}€
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950 p-6 rounded-xl border border-red-200 dark:border-red-800 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Máximo
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                  {result.statistics.max}€
                </div>
              </div>
            </div>
          )}

          {/* Platforms */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Precios Encontrados</h3>
            {result.prices.platforms.map((platform, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold">{platform.name}</h4>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                    {platform.type === 'segunda_mano' ? '♻️ Segunda mano' : '🆕 Nuevo'}
                  </span>
                </div>

                {platform.listings.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 italic">
                    No se encontraron resultados en esta plataforma
                  </p>
                ) : (
                  <div className="space-y-3">
                    {platform.listings.map((listing, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{listing.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-x-2">
                            {listing.location && <span>📍 {listing.location}</span>}
                            {listing.condition && <span>• {listing.condition}</span>}
                            {listing.posted_date && <span>• {listing.posted_date}</span>}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 ml-4">
                          {listing.price}€
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Analyzed timestamp */}
          {result.analyzed_at && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Análisis realizado: {new Date(result.analyzed_at).toLocaleString('es-ES')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
