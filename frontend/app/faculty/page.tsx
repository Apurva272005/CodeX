'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { getMyHackathons, deleteHackathon, setAuthToken } from '../../lib/api';
import CountdownTimer from '../../components/CountdownTimer';

export default function FacultyPage() {
    const { getToken } = useAuth();
    const [hackathons, setHackathons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);

    async function load() {
        const token = await getToken();
        setAuthToken(token);
        const data = await getMyHackathons();
        setHackathons(data);
        setLoading(false);
    }

    useEffect(() => { load(); }, [getToken]);

    async function handleDelete(id: number) {
        if (!confirm('Delete this hackathon? This cannot be undone.')) return;
        setDeleting(id);
        try {
            await deleteHackathon(id);
            setHackathons(prev => prev.filter(h => h.id !== id));
        } catch (e: any) { alert(e.response?.data?.error || 'Delete failed'); }
        setDeleting(null);
    }

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="container">
                    <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <h1>👩‍🏫 My Hackathons</h1>
                            <p>Create and manage your hackathon events</p>
                        </div>
                        <Link href="/faculty/create" className="btn btn-primary">+ Create Hackathon</Link>
                    </div>

                    {loading ? <div className="spinner" /> : hackathons.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">🎯</div>
                            <h3>No hackathons yet</h3>
                            <p>Create your first hackathon to get started</p>
                            <Link href="/faculty/create" className="btn btn-primary" style={{ margin: '16px auto 0', display: 'inline-flex' }}>Create Hackathon</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {hackathons.map(h => (
                                <div key={h.id} className="card card-body">
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16, justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span className={`badge status-${h.status}`} style={{ textTransform: 'capitalize' }}>{h.status}</span>
                                                {h.approved ? <span className="badge badge-green">✓ Approved</span> : <span className="badge badge-yellow">⏳ Pending Approval</span>}
                                                <CountdownTimer deadline={h.enroll_deadline} />
                                            </div>
                                            <h3 style={{ fontSize: 17, marginBottom: 4 }}>{h.title}</h3>
                                            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                                                {h.field} · {h.prize_pool} · Deadline: <strong>{fmt(h.enroll_deadline)}</strong>
                                            </p>
                                            <p style={{ fontSize: 13, color: 'var(--brand-primary)', fontWeight: 600, marginTop: 6 }}>
                                                👥 {h.total_enrollments} team{h.total_enrollments !== 1 ? 's' : ''} enrolled
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <Link href={`/faculty/participants/${h.id}`} className="btn btn-secondary btn-sm">View Teams</Link>
                                            <Link href={`/faculty/edit/${h.id}`} className="btn btn-outline btn-sm">Edit</Link>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.id)} disabled={deleting === h.id}>
                                                {deleting === h.id ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
