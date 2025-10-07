import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'

import Layout from './components/Layout'
import App    from './App.jsx'
import Login  from './pages/auth/login'
import Signup from './pages/auth/signup'
import RequireAuth from './components/RequireAuth'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'join/:token', element: <Join /> },
    ]
  }
])

const rootElement = document.getElementById('root');

if (rootElement) {
  const rootApp = createRoot(rootElement);
  rootApp.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
