'use client';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setReminder, deleteReminder, setAuthToken } from '../lib/api';

interface Props {
    hackathonId: number;
    existingReminder?: { id: number; remind_at: string } | null;
    onUpdate: () => void;
}

export default function ReminderButton({ hackathonId, existingReminder, onUpdate }: Props) {
    const { getToken } = useAuth();
    const [showPicker, setShowPicker] = useState(false);
    const [datetime, setDatetime] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    async function handleSet(e: React.FormEvent) {
        e.preventDefault();
        if (!datetime) return;
        setLoading(true);
        try {
            const token = await getToken();
            setAuthToken(token);
            await setReminder({ hackathon_id: hackathonId, remind_at: datetime });
            setMsg('✅ Reminder set! You\'ll receive an email.');
            setShowPicker(false);
            onUpdate();
        } catch (err: any) {
            setMsg('❌ ' + (err.response?.data?.error || 'Failed to set reminder'));
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(''), 4000);
        }
    }

    async function handleDelete() {
        if (!existingReminder) return;
        setLoading(true);
        try {
            const token = await getToken();
            setAuthToken(token);
            await deleteReminder(existingReminder.id);
            onUpdate();
        } catch { }
        setLoading(false);
    }

    const minDate = new Date();
    minDate.setMinutes(minDate.getMinutes() + 5);
    const minDateStr = minDate.toISOString().slice(0, 16);

    if (existingReminder) {
        const remindDate = new Date(existingReminder.remind_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '10px 14px', background: '#ECFDF5', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#065F46' }}>🔔 Reminder: {remindDate}</span>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loading}>Remove</button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 8 }}>{msg}</div>}
            {!showPicker ? (
                <button className="btn btn-outline" onClick={() => setShowPicker(true)} style={{ width: '100%' }}>
                    🔔 Set Email Reminder
                </button>
            ) : (
                <form onSubmit={handleSet} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                        <label className="form-label">Remind me at</label>
                        <input type="datetime-local" className="form-input" value={datetime}
                            onChange={e => setDatetime(e.target.value)} min={minDateStr} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? '...' : 'Set'}</button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowPicker(false)}>Cancel</button>
                </form>
            )}
        </div>
    );
}
