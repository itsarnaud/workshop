import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'

import Layout from './components/Layout'
import App    from './App.jsx'
import Login  from './pages/auth/login'
import Signup from './pages/auth/signup'
import Join   from './pages/auth/join'
import Games  from './pages/games'
import RequireAuth from './components/RequireAuth'
import Game from './pages/game'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'join/:token', element: <Join /> },
      { path: 'games', element: <RequireAuth><Games /></RequireAuth> },
      { path: 'game/:id', element: <Game /> }
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
