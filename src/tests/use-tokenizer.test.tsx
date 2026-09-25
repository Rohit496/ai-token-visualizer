import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ModelKey } from '@/lib/tokenizers/types';
import { useTokenizer } from '@/hooks/use-tokenizer';
class MockWorker {
  static instances: MockWorker[] = [];
  onmessage?: (event: { data: unknown }) => void;
  onerror?: () => void;
  postMessage = vi.fn();
  terminate = vi.fn();
  constructor() { MockWorker.instances.push(this); }
}
beforeEach(() => { vi.useFakeTimers(); MockWorker.instances = []; vi.stubGlobal('Worker', MockWorker); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it('debounces edits, rejects stale responses and avoids work on unchanged inputs', () => {
  const { result, rerender, unmount } = renderHook(({ text }) => useTokenizer(text, 'o200k_base'), { initialProps: { text: 'hello' } });
  const worker = MockWorker.instances[0];
  act(() => vi.advanceTimersByTime(180));
  const first = worker.postMessage.mock.calls[0][0];
  rerender({ text: 'hello world' });
  act(() => worker.onmessage?.({ data: { request: first.request, result: { input: 'hello' } } }));
  expect(result.current.pending).toBe(true);
  expect(result.current.result).toBeUndefined();
  act(() => vi.advanceTimersByTime(180));
  const latest = worker.postMessage.mock.calls[1][0];
  act(() => worker.onmessage?.({ data: { request: latest.request, result: { input: 'hello world' } } }));
  expect(result.current.result?.input).toBe('hello world');
  rerender({ text: 'hello world' });
  act(() => vi.advanceTimersByTime(500));
  expect(worker.postMessage).toHaveBeenCalledTimes(2);
  unmount(); expect(worker.terminate).toHaveBeenCalledOnce();
});
it('clears and handles unavailable providers without worker jobs', () => {
  const { result, rerender } = renderHook(({ text, model }: { text: string; model: 'o200k_base' | 'claude' }) => useTokenizer(text, model as ModelKey), { initialProps: { text: '', model: 'o200k_base' } });
  expect(result.current.result?.tokenCount).toBe(0);
  rerender({ text: 'hello', model: 'claude' });
  act(() => vi.advanceTimersByTime(500));
  expect(result.current.result).toBeUndefined();
  expect(result.current.pending).toBe(false);
  expect(MockWorker.instances[0].postMessage).not.toHaveBeenCalled();
});
it('surfaces worker errors', () => { const { result } = renderHook(() => useTokenizer('hi', 'cl100k_base')); act(() => MockWorker.instances[0].onerror?.()); expect(result.current.error).toContain('Could not load'); });

it.each(['gpt-5', 'gpt-4.1', 'o1', 'o3', 'o4-mini'] as const)('uses the verified encoding for %s', model => {
  renderHook(() => useTokenizer('hello', model));
  act(() => vi.advanceTimersByTime(180));
  expect(MockWorker.instances[0].postMessage).toHaveBeenCalledWith(expect.objectContaining({ input: 'hello', encoding: 'o200k_base' }));
});
