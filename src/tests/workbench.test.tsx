import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { TokenWorkbench } from '@/components/token-workbench';
import { TokenVisualizer } from '@/components/token-visualizer';
import type { Token } from '@/lib/tokenizers/types';
// The GPU/canvas lens is decorative; verify it in the real browser, not jsdom.
vi.mock('@/components/ui/glass-lens', () => ({ GlassLens: () => null }));
const token: Token = { index: 1, id: 15546, text: 'Who', displayText: 'Who', bytes: [87,104,111], byteStart: 0, byteEnd: 3, partialUtf8: false };
const hook = vi.fn((input: string, model: string) => ({ pending: false, result: model === 'claude' ? undefined : { tokenizer: model, input, tokens: input ? [token] : [], tokenCount: input ? 1 : 0, characterCount: input.length, wordCount: input ? 1 : 0 } }));
vi.mock('@/hooks/use-tokenizer', () => ({ useTokenizer: (input: string, model: string) => hook(input, model) }));
it('clears input and restores example', () => { render(<TokenWorkbench/>); fireEvent.click(screen.getByRole('button', { name: 'Clear' })); expect(screen.getByLabelText(/Your text/)).toHaveValue(''); expect(screen.getByText('Your tokens will appear here. Start with a little text.')).toBeVisible(); fireEvent.click(screen.getByRole('button', { name: 'Show Example' })); expect(screen.getByLabelText(/Your text/)).toHaveValue('Who is the PM of India?'); });
it('shows only working tokenizers and switches models', () => {
  render(<TokenWorkbench/>);
  const select = screen.getByLabelText('Tokenizer');
  expect(within(select).queryByRole('option', { name: /unavailable|Claude|Gemini|Llama/i })).not.toBeInTheDocument();
  expect(within(select).getByRole('option', { name: 'OpenAI · GPT-5' })).toBeInTheDocument();
  fireEvent.change(select, { target: { value: 'gpt-5' } });
  expect(hook).toHaveBeenLastCalledWith('Rohit Kumar', 'gpt-5');
  expect(screen.getByText('o200k_base · exact encoding')).toBeVisible();
  fireEvent.change(select, { target: { value: 'cl100k_base' } });
  expect(hook).toHaveBeenLastCalledWith('Rohit Kumar', 'cl100k_base');
});
it('selects inspector, closes with Escape and switches tabs', () => { render(<TokenWorkbench/>); fireEvent.click(screen.getByRole('button', { name: 'Token 1, ID 15546' })); expect(screen.getByRole('complementary', { name: 'Token inspector' })).toBeVisible(); fireEvent.keyDown(window, { key: 'Escape' }); expect(screen.queryByRole('complementary')).not.toBeInTheDocument(); fireEvent.mouseDown(screen.getByRole('tab', { name: 'Token IDs' }), { button: 0, ctrlKey: false }); expect(within(screen.getByTestId('token-text')).getByText('15546')).toBeVisible(); });
it('renders text without inserted whitespace and finds matching tokens', () => { render(<TokenVisualizer tokens={[token, { ...token, index: 2, id: 374, text: ' is', displayText: ' is' }]} mode="text" query="374" onSelect={vi.fn()}/>); expect(screen.getByTestId('token-text').textContent).toBe('Who is'); expect(screen.getByRole('button', { name: 'Token 2, ID 374' })).toHaveClass('match'); });
