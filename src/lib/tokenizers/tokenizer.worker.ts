import { tokenize } from './openai';
import type { Encoding } from './types';
self.onmessage = async ({ data }: MessageEvent<{ request: number; input: string; encoding: Encoding }>) => {
  try { self.postMessage({ request: data.request, result: await tokenize(data.input, data.encoding) }); }
  catch (error) { self.postMessage({ request: data.request, error: error instanceof Error ? error.message : 'Tokenization failed.' }); }
};
