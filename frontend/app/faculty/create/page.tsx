'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Navbar from '../../../components/Navbar';
import { createHackathon, setAuthToken } from '../../../lib/api';

const FIELDS = ['Web Development', 'AI/ML', 'Blockchain', 'IoT', 'Cybersecurity', 'Mobile App', 'Data Science', 'Cloud Computing', 'Game Development', 'Open Innovation'];

export default function CreateHackathonPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '', description: '', banner_url: '', type: 'internal', field: '', prize_pool: '',
        min_team_size: '1', max_team_size: '4',
        start_date: '', end_date: '', enroll_deadline: '', venue: '', status: 'upcoming',
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const token = await getToken();
            setAuthToken(token);
            await createHackathon({ ...form, min_team_size: parseInt(form.min_team_size), max_team_size: parseInt(form.max_team_size) });
            router.push('/faculty');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create hackathon');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="container" style={{ maxWidth: 720 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => router.back()} style={{ marginBottom: 24 }}>← Back</button>
                    <div className="page-header">
                        <h1>+ Create Hackathon</h1>
                        <p>Fill in the details to submit a new hackathon for admin review</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="card card-body">
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label">Hackathon Title</label>
                                <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Smart India Hackathon 2025" required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Describe the hackathon, rules, and objectives…" required style={{ minHeight: 120 }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select className="form-select" name="type" value={form.type} onChange={handleChange} required>
                                        <option value="internal">Internal</option>
                                        <option value="government">Government</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Field / Domain</label>
                                    <select className="form-select" name="field" value={form.field} onChange={handleChange} required>
                                        <option value="">Select field</option>
                                        {FIELDS.map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Prize Pool</label>
                                    <input className="form-input" name="prize_pool" value={form.prize_pool} onChange={handleChange} placeholder="e.g. ₹1,00,000" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Venue</label>
                                    <input className="form-input" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Main Conference Hall" required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Min Team Size</label>
                                    <select className="form-select" name="min_team_size" value={form.min_team_size} onChange={handleChange}>
                                        {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Max Team Size</label>
                                    <select className="form-select" name="max_team_size" value={form.max_team_size} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date & Time</label>
                                    <input className="form-input" type="datetime-local" name="start_date" value={form.start_date} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date & Time</label>
                                    <input className="form-input" type="datetime-local" name="end_date" value={form.end_date} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Enrollment Deadline</label>
                                <input className="form-input" type="datetime-local" name="enroll_deadline" value={form.enroll_deadline} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Banner Image URL (optional)</label>
                                <input className="form-input" name="banner_url" value={form.banner_url} onChange={handleChange} placeholder="https://…" />
                            </div>

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
                                <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Submitting…' : 'Submit for Approval →'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
