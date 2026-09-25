import { Tiktoken } from 'js-tiktoken/lite';
import type { Encoding, TokenizerAdapter, TokenResult } from './types';
const cache = new Map<Encoding, Promise<TokenizerAdapter>>();
export function getAdapter(encoding: Encoding): Promise<TokenizerAdapter> {
  let adapter = cache.get(encoding);
  if (!adapter) {
    adapter = (async () => {
      const { default: ranks } = encoding === 'o200k_base' ? await import('js-tiktoken/ranks/o200k_base') : await import('js-tiktoken/ranks/cl100k_base');
      const encoder = new Tiktoken(ranks);
      const bytesById = new Map<number, Uint8Array>();
      for (const line of ranks.bpe_ranks.split('\n').filter(Boolean)) {
        const [, start, ...values] = line.split(' ');
        values.forEach((value, offset) => bytesById.set(Number(start) + offset, Uint8Array.from(atob(value), c => c.charCodeAt(0))));
      }
      return { encode: text => encoder.encode(text, [], []), bytes: id => { const bytes = bytesById.get(id); if (!bytes) throw new Error(`Unknown token ${id}`); return bytes; } };
    })();
    cache.set(encoding, adapter);
    adapter.catch(() => cache.delete(encoding));
  }
  return adapter;
}
export async function tokenize(input: string, encoding: Encoding): Promise<TokenResult> {
  const adapter = await getAdapter(encoding);
  const ids = adapter.encode(input);
  const stream = new TextDecoder('utf-8', { ignoreBOM: true });
  const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
  let byteOffset = 0;
  const tokens = ids.map((id, index) => {
    const bytes = adapter.bytes(id);
    const byteStart = byteOffset; byteOffset += bytes.length;
    let partialUtf8 = false;
    try { new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { partialUtf8 = true; }
    return { index: index + 1, id, text: decoder.decode(bytes), displayText: stream.decode(bytes, { stream: index < ids.length - 1 }), bytes: Array.from(bytes), byteStart, byteEnd: byteOffset, partialUtf8 };
  });
  return { tokenizer: encoding, input, tokenCount: ids.length, characterCount: Array.from(input).length, wordCount: Array.from(new Intl.Segmenter(undefined, { granularity: 'word' }).segment(input)).filter(s => s.isWordLike).length, tokens };
}
