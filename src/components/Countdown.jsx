import { useState, useEffect } from 'react'

export default function Countdown() {
  const [time, setTime] = useState(600);

  useEffect(() => {
    let timer = setInterval(() => {
      setTime((time) => {
        if (time === 0) {
          clearInterval(timer);
          return 0;
        } else return time - 1;
      });
    }, 1000)
    return () => clearInterval(timer);
    }, [])

  return (
    <>
      {time !== 0 ? 
        <p>{`${Math.floor(time / 60)}`.padStart(2, 0)}:{`${time % 60}`.padStart(2, 0)}</p> : 
        <p>Temps écoulé.</p>
      }
    </>
  )

};

