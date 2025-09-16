// components/ProtectedRoute.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login'); // redirect to login if not authenticated
        }
    }, [user, loading, router]);

    if (!user) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
}
