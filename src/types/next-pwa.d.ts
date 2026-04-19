declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAOptions {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
  }
  
  function withPWA(options: PWAOptions): (config: NextConfig) => NextConfig;
  
  export = withPWA;
}