
const TARGET_BASE_URL = 'https://gen.pollinations.ai/text'; 
const ALPHA_PROXY_URL = 'https://script.google.com/macros/s/AKfycbzmkNoWvTNRLhW-rNp7WijNAV_9kv5gez6khybt79VequBOfmmeGLHH_P07JIjDUsZ7nQ/exec';
const POLLINATIONS_KEY = 'pk_3k6psaCW9Jj8NuMA';
const POLLINATIONS_MODEL = 'openai-fast';

/**
 * shadowCipher: Função de ofuscação para esconder a URL real no Network tab.
 * Utiliza operação XOR dinâmica com base64.
 */
const shadowCipher = (url: string) => btoa(
  encodeURIComponent(url)
    .split('')
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (10 + (i % 5))))
    .join('')
);

export const fetchWithProxy = async <T>(promptPath: string, options?: RequestInit): Promise<T> => {
  // 1. Cálculo de valor aleatório para a Seed
  const randomSeed = Math.floor(Math.random() * 1000000000);
  
  // 2. Construção da URL Alvo completa com todos os parâmetros sensíveis
  const fullTargetUrl = `${TARGET_BASE_URL}/${promptPath}?model=${POLLINATIONS_MODEL}&seed=${randomSeed}&key=${POLLINATIONS_KEY}`;
  
  let isDev = false;
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) isDev = true;
  } catch (e) {
    isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }
  
  // 3. Estratégia de Fetch com MODO SHADOW ativo em produção
  let url: string;
  if (isDev) {
    // Em desenvolvimento usamos o proxy do Vite para facilidade, mantendo parâmetros visíveis localmente
    url = `/api-proxy/text/${promptPath}?model=${POLLINATIONS_MODEL}&seed=${randomSeed}&key=${POLLINATIONS_KEY}`;
  } else {
    // Em produção/preview, aplicamos a criptografia shadowCipher para esconder o tráfego
    // O parâmetro enc=true informa ao Alpha Proxy que a URL deve ser decifrada no servidor
    const encryptedPayload = shadowCipher(fullTargetUrl);
    url = `${ALPHA_PROXY_URL}?enc=true&url=${encodeURIComponent(encryptedPayload)}`;
  }

  try {
    const response = await fetch(url, { 
      ...options, 
      headers: { 
        'Accept': 'application/json',
        ...options?.headers
      } 
    });
    
    const rawText = await response.text();
    
    // Tenta extrair o JSON da resposta (lidando com possíveis wrappers da IA)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, "").trim()) as T;
    }
    
    throw new Error("Resposta da IA não contém um objeto JSON válido.");
  } catch (err) {
    console.error("Shadow Proxy Error:", err);
    throw err;
  }
};
