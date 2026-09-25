'use client';
import { useEffect, useState } from 'react';
import { LiquiGlass } from '@liqui-design/glass';

/** Decorative lens only. Native controls retain their semantics and focus behavior. */
export function GlassLens() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-transparency: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return <LiquiGlass aria-hidden="true" className="glass-lens" material={reduced ? 'clear' : 'auto'}
    profile="squircle" radius={28} bezel={11} refraction={48} blur={0.6}
    frost={0.24} specular={0.8} dispersion={0} />;
}
