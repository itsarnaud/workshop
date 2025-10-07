import React from 'react'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="bg-background h-screen w-screen flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-xl border border-[#ccc]">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold">ESCAPE MED</h1>
          <p className="mt-1">Le virus se propage... à toi de trouver la clé pour le stopper !</p>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
