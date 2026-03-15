'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { getHackathon, updateHackathon, setAuthToken } from '../../../../lib/api';

const FIELDS = ['Web Development', 'AI/ML', 'Blockchain', 'IoT', 'Cybersecurity', 'Mobile App', 'Data Science', 'Cloud Computing', 'Game Development', 'Open Innovation'];

export default function EditHackathonPage() {
    const { id } = useParams<{ id: string }>();
    const { getToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState<any>({});

    useEffect(() => {
        async function load() {
            const token = await getToken();
            setAuthToken(token);
            const h = await getHackathon(Number(id));
            const toLocal = (d: string) => d ? new Date(d).toISOString().slice(0, 16) : '';
            setForm({ ...h, start_date: toLocal(h.start_date), end_date: toLocal(h.end_date), enroll_deadline: toLocal(h.enroll_deadline) });
            setLoading(false);
        }
        load();
    }, [id, getToken]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const token = await getToken();
            setAuthToken(token);
            await updateHackathon(Number(id), { ...form, min_team_size: parseInt(form.min_team_size), max_team_size: parseInt(form.max_team_size) });
            router.push('/faculty');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Update failed');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div><Navbar /><div className="spinner" style={{ marginTop: 80 }} /></div>;

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="container" style={{ maxWidth: 720 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => router.back()} style={{ marginBottom: 24 }}>← Back</button>
                    <div className="page-header"><h1>✏️ Edit Hackathon</h1></div>
                    {error && <div className="alert alert-error">{error}</div>}
                    <div className="card card-body">
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input className="form-input" name="title" value={form.title || ''} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" name="description" value={form.description || ''} onChange={handleChange} required style={{ minHeight: 120 }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select className="form-select" name="type" value={form.type || 'internal'} onChange={handleChange} required>
                                        <option value="internal">Internal</option>
                                        <option value="government">Government</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Field</label>
                                    <select className="form-select" name="field" value={form.field || ''} onChange={handleChange} required>
                                        <option value="">Select field</option>
                                        {FIELDS.map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Prize Pool</label>
                                    <input className="form-input" name="prize_pool" value={form.prize_pool || ''} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Venue</label>
                                    <input className="form-input" name="venue" value={form.venue || ''} onChange={handleChange} required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Min Team Size</label>
                                    <select className="form-select" name="min_team_size" value={form.min_team_size || '1'} onChange={handleChange}>
                                        {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Max Team Size</label>
                                    <select className="form-select" name="max_team_size" value={form.max_team_size || '4'} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input className="form-input" type="datetime-local" name="start_date" value={form.start_date || ''} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input className="form-input" type="datetime-local" name="end_date" value={form.end_date || ''} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Enroll Deadline</label>
                                    <input className="form-input" type="datetime-local" name="enroll_deadline" value={form.enroll_deadline || ''} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" name="status" value={form.status || 'upcoming'} onChange={handleChange}>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
                                <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
