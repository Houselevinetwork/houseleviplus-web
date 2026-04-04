// src/config/app.config.ts

/**
 * Get the appropriate backend webhook URL based on environment
 * This is where Pesapal sends IPN notifications
 */
export const getCallbackUrl = (): string => {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    return process.env.PESAPAL_CALLBACK_URL || 
           process.env.PESAPAL_CALLBACK_URL_PROD || 
           'https://api.reelafrika.co.ke/billing/pesapal-webhook';
  }
  
  // Development
  return process.env.PESAPAL_CALLBACK_URL_DEV || 
         'http://localhost:4000/billing/pesapal-webhook';
};

/**
 * Get the appropriate frontend URL based on environment
 */
export const getFrontendUrl = (): string => {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    return process.env.FRONTEND_URL || 
           process.env.FRONTEND_URL_PROD || 
           'https://www.reelafrika.co.ke';
  }
  
  return process.env.FRONTEND_URL_LOCAL || 'http://localhost:5173';
};

/**
 * Get the appropriate admin frontend URL based on environment
 */
export const getAdminFrontendUrl = (): string => {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    return process.env.ADMIN_FRONTEND_URL || 
           process.env.ADMIN_FRONTEND_URL_PROD || 
           'https://studio.reelafrika.co.ke';
  }
  
  return process.env.ADMIN_FRONTEND_URL_LOCAL || 'http://localhost:8080';
};

/**
 * Get the appropriate backend URL based on environment
 */
export const getBackendUrl = (): string => {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    return process.env.BACKEND_URL || 
           process.env.BACKEND_URL_PROD || 
           'https://api.reelafrika.co.ke';
  }
  
  return process.env.BACKEND_URL_LOCAL || 'http://localhost:4000';
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Main application configuration
 */
export const appConfig = () => ({
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  
  // Server
  port: parseInt(process.env.PORT || '4000', 10),
  
  // Database
  mongoUri: process.env.MONGO_URI,
  
  // URLs
  backendUrl: getBackendUrl(),
  frontendUrl: getFrontendUrl(),
  adminFrontendUrl: getAdminFrontendUrl(),
  
  // Pesapal
  pesapal: {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY,
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET,
    apiUrl: process.env.PESAPAL_API_URL || 'https://pay.pesapal.com/v3/api',
    callbackUrl: getCallbackUrl(), // Backend webhook URL
    ipnId: process.env.PESAPAL_IPN_ID,
    merchantEmail: process.env.PESAPAL_MERCHANT_EMAIL,
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Email
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
    fromName: process.env.MAIL_FROM_NAME,
  },
  
  // Cloudflare
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    r2: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      region: process.env.CLOUDFLARE_R2_REGION || 'auto',
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
      buckets: {
        minisode: process.env.CLOUDFLARE_R2_BUCKET_MINISODE,
        reelfilm: process.env.CLOUDFLARE_R2_BUCKET_REELFILM,
        tvEpisode: process.env.CLOUDFLARE_R2_BUCKET_TV_EPISODE,
        movie: process.env.CLOUDFLARE_R2_BUCKET_MOVIE,
        podcast: process.env.CLOUDFLARE_R2_BUCKET_PODCAST,
        music: process.env.CLOUDFLARE_R2_BUCKET_MUSIC,
        stageplay: process.env.CLOUDFLARE_R2_BUCKET_STAGEPLAY,
      },
    },
    stream: {
      apiUrl: process.env.CLOUDFLARE_STREAM_API_URL,
      apiToken: process.env.CLOUDFLARE_STREAM_API_TOKEN,
      uploadUrl: process.env.CLOUDFLARE_STREAM_UPLOAD_URL,
    },
  },
  
  // CORS Origins - Allow both production and development frontends
  corsOrigins: [
    getFrontendUrl(),
    getAdminFrontendUrl(),
    'http://localhost:5173',  // Development frontend
    'http://localhost:8080',  // Development admin
    'https://www.reelafrika.co.ke',  // Production frontend
    'https://studio.reelafrika.co.ke',  // Production admin
  ].filter(Boolean),
});

/**
 * Log current environment configuration (for debugging)
 */
export const logEnvironmentConfig = (logger?: any) => {
  const config = appConfig();
  const log = logger?.log || console.log;
  
  log('='.repeat(60));
  log('🚀 Application Configuration');
  log('='.repeat(60));
  log(`Environment: ${config.nodeEnv}`);
  log(`Port: ${config.port}`);
  log(`Backend URL: ${config.backendUrl}`);
  log(`Frontend URL: ${config.frontendUrl}`);
  log(`Admin Frontend URL: ${config.adminFrontendUrl}`);
  log(`Pesapal Webhook: ${config.pesapal.callbackUrl}`);
  log(`CORS Origins: ${config.corsOrigins.join(', ')}`);
  log('='.repeat(60));
};