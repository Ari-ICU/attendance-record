'use client';

import { useEffect, useState } from 'react';

interface Star {
    id: number;
    top: string;
    left: string;
    size: number;
    duration: string;
    delay: string;
}

export default function Stars() {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        const starCount = 150;
        const newStars: Star[] = [];
        for (let i = 0; i < starCount; i++) {
            newStars.push({
                id: i,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                size: Math.floor(Math.random() * 3) + 1,
                duration: `${Math.random() * 3 + 2}s`,
                delay: `${Math.random() * 5}s`,
            });
        }
        setStars(newStars);
    }, []);

    return (
        <div className="stars-container">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className={`star star-${star.size}`}
                    style={{
                        top: star.top,
                        left: star.left,
                        animationDelay: star.delay,
                    }}
                />
            ))}
        </div>
    );
}
