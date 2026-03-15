'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { getMyProfile, setAuthToken } from '../../lib/api';

export default function DashboardRedirect() {
    const { isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        async function redirect() {
            if (!isLoaded || !user) return;
            try {
                const token = await getToken();
                setAuthToken(token);
                const profile = await getMyProfile();
                if (profile.role === 'student') router.replace('/student');
                else if (profile.role === 'faculty') router.replace('/faculty');
                else if (profile.role === 'admin') router.replace('/admin');
                else router.replace('/complete-profile');
            } catch {
                router.replace('/complete-profile');
            }
        }
        redirect();
    }, [isLoaded, user, router, getToken]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--gray-500)', marginTop: 16 }}>Loading your dashboard…</p>
        </div>
    );
}
