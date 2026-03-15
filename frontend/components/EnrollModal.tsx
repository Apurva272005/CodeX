'use client';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { enroll, setAuthToken } from '../lib/api';

interface Props {
    hackathonId: number;
    hackathonTitle: string;
    minTeam: number;
    maxTeam: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EnrollModal({ hackathonId, hackathonTitle, minTeam, maxTeam, onClose, onSuccess }: Props) {
    const { getToken } = useAuth();
    const [mode, setMode] = useState<'solo' | 'duo' | 'group'>('solo');
    const [teamName, setTeamName] = useState('');
    const [memberEmails, setMemberEmails] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const modeConfig = { solo: 0, duo: 1, group: Math.max(2, minTeam - 1) };

    function handleModeChange(m: 'solo' | 'duo' | 'group') {
        setMode(m);
        if (m === 'solo') setMemberEmails([]);
        else if (m === 'duo') setMemberEmails(['']);
        else setMemberEmails(['', '']);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!teamName.trim()) return setError('Team name is required');
        setLoading(true);
        try {
            const token = await getToken();
            setAuthToken(token);
            await enroll({
                hackathon_id: hackathonId,
                team_name: teamName.trim(),
                mode,
                member_emails: memberEmails.filter(Boolean),
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Enrollment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal">
                <div className="modal-header">
                    <h2>Enroll in Hackathon</h2>
                    <button className="btn btn-icon btn-outline" onClick={onClose} style={{ fontSize: 18, lineHeight: 1 }}>✕</button>
                </div>
                <div className="modal-body">
                    <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
                        {hackathonTitle}
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Mode selector */}
                        <div className="form-group">
                            <label className="form-label">Participation Mode</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {(['solo', 'duo', 'group'] as const).map(m => (
                                    <button key={m} type="button"
                                        className={`btn ${mode === m ? 'btn-primary' : 'btn-outline'} btn-sm`}
                                        onClick={() => handleModeChange(m)}
                                        style={{ textTransform: 'capitalize' }}>
                                        {m === 'solo' ? '👤 Solo' : m === 'duo' ? '👥 Duo' : `👨‍👩‍👧 Group (3–${maxTeam})`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Team name */}
                        <div className="form-group">
                            <label className="form-label">Team Name</label>
                            <input className="form-input" value={teamName} onChange={e => setTeamName(e.target.value)}
                                placeholder="Enter your team name" required />
                        </div>

                        {/* Member emails */}
                        {mode !== 'solo' && (
                            <div className="form-group">
                                <label className="form-label">Teammate Emails</label>
                                {memberEmails.map((email, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                        <input className="form-input" type="email" value={email}
                                            onChange={e => {
                                                const arr = [...memberEmails];
                                                arr[i] = e.target.value;
                                                setMemberEmails(arr);
                                            }}
                                            placeholder={`Teammate ${i + 1} email`} required />
                                        {mode === 'group' && memberEmails.length < maxTeam - 1 && i === memberEmails.length - 1 && (
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMemberEmails([...memberEmails, ''])}>+</button>
                                        )}
                                        {mode === 'group' && memberEmails.length > 2 && (
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => setMemberEmails(memberEmails.filter((_, j) => j !== i))}>✕</button>
                                        )}
                                    </div>
                                ))}
                                <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Teammates must be registered students on CodeX</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
                            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Enrolling...' : 'Confirm Enrollment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
