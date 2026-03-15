'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { getAdminStats, getPendingHackathons, approveHackathon, rejectHackathon, setAuthToken } from '../../lib/api';

export default function AdminDashboard() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<number | null>(null);

    async function load() {
        const token = await getToken();
        setAuthToken(token);
        const [s, p] = await Promise.all([getAdminStats(), getPendingHackathons()]);
        setStats(s);
        setPending(p);
        setLoading(false);
    }

    useEffect(() => { load(); }, [getToken]);

    async function handleApprove(id: number) {
        setActing(id);
        try { await approveHackathon(id); await load(); } catch { }
        setActing(null);
    }

    async function handleReject(id: number) {
        if (!confirm('Reject and remove this hackathon?')) return;
        setActing(id);
        try { await rejectHackathon(id); await load(); } catch { }
        setActing(null);
    }

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="container">
                    <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div><h1>⚡ Admin Dashboard</h1><p>Platform overview and hackathon approvals</p></div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Link href="/admin/hackathons" className="btn btn-secondary btn-sm">Manage Hackathons</Link>
                            <Link href="/admin/users" className="btn btn-secondary btn-sm">Manage Users</Link>
                        </div>
                    </div>

                    {loading ? <div className="spinner" /> : (
                        <>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16, marginBottom: 36 }}>
                                {[
                                    { icon: '👥', label: 'Total Users', val: stats?.users?.total_users || 0 },
                                    { icon: '🎓', label: 'Students', val: stats?.users?.students || 0 },
                                    { icon: '👩‍🏫', label: 'Faculty', val: stats?.users?.faculty || 0 },
                                    { icon: '🚀', label: 'Hackathons', val: stats?.hackathons?.total || 0 },
                                    { icon: '✅', label: 'Approved', val: stats?.hackathons?.approved || 0 },
                                    { icon: '⏳', label: 'Pending', val: stats?.hackathons?.pending || 0 },
                                    { icon: '📋', label: 'Enrollments', val: stats?.enrollments?.total_enrollments || 0 },
                                    { icon: '🔥', label: 'Active Now', val: stats?.hackathons?.active || 0 },
                                ].map(s => (
                                    <div key={s.label} className="stat-card">
                                        <div className="stat-icon">{s.icon}</div>
                                        <div className="stat-value">{s.val}</div>
                                        <div className="stat-label">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Pending approvals */}
                            <h2 className="section-title">⏳ Pending Approvals ({pending.length})</h2>
                            {pending.length === 0 ? (
                                <div className="alert alert-success" style={{ maxWidth: 500 }}>🎉 No pending hackathons — all caught up!</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {pending.map(h => (
                                        <div key={h.id} className="card card-body">
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                                                        <span className="badge badge-yellow">⏳ Pending</span>
                                                        <span className={`badge badge-${h.type === 'government' ? 'blue' : h.type === 'private' ? 'purple' : 'green'}`} style={{ textTransform: 'capitalize' }}>{h.type}</span>
                                                    </div>
                                                    <h3 style={{ fontSize: 16, marginBottom: 4 }}>{h.title}</h3>
                                                    <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                                                        By {h.creator_name} · {h.field} · Prize: {h.prize_pool} · Deadline: {fmt(h.enroll_deadline)}
                                                    </p>
                                                    <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, lineHeight: 1.5 }}>
                                                        {h.description?.slice(0, 140)}{h.description?.length > 140 ? '…' : ''}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(h.id)} disabled={acting === h.id}>
                                                        {acting === h.id ? '…' : '✓ Approve'}
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(h.id)} disabled={acting === h.id}>Reject</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
