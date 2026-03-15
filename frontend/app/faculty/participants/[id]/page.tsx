'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { getHackathonParticipants, getHackathon, setAuthToken, exportParticipants } from '../../../../lib/api';

export default function FacultyParticipantsPage() {
    const { id } = useParams<{ id: string }>();
    const { getToken } = useAuth();
    const router = useRouter();
    const [participants, setParticipants] = useState<any[]>([]);
    const [hack, setHack] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const token = await getToken();
            setAuthToken(token);
            const [p, h] = await Promise.all([getHackathonParticipants(Number(id)), getHackathon(Number(id))]);
            setParticipants(p);
            setHack(h);
            setLoading(false);
        }
        load();
    }, [id, getToken]);

    const fmt = (d: string) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="container">
                    <button className="btn btn-outline btn-sm" onClick={() => router.back()} style={{ marginBottom: 24 }}>← Back</button>
                    <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                            <h1>👥 Participants</h1>
                            <p>{hack?.title}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => exportParticipants(Number(id))} disabled={participants.length === 0}>
                                📥 Export to CSV
                            </button>
                            <div className="badge badge-purple" style={{ fontSize: 14, padding: '8px 16px' }}>{participants.length} teams enrolled</div>
                        </div>
                    </div>

                    {loading ? <div className="spinner" /> : participants.length === 0 ? (
                        <div className="empty-state"><div className="icon">👥</div><h3>No teams enrolled yet</h3></div>
                    ) : (
                        <div className="card" style={{ overflow: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Team Name</th>
                                        <th>Mode</th>
                                        <th>Leader</th>
                                        <th>Members</th>
                                        <th>Enrolled On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((p, i) => (
                                        <tr key={p.id}>
                                            <td style={{ color: 'var(--gray-400)', fontWeight: 600 }}>{i + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{p.team_name}</td>
                                            <td><span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{p.mode}</span></td>
                                            <td>
                                                <p style={{ fontWeight: 600, fontSize: 13 }}>{p.leader_name}</p>
                                                <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{p.leader_email}</p>
                                            </td>
                                            <td style={{ fontSize: 13, color: 'var(--gray-600)', maxWidth: 200 }}>{p.members}</td>
                                            <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{fmt(p.submitted_at)}</td>
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
