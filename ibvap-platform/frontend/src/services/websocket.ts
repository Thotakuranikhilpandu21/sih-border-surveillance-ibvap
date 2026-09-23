export class AlertWebSocketSubscriber {
  private ws: WebSocket | null = null;
  private listeners: ((data: any) => void)[] = [];

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/alerts`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          this.listeners.forEach((fn) => fn(data));
        } catch (err) {
          console.error("WS error:", err);
        }
      };
      this.ws.onclose = () => {
        setTimeout(() => this.connect(), 3000);
      };
    } catch (e) {
      console.warn("WebSocket fallback mode", e);
    }
  }

  subscribe(callback: (data: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const alertWs = new AlertWebSocketSubscriber();
