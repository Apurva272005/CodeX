'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { completeProfile, setAuthToken } from '../../lib/api';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'MBA', 'Other'];

export default function CompleteProfilePage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [role, setRole] = useState('student');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Role-specific fields
    const [enrollmentNo, setEnrollmentNo] = useState('');
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('1');
    const [designation, setDesignation] = useState('');
    const [staffId, setStaffId] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = await getToken();
            setAuthToken(token);
            await completeProfile({
                role, name,
                ...(role === 'student' ? { enrollment_no: enrollmentNo, department, year: parseInt(year) } : {}),
                ...(role === 'faculty' ? { department, designation } : {}),
                ...(role === 'admin' ? { staff_id: staffId } : {}),
            });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Profile setup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 520, padding: 40 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontWeight: 800, fontSize: 22, fontFamily: 'var(--font-display)' }}>CX</div>
                    <h1 style={{ fontSize: 24, marginBottom: 6 }}>Complete Your Profile</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Tell us who you are to get started</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Role */}
                    <div className="form-group">
                        <label className="form-label">I am a…</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                            {[
                                { val: 'student', label: '🎓 Student' },
                                { val: 'faculty', label: '👩‍🏫 Faculty' },
                                { val: 'admin', label: '⚡ Admin' },
                            ].map(r => (
                                <button key={r.val} type="button"
                                    onClick={() => setRole(r.val)}
                                    style={{
                                        padding: '12px 8px', borderRadius: 'var(--radius-md)', border: `2px solid ${role === r.val ? 'var(--brand-primary)' : 'var(--border)'}`,
                                        background: role === r.val ? 'var(--brand-primary-light)' : '#fff', cursor: 'pointer',
                                        color: role === r.val ? 'var(--brand-primary)' : 'var(--gray-600)', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                                    }}>{r.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* Full name */}
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                    </div>

                    {/* Student fields */}
                    {role === 'student' && <>
                        <div className="form-group">
                            <label className="form-label">Enrollment Number</label>
                            <input className="form-input" value={enrollmentNo} onChange={e => setEnrollmentNo(e.target.value)} placeholder="e.g. 22CS001" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)} required>
                                <option value="">Select department</option>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Year</label>
                            <select className="form-select" value={year} onChange={e => setYear(e.target.value)} required>
                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                            </select>
                        </div>
                    </>}

                    {/* Faculty fields */}
                    {role === 'faculty' && <>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)} required>
                                <option value="">Select department</option>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Designation</label>
                            <input className="form-input" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Assistant Professor" required />
                        </div>
                    </>}

                    {/* Admin fields */}
                    {role === 'admin' && <>
                        <div className="form-group">
                            <label className="form-label">Staff ID</label>
                            <input className="form-input" value={staffId} onChange={e => setStaffId(e.target.value)} placeholder="e.g. ADMIN001" required />
                        </div>
                    </>}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: 4, justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Setting up…' : 'Complete Setup →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
