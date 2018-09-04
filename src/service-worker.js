self.addEventListener('install', () => {
    console.log('[sw]', 'Your ServiceWorker is installed');
});

self.addEventListener('push', event => {
    console.log('[sw]', 'pushed!!', event.data.json());
    const { title, msg, actions, data } = event.data.json();

    self.registration.showNotification(title, {
        body: msg,
        icon: '/assets/repux-icon-512x512.png',
        actions: actions,
        data: data
    });
});

self.addEventListener('notificationclick', event => {
    const { productAddress, type } = event.notification.data;

    let url = '/marketplace';

    if (type === 'finalise') {
        url = '/marketplace/details/' + productAddress;
    } else if (type === 'purchase') {
        url = '/notifications';
    }

    const promiseChain = clients.openWindow(url);
    event.waitUntil(promiseChain);
});
