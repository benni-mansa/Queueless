import Constants from 'expo-constants';

console.log('🔧 [ENV] Environment configuration loading...');
console.log('🔧 [ENV] Expo config available:', !!Constants.expoConfig);
console.log('🔧 [ENV] Process.env keys available:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));

// Environment configuration interface
interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  app: {
    name: string;
    version: string;
    environment: string;
  };
}

// Get environment variables from process.env first, then fallback to Expo config
const getEnvVar = (key: string): string => {
  console.log(`🔍 [ENV] Looking for environment variable: ${key}`);
  
  // First try to get from process.env (includes .env file variables)
  const processValue = process.env[key];
  if (processValue) {
    console.log(`✅ [ENV] Found ${key} in process.env:`, processValue ? 'Set' : 'Not set');
    return processValue;
  }
  
  console.log(`⚠️ [ENV] ${key} not found in process.env, checking Expo config...`);
  
  // Fallback to Expo config (for production builds)
  const expoValue = Constants.expoConfig?.extra?.[key];
  if (expoValue) {
    console.log(`✅ [ENV] Found ${key} in Expo config:`, expoValue ? 'Set' : 'Not set');
    return expoValue;
  }
  
  // Log what we found for debugging
  console.error(`❌ [ENV] Environment variable ${key} not found anywhere!`);
  console.error(`❌ [ENV] Available variables:`, {
    processEnv: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
    expoConfig: Constants.expoConfig?.extra
  });
  
  throw new Error(`Missing environment variable: ${key}`);
};

// Get optional environment variable
const getOptionalEnvVar = (key: string): string | undefined => {
  try {
    return getEnvVar(key);
  } catch {
    console.log(`ℹ️ [ENV] Optional environment variable ${key} not found`);
    return undefined;
  }
};

console.log('🔧 [ENV] Building environment configuration...');

// Environment configuration
export const config: EnvironmentConfig = {
  supabase: {
    url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getOptionalEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },
  app: {
    name: Constants.expoConfig?.name || 'Hospital Queue',
    version: Constants.expoConfig?.version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
};

console.log('✅ [ENV] Environment configuration built successfully');
console.log('🔍 [ENV] Final config summary:', {
  supabaseUrl: config.supabase.url ? `${config.supabase.url.substring(0, 20)}...` : 'MISSING',
  supabaseAnonKey: config.supabase.anonKey ? 'Set' : 'MISSING',
  supabaseServiceKey: config.supabase.serviceRoleKey ? 'Set' : 'Not set',
  appName: config.app.name,
  appVersion: config.app.version,
  appEnvironment: config.app.environment
});

// Validate configuration on import
export const validateConfig = (): void => {
  console.log('🔍 [ENV] Validating environment configuration...');
  console.log('🔍 [ENV] Available process.env keys (from .env file):', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  console.log('🔍 [ENV] Available Expo config:', Constants.expoConfig?.extra);
  
  if (!config.supabase.url || !config.supabase.anonKey) {
    const errorMessage = `Invalid Supabase configuration. 
    
    Current values:
    - EXPO_PUBLIC_SUPABASE_URL: ${config.supabase.url ? 'Set' : 'MISSING'}
    - EXPO_PUBLIC_SUPABASE_ANON_KEY: ${config.supabase.anonKey ? 'Set' : 'MISSING'}
    
    Please check your .env file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.
    
    If you don't have a .env file, copy .env.example to .env and fill in your Supabase credentials.
    
    IMPORTANT: The app now prioritizes reading from your .env file over Expo config.
    
    You can find your Supabase credentials in your Supabase project dashboard under Settings > API.
    
    Note: SUPABASE_SERVICE_ROLE_KEY is optional but recommended for admin operations.`;
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  // Validate URL format
  try {
    new URL(config.supabase.url);
    console.log('Supabase URL format is valid');
  } catch {
    const errorMessage = `Invalid Supabase URL format: ${config.supabase.url}. Please check your EXPO_PUBLIC_SUPABASE_URL.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  console.log('Environment configuration validation passed');
  if (config.supabase.serviceRoleKey) {
    console.log('Service role key is available for admin operations');
  } else {
    console.log('Service role key not available - admin operations may be limited');
  }
};

// Export individual config sections for convenience
export const { supabase, app } = config;
