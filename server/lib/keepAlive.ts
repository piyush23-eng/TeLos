/**
 * TeLos Render & Cloud Keep-Alive Service
 *
 * Prevents Render (and similar cloud platforms on free tiers) from spinning down
 * after 15 minutes of inactivity. Auto-detects RENDER_EXTERNAL_URL or APP_URL and
 * issues an external HTTP ping to /ping every 12 minutes to reset the inactivity timer.
 */

const PING_INTERVAL_MS = 12 * 60 * 1000; // 12 minutes (Render timeout is 15 minutes)
const INITIAL_DELAY_MS = 25 * 1000;       // 25 seconds after boot

export function startKeepAliveService() {
  const targetUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.APP_URL ||
    process.env.KEEP_ALIVE_URL ||
    process.env.PING_URL;

  if (!targetUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.log(
        'ℹ️ [Keep-Alive] No RENDER_EXTERNAL_URL or APP_URL detected. ' +
        'Set APP_URL=https://your-service.onrender.com to enable auto-pinging.'
      );
    }
    return;
  }

  const cleanBase = targetUrl.replace(/\/+$/, '');
  const pingUrl = `${cleanBase}/ping`;

  console.log(`⚡ [Keep-Alive] Service active. Auto-pinging ${pingUrl} every 12m to prevent Render spin-down.`);

  const ping = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'TeLos-KeepAlive/1.0 (+https://github.com/piyush23-eng/TeLos)'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const uptimeMinutes = Math.floor(process.uptime() / 60);
      if (res.ok) {
        console.log(`[Keep-Alive] Heartbeat acknowledged (Status: ${res.status}, Uptime: ${uptimeMinutes}m).`);
      } else {
        console.warn(`[Keep-Alive] Ping returned status ${res.status}.`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('[Keep-Alive] Ping request timed out after 15s.');
      } else {
        console.warn('[Keep-Alive] Notice during ping:', err?.message || err);
      }
    }
  };

  // Initial ping shortly after boot once listening
  setTimeout(() => {
    void ping();
  }, INITIAL_DELAY_MS);

  // Periodic recurring ping
  const interval = setInterval(() => {
    void ping();
  }, PING_INTERVAL_MS);

  // Prevent interval from blocking process termination
  if (interval.unref) {
    interval.unref();
  }
}
