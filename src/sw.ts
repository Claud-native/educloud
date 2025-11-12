/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

/**
 * Service Worker para EduCloud PWA
 * Maneja notificaciones push, caching y actualizaciones
 */

// Activación inmediata del Service Worker
self.skipWaiting();
clientsClaim();

// Precachear recursos
precacheAndRoute(self.__WB_MANIFEST);

// Limpiar caches antiguos
cleanupOutdatedCaches();

// Manejar navegación
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  allowlist: [/^\/$/],
});
registerRoute(navigationRoute);

/**
 * ==========================================
 * NOTIFICACIONES PUSH
 * ==========================================
 */

// Interfaz para el payload de notificaciones
interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  data?: any;
  requireInteraction?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

/**
 * Evento: Recibir notificación push
 */
self.addEventListener('push', (event: PushEvent) => {
  console.log('📬 Service Worker: Notificación push recibida');

  let notificationData: NotificationPayload = {
    title: 'EduCloud',
    body: 'Nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'default',
    data: {}
  };

  // Parsear los datos de la notificación
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📬 Payload recibido:', payload);

      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        image: payload.image,
        tag: payload.tag || notificationData.tag,
        data: payload.data || {},
        requireInteraction: payload.requireInteraction || false,
        vibrate: payload.vibrate || [200, 100, 200],
        actions: payload.actions || []
      };

      // Añadir URL si existe
      if (payload.url) {
        notificationData.data.url = payload.url;
      }
    } catch (error) {
      console.error('❌ Error al parsear notificación:', error);
    }
  }

  // Mostrar la notificación
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      actions: notificationData.actions
    })
    .then(() => {
      console.log('✅ Notificación mostrada:', notificationData.title);
    })
    .catch((error) => {
      console.error('❌ Error al mostrar notificación:', error);
    })
  );
});

/**
 * Evento: Click en la notificación
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('👆 Service Worker: Click en notificación');

  event.notification.close();

  // Obtener la URL de destino
  let urlToOpen = '/';

  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  // Manejar acciones de notificación
  if (event.action) {
    console.log('Acción seleccionada:', event.action);
    // Aquí puedes manejar diferentes acciones
  }

  // Abrir o enfocar la aplicación
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla y navegar
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            // Enviar mensaje al cliente para navegar
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: event.notification.data,
              url: urlToOpen
            });
            return client.focus();
          }
        }

        // Si no hay ventanas abiertas, abrir una nueva
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('❌ Error al manejar click de notificación:', error);
      })
  );
});

/**
 * Evento: Cerrar notificación
 */
self.addEventListener('notificationclose', (event: NotificationEvent) => {
  console.log('🔕 Service Worker: Notificación cerrada');

  // Analytics o tracking
  if (event.notification.data) {
    console.log('Datos de notificación cerrada:', event.notification.data);
  }
});

/**
 * Sincronización en segundo plano (Background Sync)
 */
self.addEventListener('sync', (event: any) => {
  console.log('🔄 Service Worker: Sincronización en segundo plano');

  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Aquí podrías sincronizar notificaciones pendientes
      Promise.resolve()
    );
  }
});

/**
 * Mensaje desde el cliente
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('📨 Mensaje recibido:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker: Cargado y listo para notificaciones push');
