'use client';
import { useEffect, useRef, useState } from 'react';
import { models } from '@/lib/tokenizers/registry';
import type { ModelKey, TokenResult } from '@/lib/tokenizers/types';
export function useTokenizer(input: string, model: ModelKey) {
  const worker = useRef<Worker | null>(null);
  const sequence = useRef(0);
  const [state, setState] = useState<{ result?: TokenResult; error?: string; pending: boolean }>({ pending: true });
  useEffect(() => {
    const instance = new Worker(new URL('../lib/tokenizers/tokenizer.worker.ts', import.meta.url));
    worker.current = instance;
    instance.onmessage = ({ data }) => { if (data.request === sequence.current) setState({ result: data.result, error: data.error, pending: false }); };
    instance.onerror = () => setState({ error: 'Could not load the local tokenizer. Reload to retry.', pending: false });
    return () => { instance.terminate(); worker.current = null; };
  }, []);
  useEffect(() => {
    const request = ++sequence.current;
    const encoding = models.find(m => m.id === model)?.encoding;
    if (!encoding) { setState({ pending: false }); return; }
    if (!input) { setState({ pending: false, result: { tokenizer: encoding, input: '', tokens: [], tokenCount: 0, characterCount: 0, wordCount: 0 } }); return; }
    setState({ pending: true });
    const timer = setTimeout(() => worker.current?.postMessage({ request, input, encoding }), 180);
    return () => clearTimeout(timer);
  }, [input, model]);
  return state;
}
