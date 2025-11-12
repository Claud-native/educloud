import { useState, useEffect } from 'react';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import {
  subscribeToPushNotifications,
  checkPushSubscriptionStatus,
  sendTestNotification,
  isPushNotificationSupported,
  getNotificationPermissionState
} from '../services/pushNotifications';

interface PushNotificationSetupProps {
  token: string;
}

export default function PushNotificationSetup({ token }: PushNotificationSetupProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    checkSupport();
    checkSubscription();
    updatePermissionState();
  }, [token]);

  const checkSupport = () => {
    const supported = isPushNotificationSupported();
    setIsSupported(supported);
    if (!supported) {
      setError('Tu navegador no soporta notificaciones push');
    }
  };

  const updatePermissionState = () => {
    const state = getNotificationPermissionState();
    setPermissionState(state);
  };

  const checkSubscription = async () => {
    if (!token) return;
    try {
      const status = await checkPushSubscriptionStatus(token);
      setIsSubscribed(status);
    } catch (error) {
      console.error('Error al verificar suscripción:', error);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      await subscribeToPushNotifications(token);
      setIsSubscribed(true);
      updatePermissionState();

      // Enviar notificación de bienvenida automáticamente
      setTimeout(async () => {
        try {
          await sendTestNotification(token);
        } catch (err) {
          console.error('Error al enviar notificación de bienvenida:', err);
        }
      }, 1000);

    } catch (error: any) {
      console.error('Error al activar notificaciones:', error);
      setError(error.message || 'Error al activar notificaciones');
      updatePermissionState();
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setError(null);

    try {
      await sendTestNotification(token);
    } catch (error: any) {
      console.error('Error al enviar notificación de prueba:', error);
      setError(error.message || 'Error al enviar notificación de prueba');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
          <CardDescription>
            Tu navegador no soporta notificaciones push
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Para recibir notificaciones, por favor usa un navegador compatible como Chrome, Firefox, Edge o Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <BellRing className="h-5 w-5 text-green-600" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          Notificaciones Push
        </CardTitle>
        <CardDescription>
          Recibe notificaciones cuando se publiquen nuevas tareas o cuando tus tareas sean calificadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {permissionState === 'denied' && (
          <Alert variant="destructive">
            <AlertDescription>
              Has bloqueado las notificaciones. Para activarlas, debes permitirlas en la configuración de tu navegador.
            </AlertDescription>
          </Alert>
        )}

        {!isSubscribed ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Al activar las notificaciones, recibirás:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
              <li>Alertas de nuevas tareas asignadas</li>
              <li>Notificaciones cuando tus tareas sean calificadas</li>
              <li>Recordatorios importantes de tu clase</li>
            </ul>
            <Button
              onClick={handleSubscribe}
              disabled={loading || permissionState === 'denied'}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activando...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Activar Notificaciones
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Alert>
              <BellRing className="h-4 w-4" />
              <AlertDescription>
                ✅ Notificaciones activadas correctamente
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleTestNotification}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <BellRing className="mr-2 h-4 w-4" />
                  Enviar Notificación de Prueba
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>💡 Tip: Las notificaciones funcionan incluso cuando cierras la aplicación.</p>
        </div>
      </CardContent>
    </Card>
  );
}
