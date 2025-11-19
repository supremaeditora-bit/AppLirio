/**
 * Clears all caches used by the application and unregisters all service workers.
 * After clearing, it forces a page reload to fetch the latest assets from the server.
 */
export async function clearAppCacheAndReload(): Promise<void> {
  try {
    console.log('Iniciando limpeza de cache e service worker...');

    // 1. Limpar todos os caches
    if ('caches' in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`Removendo cache: ${cacheName}`);
          return window.caches.delete(cacheName);
        })
      );
      console.log('Todos os caches foram removidos.');
    }

    // 2. Desregistrar todos os Service Workers, se não estiver em um iframe
    if ('serviceWorker' in navigator && window.self === window.top) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => {
            console.log(`Desregistrando service worker: ${registration.scope}`);
            return registration.unregister();
          })
        );
        console.log('Todos os service workers foram desregistrados.');
      } catch (error) {
          // Captura o erro específico do service worker para não parar a execução,
          // pois o erro "invalid state" pode acontecer mesmo com a verificação em alguns casos.
          console.warn('Não foi possível desregistrar o service worker:', error);
      }
    } else {
        console.log('Desregistro do Service Worker pulado: rodando em um iframe ou não suportado.');
    }

    // 3. Recarregar a página
    console.log('Recarregando a página...');
    alert('O cache foi limpo com sucesso. O aplicativo será recarregado.');
    window.location.reload();

  } catch (error) {
    console.error('Falha ao limpar o cache do aplicativo:', error);
    alert('Ocorreu um erro ao tentar limpar o cache. Por favor, tente novamente.');
  }
}