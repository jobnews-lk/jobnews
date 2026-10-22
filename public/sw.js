// JobNews.lk Ultra-Fast PWA Service Worker & Realtime Web Push Notification Handler
const CACHE_NAME = 'jobnews-pwa-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first fetch strategy: ensures job postings and API data are always 100% fresh
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Real-time Push Notification Handler for New Job Alerts
self.addEventListener('push', (event) => {
  let payload = {
    title: 'JobNews.lk - නව රැකියා ඇබෑර්තුවක්!',
    body: 'අලුත්ම රජයේ / පෞද්ගලික රැකියා අවස්ථාවක් පළ විය. දැන්ම පරීක්ෂා කරන්න.',
    icon: '/jobnews-icon-192.png',
    badge: '/jobnews-badge-mono.png',
    url: '/jobs',
    unreadCount: 1,
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch (e) {
    try {
      if (event.data) {
        payload.body = event.data.text();
      }
    } catch (e2) {}
  }

  // Update App Icon Red Badge if supported
  if ('setAppBadge' in self.navigator) {
    self.navigator.setAppBadge(payload.unreadCount || 1).catch(() => {});
  }

  const cleanIcon = (payload.icon && !payload.icon.endsWith('.svg')) ? payload.icon : '/jobnews-icon-192.png';
  const cleanBadge = (payload.badge && !payload.badge.endsWith('.svg')) ? payload.badge : '/jobnews-badge-mono.png';

  const options = {
    body: payload.body,
    icon: cleanIcon,
    badge: cleanBadge,
    vibrate: [150, 80, 150],
    data: {
      url: payload.url || '/jobs',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'explore', title: 'විස්තර බලන්න' },
      { action: 'close', title: 'පසුව' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Handle User Clicking the Push Notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Clear App Icon badge upon user clicking notification
  if ('clearAppBadge' in self.navigator) {
    self.navigator.clearAppBadge().catch(() => {});
  }

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/jobs';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen to messages from frontend client to synchronize badge
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SET_BADGE' && 'setAppBadge' in self.navigator) {
    self.navigator.setAppBadge(event.data.count || 0).catch(() => {});
  } else if (event.data.type === 'CLEAR_BADGE' && 'clearAppBadge' in self.navigator) {
    self.navigator.clearAppBadge().catch(() => {});
  }
});
