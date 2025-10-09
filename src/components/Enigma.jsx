
import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from './ui/button';
import Input from './ui/input';
import Label from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';

function HintPenaltyDialog({ open, onOpenChange, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Confirmer l'indice</DialogTitle>
        <DialogDescription>
          Prendre un indice vous fera perdre 200 secondes. Voulez-vous continuer ?
        </DialogDescription>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="primary" disabled={loading} onClick={onConfirm}>Confirmer</Button>
        </DialogFooter>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}

function AnswerConfirmDialog({ open, onOpenChange, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Confirmer la réponse</DialogTitle>
        <DialogDescription>
          Vous êtes sur le point de valider votre réponse. Confirmez-vous ?<br />
          Si la réponse est incorrecte, vous perdrez 200 secondes.
        </DialogDescription>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="primary" disabled={loading} onClick={onConfirm}>Confirmer</Button>
        </DialogFooter>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}

function AnswerResultDialog({ result, onClose }) {
  return (
    <Dialog open={Boolean(result)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogTitle>{result?.success ? 'Bravo' : 'Raté'}</DialogTitle>
        <DialogDescription>
          {result?.message}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onClose}>OK</Button>
        </DialogFooter>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}

export default function Enigma() {
  const [question, setQuestion] = useState(null);
  const [revealedHint, setRevealedHint] = useState(false);
  const [answer, setAnswer] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [answerConfirmOpen, setAnswerConfirmOpen] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [answerApplyLoading, setAnswerApplyLoading] = useState(false);
  const [showDigit, setShowDigit] = useState(false);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [enigmasToSolve, setEnigmasToSolve] = useState([]);
  // Déterminer les IDs d'énigmes à résoudre selon le rôle (même logique que Sidebar)
  useEffect(() => {
    const role = localStorage.getItem('role') || 'guest';
    setEnigmasToSolve(role === 'owner' ? [2, 4, 6, 8] : [1, 3, 5, 7]);
  }, []);
  const [applyLoading, setApplyLoading] = useState(false);

  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const question_id = search.get('enigma');
  const { id: gameIdFromParams } = useParams();

  useEffect(() => {
    if (!question_id) return;
    const getQuestion = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${question_id}`);
      const data = await res.json();
      if (res.ok) {
        setQuestion(data);
      } else {
        setQuestion(null);
      }
    };
    getQuestion();
    setRevealedHint(false);
    setAnswer('');
    setAnswerResult(null);
    setConfirmOpen(false);
    setAnswerConfirmOpen(false);
    // Affiche le digit si cette énigme a déjà été résolue (persistée)
    try {
      const raw = localStorage.getItem('solvedEnigmas');
      const arr = raw ? JSON.parse(raw) : [];
      const qid = Number(question_id);
      setShowDigit(arr.includes(qid));
    } catch {
      setShowDigit(false);
    }
  }, [question_id]);

  const onChange = (e) => setAnswer(e.target.value);

  const validation = (e) => {
    e.preventDefault();
    setAnswerConfirmOpen(true);
  };

  const applyPenalty = async (gid) => {
    if (!gid) return;
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${gid}`);
      const data = await resp.json();
      const current = Number(data.time_left || 0);
      const newTime = Math.max(0, current - 200);
      const patchResp = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${gid}/time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_left: newTime }),
      });
      return patchResp.ok;
    } catch (err) {
      console.error('Erreur lors de l\'application de la pénalité :', err);
      return false;
    }
  };

  const handleHintConfirm = async () => {
    setApplyLoading(true);
    try {
      let gid = gameIdFromParams;
      if (!gid) {
        gid = search.get('id') || search.get('game') || search.get('gameId');
      }
      let penaltyApplied = true;
      if (gid) {
        penaltyApplied = await applyPenalty(gid);
      }
      if (penaltyApplied) {
        setRevealedHint(true);
      }
    } finally {
      setApplyLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleAnswerConfirm = async () => {
    setAnswerApplyLoading(true);
    try {
      const expected = question?.answer;
      const user = (answer || '').trim();
      let isCorrect = false;
      if (expected != null) {
        if (typeof expected === 'string') {
          isCorrect = expected.trim().toLowerCase() === user.trim().toLowerCase();
        } else if (typeof expected === 'object') {
          const u = user.trim().toLowerCase();
          const keys = Object.keys(expected || {});
          if (keys.map(k => k.trim().toLowerCase()).includes(u)) isCorrect = true;
          else isCorrect = Object.values(expected).some(v => String(v).trim().toLowerCase() === u);
        }
      }

      if (isCorrect) {
        try {
          const raw = localStorage.getItem('solvedEnigmas');
          const arr = raw ? JSON.parse(raw) : [];
          const qid = Number(question_id);
          if (!arr.includes(qid)) {
            arr.push(qid);
            localStorage.setItem('solvedEnigmas', JSON.stringify(arr));
          }
          setShowDigit(true);
          const allSolved = enigmasToSolve.every(eid => arr.includes(eid));
          setVictoryOpen(allSolved);
        } catch {
          setShowDigit(false);
          setVictoryOpen(false);
        }
        setAnswerResult({ success: true, message: `Bravo — vous avez trouvé la bonne réponse !${question.digit ? `\nLe chiffre à noter : ${question.digit}` : ''}` });
      } else {
        let gid = gameIdFromParams;
        if (!gid) {
          gid = search.get('id') || search.get('game') || search.get('gameId');
        }
        if (gid) {
          await applyPenalty(gid);
        } else {
          console.warn("Impossible de déterminer l'id de la partie pour appliquer la pénalité.");
        }
        setAnswerResult({ success: false, message: "Mauvaise réponse — vous perdez 200 secondes." });
      }
    } catch (err) {
      console.error('Erreur lors de la validation de la réponse', err);
      setAnswerResult({ success: false, message: 'Erreur lors de la validation de la réponse.' });
    } finally {
      setAnswerApplyLoading(false);
      setAnswerConfirmOpen(false);
    }
  };

  if (!question_id) return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Aucune énigme sélectionnée</h2>
      <p className="text-sm text-gray-500 mt-2">Sélectionnez une énigme dans la barre latérale pour l'afficher ici.</p>
    </div>
  );

  if (!question) return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Énigme introuvable</h2>
    </div>
  );

  return (
    <article className="p-6">
      <h2 className="text-2xl font-bold">{question.title}</h2>
      <div className="mt-4 text-gray-700 whitespace-pre-wrap">{question.enigma}</div>
      {showDigit && question.digit && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-green-800 text-lg font-semibold">
          Le chiffre à noter : {question.digit}
        </div>
      )}
      {/* Dialog de victoire globale */}
      <Dialog open={victoryOpen} onOpenChange={setVictoryOpen}>
        <DialogContent>
          <DialogTitle>Victoire !</DialogTitle>
          <DialogDescription>
            <div className="mb-2 font-semibold text-green-700">Félicitations, vous avez résolu toutes les énigmes de votre série !</div>
            <div className="mt-2">Assemblez tous les chiffres obtenus pour former le code final.</div>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setVictoryOpen(false)}>Fermer</Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>
      {question.hint ? (
        <div className="mt-5">
          <Button disabled={revealedHint} onClick={() => setConfirmOpen(true)} className="cursor-pointer">Montrer un indice (-200s)</Button>
          <HintPenaltyDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={handleHintConfirm}
            loading={applyLoading}
          />
          <AnswerConfirmDialog
            open={answerConfirmOpen}
            onOpenChange={setAnswerConfirmOpen}
            onConfirm={handleAnswerConfirm}
            loading={answerApplyLoading}
          />
          <AnswerResultDialog
            result={answerResult}
            onClose={() => setAnswerResult(null)}
          />
          {revealedHint ? <p className="mt-4 text-sm text-gray-500">Indice : {question.hint}</p> : null}
        </div>
      ) : null}
      <form onSubmit={validation} className='mt-5 space-y-2'>
        <Label htmlFor="answer">Réponse</Label>
        <Input
          type="text"
          placeholder="Votre réponse ici..."
          id="answer"
          name="answer"
          value={answer}
          onChange={onChange}
        />
        <Button variant="primary" className="cursor-pointer" type="submit">Valider la réponse</Button>
      </form>
    </article>
  );
}

// import React, { useState } from 'react';
// import { useLocation, useParams } from 'react-router-dom';
// import enigmaData from '../data/enigma.json';
// import Button from './ui/button';
// import Input  from './ui/input';
// import Label  from './ui/label';
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogClose,
// } from './ui/dialog';

// function HintPenaltyDialog({ open, onOpenChange, onConfirm, loading }) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogTitle>Confirmer l'indice</DialogTitle>
//         <DialogDescription>
//           Prendre un indice vous fera perdre 200 secondes. Voulez-vous continuer ?
//         </DialogDescription>
//         <DialogFooter>
//           <Button variant="secondary" onClick={() => onOpenChange(false)}>Annuler</Button>
//           <Button variant="primary" disabled={loading} onClick={onConfirm}>Confirmer</Button>
//         </DialogFooter>
//         <DialogClose />
//       </DialogContent>
//     </Dialog>
//   );
// }

// function AnswerConfirmDialog({ open, onOpenChange, onConfirm, loading }) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogTitle>Confirmer la réponse</DialogTitle>
//         <DialogDescription>
//           Vous êtes sur le point de valider votre réponse. Confirmez-vous ?<br />
//           Si la réponse est incorrecte, vous perdrez 200 secondes.
//         </DialogDescription>
//         <DialogFooter>
//           <Button variant="secondary" onClick={() => onOpenChange(false)}>Annuler</Button>
//           <Button variant="primary" disabled={loading} onClick={onConfirm}>Confirmer</Button>
//         </DialogFooter>
//         <DialogClose />
//       </DialogContent>
//     </Dialog>
//   );
// }

// function AnswerResultDialog({ result, onClose }) {
//   return (
//     <Dialog open={Boolean(result)} onOpenChange={(open) => { if (!open) onClose(); }}>
//       <DialogContent>
//         <DialogTitle>{result?.success ? 'Bravo' : 'Raté'}</DialogTitle>
//         <DialogDescription>
//           {result?.message}
//         </DialogDescription>
//         <DialogFooter>
//           <Button onClick={onClose}>OK</Button>
//         </DialogFooter>
//         <DialogClose />
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default function Enigma() {
//   const [revealedHints, setRevealedHints] = useState({});
//   const [answer, setAnswer] = useState('');
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [answerConfirmOpen, setAnswerConfirmOpen] = useState(false);
//   const [answerResult, setAnswerResult] = useState(null);
//   const [answerApplyLoading, setAnswerApplyLoading] = useState(false);
//   const [applyLoading, setApplyLoading] = useState(false);

//   const location = useLocation();
//   const search = new URLSearchParams(location.search);
//   const id = search.get('enigma');
//   const { id: gameIdFromParams } = useParams();

//   React.useEffect(() => {
//     setConfirmOpen(false);
//   }, [id]);

//   const revealed = Boolean(revealedHints[String(id)]);

//   const onChange = (e) => {
//     setAnswer(e.target.value);
//   };

//   const validation = (e) => {
//     e.preventDefault();
//     setAnswerConfirmOpen(true);
//   };

//   const applyPenalty = async (gid) => {
//     if (!gid) return;
//     try {
//       const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${gid}`);
//       const data = await resp.json();
//       const current = Number(data.time_left || 0);
//       const newTime = Math.max(0, current - 200);
//       const patchResp = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${gid}/time`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ time_left: newTime }),
//       });
//       return patchResp.ok;
//     } catch (err) {
//       console.error('Erreur lors de l\'application de la pénalité :', err);
//       return false;
//     }
//   };

//   if (!id) return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold">Aucune énigme sélectionnée</h2>
//       <p className="text-sm text-gray-500 mt-2">Sélectionnez une énigme dans la barre latérale pour l'afficher ici.</p>
//     </div>
//   );

//   const item = enigmaData[String(id)];
//   if (!item) return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold">Énigme introuvable</h2>
//     </div>
//   );

//   const handleHintConfirm = async () => {
//     setApplyLoading(true);
//     try {
//       let gid = gameIdFromParams;
//       if (!gid) {
//         gid = search.get('id') || search.get('game') || search.get('gameId');
//       }
//       let penaltyApplied = true;
//       if (gid) {
//         penaltyApplied = await applyPenalty(gid);
//       }
//       if (penaltyApplied) {
//         setRevealedHints(prev => ({ ...prev, [String(id)]: true }));
//       }
//     } finally {
//       setApplyLoading(false);
//       setConfirmOpen(false);
//     }
//   };

//   const handleAnswerConfirm = async () => {
//     setAnswerApplyLoading(true);
//     try {
//       const expected = enigmaData[String(id)]?.answer;
//       const user = (answer || '').trim();
//       const isCorrect = (() => {
//         if (expected == null) return false;
//         if (typeof expected === 'string') {
//           return expected.trim().toLowerCase() === user.toLowerCase();
//         }
//         if (typeof expected === 'object') {
//           const u = user.trim();
//           const keys = Object.keys(expected || {});
//           if (keys.includes(u.toUpperCase())) return true;
//           return Object.values(expected).some(v => String(v).trim().toLowerCase() === u.toLowerCase());
//         }
//         return false;
//       })();

//       if (isCorrect) {
//         try {
//           const raw = localStorage.getItem('solvedEnigmas');
//           const arr = raw ? JSON.parse(raw) : [];
//           const nid = Number(id);
//           if (!arr.includes(nid)) {
//             arr.push(nid);
//             localStorage.setItem('solvedEnigmas', JSON.stringify(arr));
//           }
//         } catch (e) {
//           console.warn('Impossible de marquer résolu dans localStorage', e);
//         }
//         setAnswerResult({ success: true, message: 'Bravo — vous avez trouvé la bonne réponse !' });
//       } else {
//         let gid = gameIdFromParams;
//         if (!gid) {
//           gid = search.get('id') || search.get('game') || search.get('gameId');
//         }
//         if (gid) {
//           await applyPenalty(gid);
//         } else {
//           console.warn("Impossible de déterminer l'id de la partie pour appliquer la pénalité.");
//         }
//         setAnswerResult({ success: false, message: "Mauvaise réponse — vous perdez 200 secondes." });
//       }
//     } catch (err) {
//       console.error('Erreur lors de la validation de la réponse', err);
//       setAnswerResult({ success: false, message: 'Erreur lors de la validation de la réponse.' });
//     } finally {
//       setAnswerApplyLoading(false);
//       setAnswerConfirmOpen(false);
//     }
//   };

//   return (
//     <article className="p-6">
//       <h2 className="text-2xl font-bold">{item.title}</h2>
//       <div className="mt-4 text-gray-700 whitespace-pre-wrap">{item.enigma}</div>
//       {item.hint ? (
//         <div className="mt-5">
//           <Button disabled={revealed} onClick={() => setConfirmOpen(true)} className="cursor-pointer">Montrer un indice (-200s)</Button>
//           <HintPenaltyDialog
//             open={confirmOpen}
//             onOpenChange={setConfirmOpen}
//             onConfirm={handleHintConfirm}
//             loading={applyLoading}
//           />
//           <AnswerConfirmDialog
//             open={answerConfirmOpen}
//             onOpenChange={setAnswerConfirmOpen}
//             onConfirm={handleAnswerConfirm}
//             loading={answerApplyLoading}
//           />
//           <AnswerResultDialog
//             result={answerResult}
//             onClose={() => setAnswerResult(null)}
//           />
//           {revealed ? <p className="mt-4 text-sm text-gray-500">Indice : {item.hint}</p> : null}
//         </div>
//       ) : null}
//       <form onSubmit={validation} className='mt-5 space-y-2'>
//         <Label htmlFor="answer">Réponse</Label>
//         <Input
//           type="text"
//           placeholder="Votre réponse ici..."
//           id="answer"
//           name="answer"
//           onChange={onChange}
//         />
//         <Button variant="primary" className="cursor-pointer" type="submit">Valider la réponse</Button>
//       </form>
//     </article>
//   );
// }
