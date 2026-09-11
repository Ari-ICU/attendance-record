'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/calendar');
    }, [router]);

    return null;
}
