import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';

// Set Vietnamese locale cho dayjs
dayjs.locale('vi');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
