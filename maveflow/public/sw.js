// ============================================
// MaveFlow - Service Worker for Web Push
// ============================================

self.addEventListener("push", function (event: any) {
  if (event.data) {
    try {
      const data = event.data.json();
      
      const options = {
        body: data.message || "You have a new MaveFlow notification.",
        icon: "/icon-192x192.png", // Assuming icon exists
        badge: "/badge.png",
        data: data.url || "/dashboard",
        vibrate: [100, 50, 100],
        actions: [
          { action: "explore", title: "View Details" },
          { action: "close", title: "Close" }
        ]
      };

      event.waitUntil(
        (self as any).registration.showNotification(data.title || "MaveFlow Alert", options)
      );
    } catch (e) {
      console.error("Push event payload could not be parsed.");
    }
  }
});

self.addEventListener("notificationclick", function (event: any) {
  event.notification.close();

  if (event.action !== "close") {
    // Open the target URL when notification is clicked
    const targetUrl = event.notification.data || "/dashboard";
    
    event.waitUntil(
      (self as any).clients.matchAll({ type: "window" }).then((windowClients: any[]) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if ((self as any).clients.openWindow) {
          return (self as any).clients.openWindow(targetUrl);
        }
      })
    );
  }
});
