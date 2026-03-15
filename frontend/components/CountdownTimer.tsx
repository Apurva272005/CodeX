'use client';
import { useEffect, useState } from 'react';

export default function CountdownTimer({ deadline }: { deadline: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [urgency, setUrgency] = useState('');

    useEffect(() => {
        function calc() {
            const diff = new Date(deadline).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft('Deadline passed');
                setUrgency('closed');
                return;
            }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            if (d > 3) setUrgency('safe');
            else if (diff < 86400000) setUrgency('urgent');
            else setUrgency('');
            setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
        }
        calc();
        const t = setInterval(calc, 60000);
        return () => clearInterval(t);
    }, [deadline]);

    return (
        <span className={`countdown ${urgency}`}>
            ⏱ {timeLeft}
        </span>
    );
}
