import { cryptoService } from './crypto';

const API_BASE = 'http://192.168.0.41:8080/api';

// Tipos para TypeScript
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
  password: string;
  userType: 'STUDENT' | 'TEACHER';
}

export interface User {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
  userType: 'STUDENT' | 'TEACHER';
  studentId?: string;
  teacherId?: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Función de Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Cifrar la contraseña antes de enviarla
    const encryptedPassword = cryptoService.encryptPassword(credentials.password);

    // Generar nonce para prevenir ataques de replay
    const nonce = cryptoService.generateNonce();

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Nonce': nonce, // Timestamp para validación en backend
      },
      body: JSON.stringify({
        email: credentials.email,
        password: encryptedPassword, // Contraseña cifrada con RSA
        nonce: nonce
      })
    });

    const data = await response.json();

    // Si el login es exitoso, guardar token de forma segura
    if (data.success && data.token) {
      // Guardar token cifrado
      cryptoService.secureStore('auth_token', data.token);
      cryptoService.secureStore('user_data', JSON.stringify(data.user));

      // También mantener en localStorage sin cifrar para compatibilidad
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    return {
      success: false,
      message: 'Error al conectar con el servidor'
    };
  }
};

// Función de Registro
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    // Cifrar la contraseña antes de enviarla
    const encryptedPassword = cryptoService.encryptPassword(userData.password);

    // Generar nonce para prevenir ataques de replay
    const nonce = cryptoService.generateNonce();

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Nonce': nonce,
      },
      body: JSON.stringify({
        ...userData,
        password: encryptedPassword, // Contraseña cifrada con RSA
        nonce: nonce
      })
    });

    const data = await response.json();

    // Si el registro es exitoso, también guardar token de forma segura
    if (data.success && data.token) {
      cryptoService.secureStore('auth_token', data.token);
      cryptoService.secureStore('user_data', JSON.stringify(data.user));

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Error en registro:', error);
    return {
      success: false,
      message: 'Error al conectar con el servidor'
    };
  }
};

// Función de Logout
export const logout = async (): Promise<AuthResponse> => {
  try {
    const token = getToken();

    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });

    const data = await response.json();

    // Limpiar todos los datos de forma segura
    cryptoService.secureRemove('auth_token');
    cryptoService.secureRemove('user_data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return data;
  } catch (error) {
    console.error('Error en logout:', error);
    // Limpiar de todos modos
    cryptoService.secureRemove('auth_token');
    cryptoService.secureRemove('user_data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return {
      success: false,
      message: 'Error al conectar con el servidor'
    };
  }
};

// Función auxiliar para obtener el usuario actual
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Función auxiliar para obtener el token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Función auxiliar para verificar si está autenticado
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Interfaz para la respuesta de health check
export interface HealthCheckResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  details?: {
    database?: string;
    diskSpace?: string;
    uptime?: string;
    version?: string;
  };
  responseTime?: number;
}

// Función de Health Check
export const healthCheck = async (): Promise<HealthCheckResponse> => {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // Timeout de 5 segundos
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        details: data.details || {},
        responseTime,
      };
    } else {
      return {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        responseTime,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Error en health check:', error);

    return {
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      responseTime,
    };
  }
};