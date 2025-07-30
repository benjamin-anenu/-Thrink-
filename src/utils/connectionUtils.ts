
export class ConnectionManager {
  private static instance: ConnectionManager;
  private isOnline = navigator.onLine;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Array<(isOnline: boolean) => void> = [];

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  private setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Check connection periodically
    setInterval(() => {
      this.checkConnection();
    }, 30000); // Check every 30 seconds
  }

  private handleOnline() {
    console.log('[Connection] Network came back online');
    this.isOnline = true;
    this.reconnectAttempts = 0;
    this.notifyListeners(true);
  }

  private handleOffline() {
    console.log('[Connection] Network went offline');
    this.isOnline = false;
    this.notifyListeners(false);
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(window.location.origin, {
        method: 'HEAD',
        cache: 'no-cache'
      });
      const wasOnline = this.isOnline;
      this.isOnline = response.ok;
      
      if (!wasOnline && this.isOnline) {
        this.handleOnline();
      } else if (wasOnline && !this.isOnline) {
        this.handleOffline();
      }
      
      return this.isOnline;
    } catch (error) {
      const wasOnline = this.isOnline;
      this.isOnline = false;
      
      if (wasOnline) {
        this.handleOffline();
      }
      
      return false;
    }
  }

  public async waitForConnection(): Promise<boolean> {
    if (this.isOnline) {
      return true;
    }

    return new Promise((resolve) => {
      const checkConnection = async () => {
        if (await this.checkConnection()) {
          resolve(true);
          return;
        }

        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          resolve(false);
          return;
        }

        setTimeout(checkConnection, this.reconnectDelay * this.reconnectAttempts);
      };

      checkConnection();
    });
  }

  public addConnectionListener(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
  }

  public removeConnectionListener(callback: (isOnline: boolean) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        console.error('[Connection] Error notifying listener:', error);
      }
    });
  }

  public getConnectionStatus(): boolean {
    return this.isOnline;
  }

  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.waitForConnection();
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`[Connection] Operation failed (attempt ${attempt}/${maxAttempts}):`, error);
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError!;
  }
}

// Export singleton instance
export const connectionManager = ConnectionManager.getInstance();
