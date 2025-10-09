

import React, { useEffect, useState } from 'react';
import { getRole } from '../lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const role = getRole() || 'guest';
  const [enigmas, setEnigmas] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Les IDs à afficher selon le rôle
  const ids = role === 'owner' ? [2, 4, 6, 8] : [1, 3, 5, 7];

  useEffect(() => {
    // Récupérer toutes les questions depuis l'API
    const fetchEnigmas = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions`);
        const data = await res.json();
        if (Array.isArray(data)) setEnigmas(data);
      } catch {
        setEnigmas([]);
      }
    };
    fetchEnigmas();
  }, []);

  const openEnigma = (eid) => {
    const base = location.pathname.split('?')[0];
    const search = new URLSearchParams(location.search);
    search.set('enigma', String(eid));
    navigate(`${base}?${search.toString()}`);
  };

  return (
    <nav className="w-[300px] h-screen flex flex-col items-center fixed p-2">
      <img src="/logo-transparent-svg.svg" alt="Logo" />
      <div className="flex flex-col py-6 px-4 items-start w-full h-full rounded-2xl bg-white border-1 overflow-auto">
        <div className="w-full mb-4">
          <h3 className="text-lg font-semibold">Énigmes</h3>
        </div>

        <ul className="w-full space-y-2">
          {ids.map(id => {
            const item = enigmas.find(q => q.id === id || q.id === Number(id)) || {};
            return (
              <li
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => openEnigma(id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openEnigma(id) }}
                className={`w-full flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors hover:bg-gray-100`}
              >
                <button
                  type="button"
                  className="flex-shrink-0 mt-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </button>

                <div className="flex flex-col w-full">
                  <div className="font-medium">{item.title || `Énigme ${id}`}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

