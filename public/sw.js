self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('push', (e) => {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(d.title || 'Ananke', {
    body: d.body || 'Task needs attention!',
    icon: '/ananke-icon.png',
    tag: d.tag || 'ananke',
    requireInteraction: d.urgent || false,
    vibrate: d.urgent ? [200,100,200,100,200] : [200,100,200],
    data: { url: '/', taskId: d.taskId },
    actions: [{ action: 'complete', title: '✅ Complete' }, { action: 'snooze', title: '⏰ 5 min' }]
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const action = e.action;
  const taskId = e.notification.data?.taskId;
  e.waitUntil(clients.matchAll({ type: 'window' }).then(cs => {
    // Only send COMPLETE_TASK when user explicitly clicks "Complete" action
    if (action === 'complete' && taskId) {
      cs.forEach(c => c.postMessage({ type: 'COMPLETE_TASK', taskId }));
    }
    // Just focus the window for any click
    if (cs.length > 0) cs[0].focus();
    else clients.openWindow('/');
  }));
});
