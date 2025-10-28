// Firebase Cloud Messaging Service Worker
// Este arquivo processa notificações push em background

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// IMPORTANTE: Substitua os placeholders abaixo pelos valores reais do Firebase
// Estes valores devem corresponder aos secrets configurados no Supabase
const firebaseConfig = {
  apiKey: "PLACEHOLDER_FIREBASE_API_KEY",
  authDomain: "PLACEHOLDER_FIREBASE_AUTH_DOMAIN",
  projectId: "PLACEHOLDER_FIREBASE_PROJECT_ID",
  messagingSenderId: "PLACEHOLDER_FIREBASE_MESSAGING_SENDER_ID",
  appId: "PLACEHOLDER_FIREBASE_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Recebe notificações quando o site está em background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'ITL BRASIL';
  const notificationOptions = {
    body: payload.notification?.body || 'Nova notificação',
    icon: payload.notification?.icon || '/logo-itl-brasil.png',
    badge: payload.notification?.badge || '/logo-itl-brasil.png',
    data: payload.data || {},
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/logo-itl-brasil.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data?.url || '/admin/security';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Verificar se já existe uma janela aberta
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Se não, abrir nova janela
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (event.action === 'dismiss') {
    // Apenas fecha a notificação
    console.log('Notification dismissed');
  } else {
    // Clique sem ação específica - abrir painel de segurança
    const urlToOpen = event.notification.data?.url || '/admin/security';
    
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

console.log('[firebase-messaging-sw.js] Service Worker initialized');
