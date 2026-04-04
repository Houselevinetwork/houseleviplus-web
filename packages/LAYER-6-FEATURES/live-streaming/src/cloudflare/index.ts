import axios from 'axios';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export interface LiveInput {
  uid: string;
  rtmps: {
    url: string;
    streamKey: string;
  };
}

export async function getLiveInput(inputId: string): Promise<LiveInput> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${inputId}`;
  const response = await axios.get(url, {
    headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
  });
  return response.data.result;
}

export function getStreamUrl(inputId: string): string {
  return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${inputId}/manifest/video.m3u8`;
}

export function getRTMPUrl(input: LiveInput): { url: string; key: string } {
  return {
    url: input.rtmps.url,
    key: input.rtmps.streamKey,
  };
}
