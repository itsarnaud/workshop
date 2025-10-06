import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'

import App from './App.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [

  ] }
]);

const rootElement = document.getElementById('root');

if (rootElement) {
  const rootApp = createRoot(rootElement);
  rootApp.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
