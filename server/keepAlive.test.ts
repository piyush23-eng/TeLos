import { describe, it, expect, vi } from 'vitest';
import { startKeepAliveService } from './lib/keepAlive';

describe('Render & Cloud Keep-Alive System', () => {
  it('initializes cleanly without errors when no target URL is set', () => {
    delete process.env.RENDER_EXTERNAL_URL;
    delete process.env.APP_URL;
    delete process.env.KEEP_ALIVE_URL;
    delete process.env.PING_URL;

    expect(() => startKeepAliveService()).not.toThrow();
  });

  it('detects RENDER_EXTERNAL_URL and schedules periodic keep-alive probes', () => {
    process.env.RENDER_EXTERNAL_URL = 'https://telos.onrender.com';
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      startKeepAliveService();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-pinging https://telos.onrender.com/ping every 12m')
      );
    } finally {
      delete process.env.RENDER_EXTERNAL_URL;
      consoleSpy.mockRestore();
    }
  });

  it('detects custom APP_URL and strips trailing slashes', () => {
    process.env.APP_URL = 'https://custom-domain.com///';
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      startKeepAliveService();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-pinging https://custom-domain.com/ping every 12m')
      );
    } finally {
      delete process.env.APP_URL;
      consoleSpy.mockRestore();
    }
  });
});
