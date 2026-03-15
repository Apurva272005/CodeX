'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Navbar from '../../../components/Navbar';
import { getMyEnrollments, setAuthToken } from '../../../lib/api';

export default function MyEnrollmentsPage() {
    const { getToken } = useAuth();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const token = await getToken();
            setAuthToken(token);
            const data = await getMyEnrollments();
            setEnrollments(data);
            setLoading(false);
        }
        load();
    }, [getToken]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="container">
                    <div className="page-header">
                        <h1>📋 My Enrollments</h1>
                        <p>Track all hackathons you've registered for</p>
                    </div>

                    {loading ? <div className="spinner" /> : enrollments.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">📋</div>
                            <h3>No enrollments yet</h3>
                            <p>Explore hackathons and enroll to see them here</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {enrollments.map(e => (
                                <div key={e.id} className="card card-body">
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                                <span className={`badge status-${e.status}`} style={{ textTransform: 'capitalize' }}>{e.status}</span>
                                                <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>👥 {e.mode}</span>
                                            </div>
                                            <h3 style={{ fontSize: 17, marginBottom: 4 }}>{e.title}</h3>
                                            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>Team: <strong>{e.team_name}</strong> · Enrolled on {fmt(e.submitted_at)}</p>
                                            <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Team Lineup</p>
                                                <p style={{ fontSize: 13, color: 'var(--gray-700)' }}>
                                                    👤 <strong>{e.leader_name}</strong> (Leader)
                                                    {e.members.split(', ').filter((m: string) => m !== e.leader_name).length > 0 && (
                                                        <> · {e.members.split(', ').filter((m: string) => m !== e.leader_name).join(' · ')}</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', textAlign: 'right', fontSize: 13 }}>
                                            <div>
                                                <p style={{ color: 'var(--gray-400)', fontSize: 11, marginBottom: 2 }}>Starts</p>
                                                <p style={{ fontWeight: 600 }}>{fmt(e.start_date)}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: 'var(--gray-400)', fontSize: 11, marginBottom: 2 }}>Ends</p>
                                                <p style={{ fontWeight: 600 }}>{fmt(e.end_date)}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: 'var(--gray-400)', fontSize: 11, marginBottom: 2 }}>Venue</p>
                                                <p style={{ fontWeight: 600 }}>{e.venue}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: 'var(--gray-400)', fontSize: 11, marginBottom: 2 }}>Prize</p>
                                                <p style={{ fontWeight: 600 }}>{e.prize_pool}</p>
                                            </div>
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
