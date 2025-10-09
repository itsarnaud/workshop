import { useState, useEffect } from 'react';
import { useParams }           from 'react-router-dom';
import { getRole }             from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import Button          from './ui/button';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';

export default function Countdown() {
  const MAX = 2100;
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  const { id } = useParams();
  const role   = getRole();

  useEffect(() => {
    const getTimeLeft = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${id}`, {
        method: 'GET'
      })

      const data = await response.json();
      if (data.game_over) setGameOver(true);
      return data.time_left;
    };

    const setTimeLeft = async (time) => {
      await fetch(`${import.meta.env.VITE_API_URL}/api/games/${id}/time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_left: time }),
      })
    };

    const timer = setInterval(async () => {
      if (gameOver) {
        clearInterval(timer);
        return;
      }

      let t = await getTimeLeft();
      t -= 1;
      if (t <= 0) {
        t = 0;
        if (role === 'owner') await setTimeLeft(t);
        setGameOver(true);
        setTime(t);
        clearInterval(timer);
        return;
      }

      if (role === 'owner') await setTimeLeft(t);
      setTime(t);
    }, 1000);
    return () => clearInterval(timer);
  }, [id, role, gameOver])

  const percent = Math.round(((MAX - time) / MAX) * 100)

  return (
    <>
      {time !== 0 && !gameOver ? 
        <div className="flex gap-4 items-center">
          <div className="w-[400px] h-[10px] bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-[10px] rounded-full transition-all"
              style={{ width: `${percent}%`, backgroundColor: `${percent > 80 ? 'red' : 'green'}` }}
            />
          </div>
          <p>{percent}%</p>
        </div>
        : <p>Temps écoulé.</p>
      }

      <Dialog open={gameOver} onOpenChange={(open) => setGameOver(open)}>
        <DialogContent>
          <DialogTitle>Game Over</DialogTitle>
          <DialogDescription>
            Le rhume s'est beaucoup trop propagé et il est maintenant trop tard...<br />
            Relancez une partie pour retenter votre chance !
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => navigate('/', { replace: true })}>Quitter le jeu</Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>
    </>
  )
}
