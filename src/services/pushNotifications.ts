/**
 * Servicio de Notificaciones Push para EduCloud
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Convierte una clave pública VAPID de Base64 a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Solicita permiso para mostrar notificaciones
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('⚠️  Este navegador no soporta notificaciones');
    return false;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️  Este navegador no soporta Service Workers');
    return false;
  }

  const permission = await Notification.requestPermission();
  console.log('🔔 Permiso de notificaciones:', permission);

  return permission === 'granted';
}

/**
 * Registra el Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers no soportados');
  }

  try {
    // El service worker se registra automáticamente por vite-plugin-pwa
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker registrado:', registration.scope);
    return registration;
  } catch (error) {
    console.error('❌ Error al obtener Service Worker:', error);
    throw error;
  }
}

/**
 * Obtiene la clave pública VAPID del servidor
 */
export async function getVapidPublicKey(token: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/push/public-key`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener clave pública VAPID');
    }

    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('❌ Error al obtener clave VAPID:', error);
    throw error;
  }
}

/**
 * Suscribe al usuario a notificaciones push
 */
export async function subscribeToPushNotifications(token: string): Promise<any> {
  try {
    console.log('📝 Iniciando suscripción a notificaciones push...');

    // 1. Verificar permisos
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Permiso de notificaciones denegado');
    }

    // 2. Obtener Service Worker registration
    const registration = await registerServiceWorker();

    // 3. Esperar a que el SW esté activo
    await navigator.serviceWorker.ready;

    // 4. Obtener clave pública VAPID
    const vapidPublicKey = await getVapidPublicKey(token);
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // 5. Verificar si ya existe una suscripción
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('ℹ️  Ya existe una suscripción activa, actualizándola...');
    } else {
      // 6. Suscribirse al push
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      console.log('✅ Suscripción push creada:', subscription);
    }

    // 7. Enviar suscripción al servidor
    const response = await fetch(`${API_BASE_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(subscription.toJSON())
    });

    if (!response.ok) {
      throw new Error('Error al guardar suscripción en el servidor');
    }

    const result = await response.json();
    console.log('✅ Suscripción guardada en el servidor:', result);

    return result;
  } catch (error) {
    console.error('❌ Error al suscribirse a notificaciones push:', error);
    throw error;
  }
}

/**
 * Cancela la suscripción a notificaciones push
 */
export async function unsubscribeFromPushNotifications(token: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('ℹ️  No hay suscripción activa');
      return;
    }

    // Cancelar en el servidor
    await fetch(`${API_BASE_URL}/api/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint
      })
    });

    // Cancelar en el navegador
    await subscription.unsubscribe();
    console.log('✅ Suscripción cancelada');
  } catch (error) {
    console.error('❌ Error al cancelar suscripción:', error);
    throw error;
  }
}

/**
 * Verifica si el usuario tiene suscripción activa
 */
export async function checkPushSubscriptionStatus(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/push/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al verificar estado de suscripción');
    }

    const data = await response.json();
    return data.hasSubscriptions;
  } catch (error) {
    console.error('❌ Error al verificar estado:', error);
    return false;
  }
}

/**
 * Envía una notificación de prueba
 */
export async function sendTestNotification(token: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/push/test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al enviar notificación de prueba');
    }

    const result = await response.json();
    console.log('✅ Notificación de prueba enviada:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al enviar notificación de prueba:', error);
    throw error;
  }
}

/**
 * Verifica si el navegador soporta notificaciones push
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Obtiene el estado del permiso de notificaciones
 */
export function getNotificationPermissionState(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}
