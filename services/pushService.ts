import { savePushSubscription, removePushSubscription } from './api';

// IMPORTANTE: Substitua pela sua chave pública VAPID real.
// Você pode gerar chaves VAPID usando bibliotecas como `web-push`.
// Esta chave é um placeholder e NÃO FUNCIONARÁ em produção.
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BJRpA_3Z9gY_wF5t2Q_8J_7Y9Z-yX6_C_1E-p_0w_Y_U_L_K_S_E_R_V_E_R_K_E_Y';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUser(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    throw new Error('As notificações push não são suportadas neste navegador.');
  }

  const swRegistration = await navigator.serviceWorker.ready;
  let subscription = await swRegistration.pushManager.getSubscription();

  if (subscription === null) {
    console.log('Nenhuma inscrição encontrada, criando uma nova.');
    try {
      subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      console.log('Nova inscrição criada:', subscription);
    } catch (error) {
      console.error('Falha ao inscrever o usuário: ', error);
      if (Notification.permission === 'denied') {
        throw new Error('A permissão para notificações foi negada.');
      } else {
        throw new Error('Falha ao se inscrever para notificações push.');
      }
    }
  }

  await savePushSubscription(userId, subscription);
  return subscription;
}

export async function unsubscribeUser() {
   if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return;
  }
  const swRegistration = await navigator.serviceWorker.ready;
  const subscription = await swRegistration.pushManager.getSubscription();

  if (subscription) {
    await removePushSubscription(subscription);
    await subscription.unsubscribe();
    console.log('Usuário desinscrito.');
  }
}

export async function getSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
  }
  try {
    const swRegistration = await navigator.serviceWorker.ready;
    return swRegistration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting subscription', error);
    return null;
  }
}
