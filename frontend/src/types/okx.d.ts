interface OKXProvider {
  isOKXWallet?: boolean;
  connect(): Promise<string[]>;
  disconnect(): Promise<void>;
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(eventName: string, handler: (...args: any[]) => void): void;
  removeListener(eventName: string, handler: (...args: any[]) => void): void;
}

interface Window {
  okxwallet?: OKXProvider;
} 