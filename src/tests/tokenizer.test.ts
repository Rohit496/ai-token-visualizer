import { describe, it, expect } from 'vitest';
import { tokenize } from '@/lib/tokenizers/openai';
import { toCSV, toJSON } from '@/lib/export';
const inputs = ['', 'Who is the PM of India?', 'a   b', '  hello  ', 'one\ntwo\n', 'const x = { a: 1 };\n  x.a++;', '👋🏽👨‍👩‍👧‍👦 e\u0301', 'नमस्ते こんにちは مرحبا', '<|endoftext|>', '\ufeffHello'];
describe.each(['cl100k_base', 'o200k_base'] as const)('%s', encoding => {
  it.each(inputs)('reconstructs %j with exact bytes', async input => {
    const result = await tokenize(input, encoding);
    expect(result.tokens.map(t => t.displayText).join('')).toBe(input);
    expect(new TextDecoder('utf-8', { ignoreBOM: true }).decode(Uint8Array.from(result.tokens.flatMap(t => t.bytes)))).toBe(input);
    expect(result.characterCount).toBe(Array.from(input).length);
    expect(result.tokenCount).toBe(result.tokens.length);
    let offset = 0; for (const token of result.tokens) { expect(token.byteStart).toBe(offset); offset += token.bytes.length; expect(token.byteEnd).toBe(offset); }
  });
});
it('matches known cl100k vectors', async () => {
  expect((await tokenize('hello world', 'cl100k_base')).tokens.map(t => t.id)).toEqual([15339, 1917]);
  expect((await tokenize('Who is the PM of India?', 'cl100k_base')).tokens.map(t => t.id)).toEqual([15546, 374, 279, 5975, 315, 6890, 30]);
});
it('matches o200k vector and changes encoding', async () => { expect((await tokenize('hello world', 'o200k_base')).tokens.map(t => t.id)).toEqual([24912, 2375]); });
it('exports complete JSON and quoted CSV', async () => { const result = await tokenize('"a",\nb', 'cl100k_base'); expect(JSON.parse(toJSON(result))).toEqual(result); expect(toCSV(result)).toContain('"index","id"'); expect(toCSV(result)).toContain('""'); });
