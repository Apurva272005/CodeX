'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Navbar from '../../../components/Navbar';
import Link from 'next/link';
import CountdownTimer from '../../../components/CountdownTimer';
import { getAllHackathons, deleteHackathon, approveHackathon, setAuthToken } from '../../../lib/api';

export default function AdminHackathonsPage() {
    const { getToken } = useAuth();
    const [hackathons, setHackathons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [acting, setActing] = useState<number | null>(null);

    async function load() {
        const token = await getToken();
        setAuthToken(token);
        const data = await getAllHackathons();
        setHackathons(data);
        setLoading(false);
    }

    useEffect(() => { load(); }, [getToken]);

    async function handleDelete(id: number) {
        if (!confirm('Delete this hackathon permanently?')) return;
        setActing(id);
        try {
            await deleteHackathon(id);
            setHackathons(prev => prev.filter(h => h.id !== id));
        } catch (e: any) { alert(e.response?.data?.error || 'Delete failed'); }
        setActing(null);
    }

    async function handleApprove(id: number) {
        setActing(id);
        try { await approveHackathon(id); await load(); } catch { }
        setActing(null);
    }

    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [approvalFilter, setApprovalFilter] = useState('all');

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const filtered = hackathons.filter(h => {
        const matchesSearch = h.title.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || h.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
        const matchesApproval = approvalFilter === 'all' || (approvalFilter === 'approved' ? h.approved : !h.approved);
        return matchesSearch && matchesType && matchesStatus && matchesApproval;
    });

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="container">
                    <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div><h1>🚀 All Hackathons</h1><p>Full platform hackathon management</p></div>
                        <Link href="/faculty/create" className="btn btn-primary">+ Create Hackathon</Link>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                        <input className="form-input" style={{ maxWidth: 220 }} placeholder="🔍 Search…" value={search} onChange={e => setSearch(e.target.value)} />

                        <select className="form-select" style={{ maxWidth: 140 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="all">Any Type</option>
                            <option value="government">Government</option>
                            <option value="private">Private</option>
                            <option value="internal">Internal</option>
                        </select>

                        <select className="form-select" style={{ maxWidth: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="all">Any Status</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select className="form-select" style={{ maxWidth: 140 }} value={approvalFilter} onChange={e => setApprovalFilter(e.target.value)}>
                            <option value="all">Any Approval</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                        </select>

                        <span style={{ fontSize: 13, color: 'var(--gray-500)', marginLeft: 'auto' }}>{filtered.length} hackathon{filtered.length !== 1 ? 's' : ''}</span>
                    </div>

                    {loading ? <div className="spinner" /> : (
                        <div className="card" style={{ overflow: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Creator</th>
                                        <th>Deadline</th>
                                        <th>Status</th>
                                        <th>Approval</th>
                                        <th>Countdown</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(h => (
                                        <tr key={h.id}>
                                            <td style={{ fontWeight: 600, maxWidth: 200 }}>
                                                <div>{h.title}</div>
                                                <Link href={`/faculty/participants/${h.id}`} style={{ fontSize: 11, color: 'var(--brand-primary)', textDecoration: 'underline' }}>View Teams →</Link>
                                            </td>
                                            <td><span className={`badge badge-${h.type === 'government' ? 'blue' : h.type === 'private' ? 'purple' : 'green'}`} style={{ textTransform: 'capitalize' }}>{h.type}</span></td>
                                            <td style={{ fontSize: 13 }}>{h.creator_name}</td>
                                            <td style={{ fontSize: 13 }}>{fmt(h.enroll_deadline)}</td>
                                            <td><span className={`badge status-${h.status}`} style={{ textTransform: 'capitalize' }}>{h.status}</span></td>
                                            <td>
                                                {h.approved ? <span className="badge badge-green">✓ Live</span> : <span className="badge badge-yellow">Pending</span>}
                                            </td>
                                            <td><CountdownTimer deadline={h.enroll_deadline} /></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    {!h.approved && (
                                                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(h.id)} disabled={acting === h.id}>Approve</button>
                                                    )}
                                                    <Link href={`/faculty/edit/${h.id}`} className="btn btn-outline btn-sm">Edit</Link>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.id)} disabled={acting === h.id}>
                                                        {acting === h.id ? '…' : 'Del'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
