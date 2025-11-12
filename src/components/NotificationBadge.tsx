import { useEffect, useState } from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  subscribeToPushNotifications,
  checkPushSubscriptionStatus,
  isPushNotificationSupported,
  getNotificationPermissionState
} from '../services/pushNotifications';

interface NotificationBadgeProps {
  token: string;
}

/**
 * Componente compacto para mostrar en el header/navbar
 * Solicita activar notificaciones de forma no intrusiva
 */
export default function NotificationBadge({ token }: NotificationBadgeProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkInitialState();
  }, [token]);

  const checkInitialState = async () => {
    if (!isPushNotificationSupported()) return;

    try {
      const status = await checkPushSubscriptionStatus(token);
      setIsSubscribed(status);

      // Mostrar prompt solo si no está suscrito y el permiso no fue denegado
      const permission = getNotificationPermissionState();
      if (!status && permission !== 'denied') {
        // Mostrar el prompt después de 3 segundos
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    } catch (error) {
      console.error('Error al verificar estado de notificaciones:', error);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      await subscribeToPushNotifications(token);
      setIsSubscribed(true);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error al activar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guardar en localStorage para no mostrar de nuevo en esta sesión
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
  };

  // No mostrar si ya está suscrito
  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellRing className="h-4 w-4 text-green-600" />
        <span className="hidden md:inline">Notificaciones activas</span>
      </div>
    );
  }

  // No mostrar prompt si fue rechazado
  if (!showPrompt || !isPushNotificationSupported()) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
      <Bell className="h-4 w-4 text-blue-600" />
      <span className="text-sm font-medium hidden md:inline">
        Activa las notificaciones
      </span>
      <Button
        size="sm"
        onClick={handleActivate}
        disabled={loading}
        className="h-7 text-xs"
      >
        {loading ? 'Activando...' : 'Activar'}
      </Button>
      <button
        onClick={handleDismiss}
        className="ml-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded p-1"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
