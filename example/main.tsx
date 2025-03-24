import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StrictMode } from 'react';

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<StrictMode><App /></StrictMode>);
}
