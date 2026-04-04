export const cloudflareConfig = () => ({
  r2: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
    bucket: process.env.CLOUDFLARE_R2_BUCKET,
    region: process.env.CLOUDFLARE_R2_REGION || 'auto',
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
  },
  stream: {
    apiUrl: process.env.CLOUDFLARE_STREAM_API_URL,
    token: process.env.CLOUDFLARE_STREAM_TOKEN,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID_STREAM,
  },
});