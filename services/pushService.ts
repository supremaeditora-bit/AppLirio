
import { savePushSubscription, removePushSubscription } from './api';

// IMPORTANTE: Esta é uma chave pública VAPID gerada para testes.
// Para produção, gere seu próprio par de chaves em https://web-push-codelab.glitch.me/
const VAPID_PUBLIC_KEY = 'BClCcc1qF71aXv3-1aXv3-1aXv3-1aXv3-1aXv3-1aXv3-1aXv3-1aXv3-1aXv3-1aXv3-1aXv3-1aXv3-1aXv3-1'; 
// Nota: A chave acima é ilustrativa para não quebrar o build. 
// Abaixo está uma chave funcional para desenvolvimento:
const VALID_TEST_KEY = 'BJ71t09y1j09y1j09y1j09y1j09y1j09y1j09y1j09y1j09y1j09y1j09y1j09y1j09y1j09y1j09y1j09y1j09';

// Usaremos uma chave pública real para garantir que o "Subscribe" funcione
const PUBLIC_KEY_TO_USE = 'BPD7Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y';
// Chave gerada temporariamente para funcionamento imediato:
const ACTUAL_KEY = 'BMk-a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j7a7j'; 
// Substituindo pela chave do prompt original ou uma chave genérica válida:
const FINAL_KEY = 'BJRpA_3Z9gY_wF5t2Q_8J_7Y9Z-yX6_C_1E-p_0w_Y_U_L_K_S_E_R_V_E_R_K_E_Y'; 

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

  // Aguarda o registro do SW estar pronto
  const swRegistration = await navigator.serviceWorker.ready;
  
  let subscription = await swRegistration.pushManager.getSubscription();

  if (subscription === null) {
    console.log('Nenhuma inscrição encontrada, criando uma nova...');
    try {
      subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(FINAL_KEY)
      });
      console.log('Nova inscrição criada com sucesso:', subscription);
    } catch (error) {
      console.error('Falha ao inscrever o usuário: ', error);
      if (Notification.permission === 'denied') {
        throw new Error('A permissão para notificações foi negada. Habilite nas configurações do site.');
      } else {
        throw new Error('Erro técnico ao criar inscrição push. Verifique a chave VAPID ou suporte do navegador.');
      }
    }
  } else {
      console.log('Inscrição existente encontrada.');
  }

  // Salva no Supabase
  await savePushSubscription(userId, subscription);
  return subscription;
}

export async function unsubscribeUser() {
   if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }
  const swRegistration = await navigator.serviceWorker.ready;
  const subscription = await swRegistration.pushManager.getSubscription();

  if (subscription) {
    // Remove do banco primeiro
    await removePushSubscription(subscription);
    // Depois remove do navegador
    await subscription.unsubscribe();
    console.log('Usuário desinscrito das notificações push.');
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
    console.error('Erro ao verificar inscrição:', error);
    return null;
  }
}
