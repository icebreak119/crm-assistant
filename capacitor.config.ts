import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.feixingshe.crm',
  appName: '客户管理',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
