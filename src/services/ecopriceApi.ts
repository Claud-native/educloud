import { getToken } from './api';

// URL base del microservicio EcoPrice
const ECOPRICE_API_BASE = import.meta.env.VITE_ECOPRICE_API_URL ||
  (import.meta.DEV ? 'http://localhost:9000/api/ecoprice' : '/api/ecoprice');

// Tipos TypeScript
export interface ObjectInfo {
  name: string;
  confidence: number;
  labels: string[];
  brand?: string;
  model?: string;
  category?: string;
  note?: string;
}

export interface PriceListing {
  title: string;
  price: number;
  url: string;
  location?: string;
  condition?: string;
  seller?: string;
  posted_date?: string;
}

export interface PlatformData {
  name: string;
  type: 'segunda_mano' | 'nuevo';
  listings: PriceListing[];
  scraped_at?: string;
}

export interface PriceStatistics {
  min: number;
  max: number;
  avg: number;
  median: number;
  count: number;
}

export interface EcoPriceResponse {
  success: boolean;
  object: ObjectInfo;
  prices: {
    object: string;
    platforms: PlatformData[];
  };
  statistics: PriceStatistics;
  image_url?: string;
  analyzed_at?: string;
  error?: string;
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  timestamp: string;
  services: {
    api: string;
    cache: string;
    vision_api: string;
  };
}

/**
 * Subir imagen y analizar con Gemini Pro Vision
 */
export const uploadAndAnalyze = async (file: File): Promise<EcoPriceResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${ECOPRICE_API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Buscar por nombre de objeto (sin imagen)
 */
export const searchByName = async (objectName: string): Promise<EcoPriceResponse> => {
  try {
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${ECOPRICE_API_BASE}/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ object_name: objectName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching by name:', error);
    throw error;
  }
};

/**
 * Health check del microservicio EcoPrice
 */
export const healthCheck = async (): Promise<HealthCheckResponse> => {
  try {
    const response = await fetch(`${ECOPRICE_API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in health check:', error);
    throw error;
  }
};

/**
 * Obtener lista de plataformas habilitadas
 */
export const getPlatforms = async () => {
  try {
    const response = await fetch(`${ECOPRICE_API_BASE}/platforms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get platforms: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting platforms:', error);
    throw error;
  }
};

/**
 * Validar archivo antes de subir
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  const maxSize = 16 * 1024 * 1024; // 16MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Usa PNG, JPG, JPEG, GIF o WEBP'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Archivo demasiado grande. El tamaño máximo es 16MB'
    };
  }

  return { valid: true };
};

export default {
  uploadAndAnalyze,
  searchByName,
  healthCheck,
  getPlatforms,
  validateFile,
};
