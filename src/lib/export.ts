import type { TokenResult } from './tokenizers/types';
export function toJSON(result: TokenResult) { return JSON.stringify(result, null, 2); }
export function toCSV(result: TokenResult) {
  const quote = (value: unknown) => '"' + String(value).replaceAll('"', '""') + '"';
  return [['index','id','text','displayText','bytes','byteStart','byteEnd','partialUtf8'], ...result.tokens.map(t => [t.index,t.id,t.text,t.displayText,t.bytes.join(' '),t.byteStart,t.byteEnd,t.partialUtf8])].map(row => row.map(quote).join(',')).join('\r\n');
}
export function download(result: TokenResult, format: 'json' | 'csv') {
  const url = URL.createObjectURL(new Blob([format === 'json' ? toJSON(result) : toCSV(result)], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `tokens-${result.tokenizer}.${format}`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
