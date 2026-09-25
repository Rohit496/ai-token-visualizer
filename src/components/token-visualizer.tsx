'use client';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Token } from '@/lib/tokenizers/types';
export function TokenVisualizer({ tokens, mode, query, selected, onSelect }: { tokens: Token[]; mode: string; query: string; selected?: number; onSelect: (token: Token) => void }) {
  const scroll = useRef<HTMLDivElement>(null);
  const large = tokens.length > 1500;
  const virtual = useVirtualizer({ count: large ? Math.ceil(tokens.length / 100) : 0, getScrollElement: () => scroll.current, estimateSize: () => 180, overscan: 3 });
  const render = (token: Token) => {
    const match = query && (String(token.id).includes(query) || token.text.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    return <button type="button" key={token.index} aria-label={`Token ${token.index}, ID ${token.id}`} aria-pressed={selected === token.index} title={`#${token.index} · ${token.id}${token.partialUtf8 ? ' · partial UTF-8 bytes' : ''}`} onClick={() => onSelect(token)} className={`token color-${(token.index - 1) % 6} ${match ? 'match' : ''} ${selected === token.index ? 'selected' : ''} ${mode === 'ids' ? 'token-id' : ''} ${!token.displayText ? 'byte-fragment' : ''}`}>{mode === 'ids' ? token.id : token.displayText}</button>;
  };
  return <div ref={scroll} className="token-scroll" data-testid="token-text" tabIndex={0} aria-label="Token visualization">
    {large ? <div style={{ height: virtual.getTotalSize(), position: 'relative' }}>{virtual.getVirtualItems().map(row => <div key={row.key} data-index={row.index} ref={virtual.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${row.start}px)` }}>{tokens.slice(row.index * 100, (row.index + 1) * 100).map(render)}</div>)}</div> : tokens.map(render)}
  </div>;
}
