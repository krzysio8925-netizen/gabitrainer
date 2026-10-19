import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/fonts.css';
import './styles/organic.css';
import './styles/panel.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
