import React from 'react';
import { createRoot } from 'react-dom/client';
import SideRays from './SideRays.jsx';

const mountSideRays = () => {
  const container = document.getElementById('side-rays-root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <SideRays
        speed={3}
        rayColor1="#d1720c"
        rayColor2="#b89a5f"
        intensity={2}
        spread={1.8}
        origin="top-right"
        tilt={-9}
        saturation={1.5}
        blend={0.63}
        falloff={1.6}
        opacity={1.0}
      />
    );
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountSideRays);
} else {
  mountSideRays();
}
