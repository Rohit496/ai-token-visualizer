'use client';
import { useEffect, useState, type PointerEvent } from 'react';
import { Braces, Check, Copy, Download, Moon, Sun, Search, ShieldCheck, Sparkles, Trash2, ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';
import { GlassLens } from './ui/glass-lens';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { TokenVisualizer } from './token-visualizer';
import { TokenInspector } from './token-inspector';
import { useTokenizer } from '@/hooks/use-tokenizer';
import { models, samples } from '@/lib/tokenizers/registry';
import { download, toJSON } from '@/lib/export';
import type { ModelKey, Token } from '@/lib/tokenizers/types';
export function TokenWorkbench() {
  const [input, setInput] = useState('Rohit Kumar');
  const [model, setModel] = useState<ModelKey>('o200k_base');
  const [mode, setMode] = useState('text');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Token>();
  const [light, setLight] = useState(false);
  const [notice, setNotice] = useState('');
  const { result, pending, error } = useTokenizer(input, model);
  const encoding = models.find(m => m.id === model)?.encoding;
  const supported = Boolean(encoding);
  useEffect(() => { setLight(localStorage.getItem('token-theme') === 'light'); }, []);
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(undefined); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);
  function changeInput(text: string) { setInput(text); setSelected(undefined); }
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); setNotice('Copied to clipboard'); } catch { setNotice('Clipboard unavailable. Use an export or select text to copy.'); } }
  function moveGlassHighlight(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const surface = (event.target as HTMLElement).closest<HTMLElement>('.glass-control');
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    surface.style.setProperty('--glint-x', `${event.clientX - rect.left}px`);
    surface.style.setProperty('--glint-y', `${event.clientY - rect.top}px`);
  }
  return <main onPointerMove={moveGlassHighlight} className={light ? 'app light' : 'app'}><div className="shell">
    <header><div className="brand glass-control"><GlassLens/><div className="logo"><Braces size={25}/></div><span>token<span className="brand-muted">scope</span><span className="brand-tag">PLAYGROUND</span></span></div><Button className="glass-control" variant="ghost" aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'} onClick={() => { setLight(!light); localStorage.setItem('token-theme', light ? 'dark' : 'light'); }}>{light ? <Moon size={19}/> : <Sun size={19}/>}</Button></header>
    <section className="intro"><div className="eyebrow"><span className="dot"/> THE BUILDING BLOCKS OF LANGUAGE</div><h1>AI Token Visualizer<span className="accent">.</span></h1><p>Explore how AI models break text into tokens.</p></section>
    <div className="work-surface"><section aria-label="Text input"><div className="editor-heading"><label htmlFor="input">Your text <span className="muted">/ input</span></label><div className="model-control glass-control"><GlassLens/><label htmlFor="model">Tokenizer</label><select id="model" value={model} onChange={e => { setModel(e.target.value as ModelKey); setSelected(undefined); }}>{models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div></div>
      <textarea id="input" spellCheck={false} value={input} onChange={e => changeInput(e.target.value)} placeholder="Enter your text to visualize tokens..."/>
      <div className="action-row"><div className="actions glass-control"><GlassLens/><Button onClick={() => changeInput('')}><Trash2 size={16}/>Clear</Button><Button onClick={() => changeInput(samples['Natural language'])}><Sparkles size={16}/>Show Example</Button><select aria-label="Sample text" className="sample-select" value="" onChange={e => { if(e.target.value) changeInput(samples[e.target.value as keyof typeof samples]); }}><option value="">More samples</option>{Object.keys(samples).map(key => <option key={key}>{key}</option>)}</select></div><Button variant="ghost" disabled={!result?.tokens.length || pending} onClick={() => result && copy(toJSON(result))}><Copy size={16}/>Copy Tokens</Button></div>
    </section>
    <section className="statistics" aria-label="Statistics" aria-live="polite"><div><span>Tokens</span><strong>{pending ? '…' : result?.tokenCount.toLocaleString() ?? '—'}</strong></div><div><span>Characters</span><strong>{Array.from(input).length.toLocaleString()}</strong></div><div className="word-stat"><span>Words</span><strong>{pending ? '…' : result?.wordCount.toLocaleString() ?? '—'}</strong></div><div className="encoding-status"><span className="status-pill"><span className="dot"/>{supported ? 'LOCAL TOKENIZER' : 'UNAVAILABLE'}</span><small>{supported ? `${encoding} · exact encoding` : 'Exact model tokenizer unavailable'}</small></div></section>
    {!supported && <p role="status" className="warning">Exact model tokenizer unavailable. Counts, boundaries, and IDs are not provided for this model. Choose an OpenAI tokenizer for verified local results.</p>}
    {error && <p role="alert" className="warning">{error}</p>}
    <section className="visual-section" aria-label="Token output"><div className="section-heading"><h2>Token breakdown <span className="muted">/ {mode === 'text' ? 'text' : 'IDs'}</span></h2><label className="search glass-control"><Search size={15}/><input aria-label="Search tokens" placeholder="Find text or token ID" value={query} onChange={e => setQuery(e.target.value)}/></label></div><div className="visual-panel">
      {pending ? <div className="empty">Preparing your tokens…</div> : result?.tokens.length ? <TokenVisualizer tokens={result.tokens} mode={mode} query={query} selected={selected?.index} onSelect={setSelected}/> : <div className="empty">{supported ? 'Your tokens will appear here. Start with a little text.' : 'Select a supported tokenizer to explore your text.'}</div>}
      <div className="visual-footer"><Tabs value={mode} onValueChange={setMode}><TabsList aria-label="Visualization mode" className="tabs glass-control"><GlassLens/><TabsTrigger value="text">Text</TabsTrigger><TabsTrigger value="ids">Token IDs</TabsTrigger></TabsList></Tabs><span className="hint">Click a token to inspect <ArrowUpRight size={14}/></span></div>
    </div>{result?.tokens.some(t => t.partialUtf8) && <p className="unicode-note">Some tokens split a Unicode character. The text view joins their bytes to preserve your text; inspect a token for its exact bytes.</p>}{result && result.tokens.length > 1500 && <p className="unicode-note">Large input: virtualized groups of 100 tokens. Group boundaries add visual line breaks only; exports preserve the original text.</p>}</section>
    {selected && result && <TokenInspector token={selected} tokenizer={result.tokenizer} onClose={() => setSelected(undefined)}/>}
    </div><div className="export-row"><div className="privacy"><ShieldCheck size={15}/><span>Free · No API key · Processed on your device.</span></div><div className="actions glass-control"><GlassLens/><Button variant="ghost" onClick={() => copy(input)} disabled={!input}><Copy size={14}/>Text</Button><Button variant="ghost" onClick={() => result && copy(result.tokens.map(t => t.id).join(', '))} disabled={!result?.tokens.length}><Copy size={14}/>IDs</Button><Button variant="ghost" onClick={() => result && download(result, 'json')} disabled={!result}><Download size={14}/>JSON</Button><Button variant="ghost" onClick={() => result && download(result, 'csv')} disabled={!result}><Download size={14}/>CSV</Button></div></div>
    <footer><span>A closer look at how language becomes numbers.</span><span className="copyright">© 2026 Rohit. All rights reserved.</span><span className="author-credit">Developed by <a href="https://www.linkedin.com/in/cloudyrohit/" target="_blank" rel="noopener noreferrer">Rohit</a></span></footer>
    <div role="status" className={notice ? 'toast' : 'sr-only'}>{notice && <><Check size={16}/>{notice}</>}</div>
  </div></main>;
}
