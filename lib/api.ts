
const TARGET_BASE_URL = 'https://gen.pollinations.ai/text'; 
const ALPHA_PROXY_URL = 'https://script.google.com/macros/s/AKfycbzmkNoWvTNRLhW-rNp7WijNAV_9kv5gez6khybt79VequBOfmmeGLHH_P07JIjDUsZ7nQ/exec';
const POLLINATIONS_KEY = 'pk_3k6psaCW9Jj8NuMA';
const POLLINATIONS_MODEL = 'openai-fast';

export const fetchWithProxy = async <T>(promptPath: string, options?: RequestInit): Promise<T> => {
  const targetUrl = `${TARGET_BASE_URL}/${promptPath}`;
  
  let isDev = false;
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) isDev = true;
  } catch (e) {
    isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }
  
  const url = isDev 
    ? `/api-proxy/text/${promptPath}?model=${POLLINATIONS_MODEL}&key=${POLLINATIONS_KEY}` 
    : `${ALPHA_PROXY_URL}?url=${encodeURIComponent(targetUrl)}&model=${POLLINATIONS_MODEL}&key=${POLLINATIONS_KEY}`;

  try {
    const response = await fetch(url, { ...options, headers: { 'Accept': 'application/json' } });
    const rawText = await response.text();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0].replace(/```json|```/g, "").trim()) as T;
    throw new Error("No JSON");
  } catch (err) {
    throw err;
  }
};
