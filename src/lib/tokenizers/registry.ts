import type { ModelKey, Encoding } from './types';
// Verified against OpenAI's official model-to-encoding mapping on 2026-09-25:
// https://github.com/openai/tiktoken/blob/main/tiktoken/model.py
// These are local text-tokenizer choices, not a list of available inference APIs.
export const models: { id: ModelKey; label: string; encoding: Encoding }[] = [
  { id: 'gpt-5', label: 'OpenAI · GPT-5', encoding: 'o200k_base' },
  { id: 'gpt-4.1', label: 'OpenAI · GPT-4.1', encoding: 'o200k_base' },
  { id: 'o200k_base', label: 'OpenAI · GPT-4o', encoding: 'o200k_base' },
  { id: 'o1', label: 'OpenAI · o1', encoding: 'o200k_base' },
  { id: 'o3', label: 'OpenAI · o3', encoding: 'o200k_base' },
  { id: 'o4-mini', label: 'OpenAI · o4-mini', encoding: 'o200k_base' },
  { id: 'cl100k_base', label: 'OpenAI · GPT-4 / GPT-3.5', encoding: 'cl100k_base' },
];
export const samples = { 'Natural language': 'Who is the PM of India?', 'Source code': 'function greet(name: string) {\n  return `Hello, ${name}!`;\n}', JSON: '{\n  "name": "Ada",\n  "languages": ["English", "हिन्दी"]\n}', Multilingual: 'नमस्ते दुनिया! Hello world! こんにちは世界！ مرحبا بالعالم', 'Emojis & Unicode': 'Hello 👋🏽 🌍! 👨‍👩‍👧‍👦 café e\u0301 → ∞' };
