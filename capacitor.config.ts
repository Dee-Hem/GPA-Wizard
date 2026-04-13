import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.olumide.gpawizard',
  appName: 'GPA Wizard',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  // Add this section to handle storage permissions
  plugins: {
    Filesystem: {
      publicStorage: true
    },
  SplashScreen: {
    launchShowDuration: 0, // This kills the native splash screen immediately
    launchAutoHide: true,
    backgroundColor: "#0f172a", // Match your dark background
    androidScaleType: "CENTER_CROP",
    },
  }
};

export default config;
