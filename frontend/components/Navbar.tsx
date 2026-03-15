'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { getMyProfile, setAuthToken } from '../lib/api';
import { useAuth } from '@clerk/nextjs';

export default function Navbar() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        async function loadRole() {
            try {
                const token = await getToken();
                setAuthToken(token);
                const profile = await getMyProfile();
                setRole(profile.role);
            } catch { }
        }
        if (user) loadRole();
    }, [user, getToken]);

    const navLinks: Record<string, { href: string; label: string }[]> = {
        student: [
            { href: '/student', label: 'Hackathons' },
            { href: '/student/my-enrollments', label: 'My Enrollments' },
        ],
        faculty: [
            { href: '/faculty', label: 'My Hackathons' },
            { href: '/faculty/create', label: 'Create Hackathon' },
        ],
        admin: [
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/hackathons', label: 'Hackathons' },
            { href: '/admin/users', label: 'Users' },
        ],
    };

    const links = role ? (navLinks[role] || []) : [];

    return (
        <nav style={{
            background: '#fff',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '64px',
            }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800,
                        fontFamily: 'var(--font-display)',
                        fontSize: 16, letterSpacing: '-0.5px',
                    }}>CX</div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--gray-900)' }}>
                        Code<span style={{ color: 'var(--brand-primary)' }}>X</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {links.map(l => (
                        <Link key={l.href} href={l.href} style={{
                            padding: '7px 14px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 14, fontWeight: 600,
                            color: pathname === l.href ? 'var(--brand-primary)' : 'var(--gray-600)',
                            background: pathname === l.href ? 'var(--brand-primary-light)' : 'transparent',
                            transition: 'all 0.15s',
                        }}>{l.label}</Link>
                    ))}
                </div>

                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {role && (
                        <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
                            {role}
                        </span>
                    )}
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </nav>
    );
}
