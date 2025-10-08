import Button       from '@/components/ui/button';
import { getToken } from '@/lib/auth'
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle
} from '@/components/ui/item'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import socket from '@/socket';
import { useNavigate } from 'react-router-dom';

export default function Games() {
  const [games, setGames]           = useState({});
  const [loading, setLoading]       = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied]         = useState(false);
  const [guestJoined, setGuestJoined] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(null);
  const navigate = useNavigate()
  
  useEffect(() => {
    socket.on('guest:joined', ({ guest }) => {
      setGuestJoined(guest);
    })

    socket.on('game:started', ({ gameId }) => {
      console.log('Game started', gameId);
      navigate(`/game/${gameId}`, { replace: true });
    })

    return () => {
      socket.off('connect');
      socket.off('guest:joined');
      socket.off('game:started');
    }
  }, [navigate])

  const getGames = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/games/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json();
      if (response.ok) {
        setGames(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const createGame = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/games`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()

      if (response.ok) {
        return data;
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const createInvitation = async (game) => {
    const token = getToken();
    try {
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invitations`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game_id: game.id, expires_at: expiresAt.toISOString() })
      })
      const data = await response.json()

      if (response.ok) {
        return data;
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getGames();
  }, []);

  return (
    <section>
      {loading && 
        <Skeleton className="w-full h-20 rounded-lg" />
      }

      {!loading &&
        <div className="flex w-full flex-col space-y-3">
          {Array.isArray(games) && games.map((game, index) => (
            <Item key={game.id ?? index} variant="outline">
              <ItemContent>
                <ItemTitle>Partie n°{index+1}</ItemTitle>
                {game.guests.length ? 
                  <ItemDescription>
                    Avec {game.guests.map((guest, gindex) => (
                      <span key={guest.id ?? guest.username ?? gindex}>{guest.username}</span>
                    ))}
                  </ItemDescription> : ''
                }
              </ItemContent>
              <ItemActions>
                <Button variant="outline" size="sm">
                  Reprendre la partie
                </Button>
              </ItemActions>
            </Item>
          ))}
          <Dialog
            onOpenChange={async (open) => {
              if (open) {
                const game = await createGame();
                const invitation = await createInvitation(game);
                const token = invitation.token;
                const origin = window.location.origin;
                setInviteLink(`${origin}/join/${token}`);
                setCurrentGameId(game.id);
                try {
                  socket.emit('joinGame', { gameId: game.id, role: 'host' });
                } catch (e) {
                  console.warn('socket join failed', e);
                }
                setCopied(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full cursor-pointer">+ Nouvelle partie</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvelle partie</DialogTitle>
                <DialogDescription>
                  Partage ce lien d'invitation avec ton coéquipier pour qu'il rejoigne la partie.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="invite" className="sr-only">Invitation</Label>
                  <Input id="invite" value={inviteLink} readOnly />
                </div>
                <div className="flex-shrink-0">
                  <Button
                    type="button"
                    className="cursor-pointer"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(inviteLink || '');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch (e) {
                        console.error('Copy failed', e);
                      }
                    }}
                  >
                    {copied ? 'Copié !' : 'Copier'}
                  </Button>
                </div>
              </div>
              {guestJoined ? (
                <p className="text-sm text-primary">{guestJoined.username} a rejoint la partie</p>
              ) : (
                <p className="text-sm text-muted-foreground">En attente d'un joueur...</p>
              )}
              <DialogFooter className="sm:justify-start mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="secondary" className="cursor-pointer">Fermer</Button>
                </DialogClose>
                {guestJoined ? (
                  <Button 
                    type="button" 
                    className="cursor-pointer"
                    onClick={() => {
                      if (!currentGameId) return;
                      socket.emit('startGame', { gameId: currentGameId });
                    }}
                  >Lancer la partie</Button> 
                  ) : ( <span></span> )
                }
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    </section>
  )
}


