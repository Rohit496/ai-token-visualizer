export type Encoding = 'o200k_base' | 'cl100k_base';
export type ModelKey = Encoding | 'gpt-5' | 'gpt-4.1' | 'o1' | 'o3' | 'o4-mini';
export interface Token { index: number; id: number; text: string; displayText: string; bytes: number[]; byteStart: number; byteEnd: number; partialUtf8: boolean; }
export interface TokenResult { tokenizer: string; input: string; tokenCount: number; characterCount: number; wordCount: number; tokens: Token[]; }
export interface TokenizerAdapter { encode(text: string): number[]; bytes(id: number): Uint8Array; }
