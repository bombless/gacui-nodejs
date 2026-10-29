'use strict';

class GacUIClient {
  constructor(options = {}) {
    const host = options.host || '127.0.0.1';
    const port = Number(options.port || 8888);
    const app = options.app || 'RemotingTest_Core';

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new TypeError('port must be an integer from 1 to 65535');
    }
    if (!/^[A-Za-z0-9_.-]+$/.test(app)) {
      throw new TypeError('app must contain only letters, numbers, ".", "_" or "-"');
    }

    this.baseUrl = `http://${host}:${port}/Automation/${app}`;
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      ...options,
      signal: AbortSignal.timeout(options.timeout || 5000),
    });
    const body = await response.text();

    if (!response.ok) {
      throw new Error(`GacUI HTTP ${response.status} ${response.statusText}: ${body.slice(0, 500)}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    return body;
  }

  // Returns the visible GacUI window/control tree.
  getControls() {
    return this.request('Controls');
  }

  // Available when connecting to a remote-protocol renderer endpoint.
  getDom() {
    return this.request('Dom');
  }

  // Send a GacUI automation IO command. The command schema is defined by
  // the GacUI application; this client intentionally passes it through.
  sendIO(command, windowId) {
    if (command === null || typeof command !== 'object' || Array.isArray(command)) {
      throw new TypeError('command must be a JSON object');
    }

    const suffix = windowId === undefined || windowId === null
      ? 'IO'
      : `IO/${encodeURIComponent(String(windowId))}`;

    return this.request(suffix, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf8' },
      body: JSON.stringify(command),
    });
  }
}

module.exports = { GacUIClient };
