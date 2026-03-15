'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import EnrollModal from '../../../components/EnrollModal';
import ReminderButton from '../../../components/ReminderButton';
import CountdownTimer from '../../../components/CountdownTimer';
import { getHackathon, getMyEnrollments, getMyReminders, setAuthToken } from '../../../lib/api';

export default function StudentHackathonDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { getToken } = useAuth();
    const router = useRouter();
    const [hack, setHack] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEnroll, setShowEnroll] = useState(false);
    const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
    const [enrolledTeam, setEnrolledTeam] = useState<any>(null);
    const [reminder, setReminder] = useState<any>(null);
    const [successMsg, setSuccessMsg] = useState('');

    async function loadData() {
        const token = await getToken();
        setAuthToken(token);
        const [hackData, enrollments, reminders] = await Promise.all([
            getHackathon(Number(id)),
            getMyEnrollments(),
            getMyReminders(),
        ]);
        setHack(hackData);
        const myEnroll = enrollments.find((e: any) => e.hackathon_id === Number(id));
        setAlreadyEnrolled(!!myEnroll);
        setEnrolledTeam(myEnroll || null);
        const myReminder = reminders.find((r: any) => r.hackathon_id === Number(id));
        setReminder(myReminder || null);
        setLoading(false);
    }

    useEffect(() => { loadData(); }, [id, getToken]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const deadlinePassed = hack ? new Date(hack.enroll_deadline) < new Date() : false;

    if (loading) return <div><Navbar /><div className="spinner" style={{ marginTop: 80 }} /></div>;
    if (!hack) return <div><Navbar /><div className="empty-state"><h3>Hackathon not found</h3></div></div>;

    return (
        <div>
            <Navbar />
            {showEnroll && (
                <EnrollModal
                    hackathonId={hack.id}
                    hackathonTitle={hack.title}
                    minTeam={hack.min_team_size}
                    maxTeam={hack.max_team_size}
                    onClose={() => setShowEnroll(false)}
                    onSuccess={() => { setShowEnroll(false); setSuccessMsg('🎉 You are enrolled!'); loadData(); }}
                />
            )}

            <div className="page-wrapper">
                <div className="container" style={{ maxWidth: 860 }}>
                    {/* Back */}
                    <button className="btn btn-outline btn-sm" onClick={() => router.back()} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>

                    {successMsg && <div className="alert alert-success">{successMsg}</div>}

                    {/* Hero card */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div style={{ height: 10, background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 60%, #06B6D4 100%)', borderRadius: '16px 16px 0 0' }} />
                        <div className="card-body" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                                <span className={`badge badge-${hack.type === 'government' ? 'blue' : hack.type === 'private' ? 'purple' : 'green'}`} style={{ textTransform: 'capitalize' }}>{hack.type}</span>
                                <span className={`badge status-${hack.status}`} style={{ textTransform: 'capitalize' }}>{hack.status}</span>
                                <CountdownTimer deadline={hack.enroll_deadline} />
                            </div>
                            <h1 style={{ fontSize: 28, marginBottom: 8 }}>{hack.title}</h1>
                            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>
                                Posted by {hack.creator_name} · Field: <strong>{hack.field}</strong>
                            </p>

                            {/* Info grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
                                {[
                                    { icon: '🏆', label: 'Prize Pool', val: hack.prize_pool },
                                    { icon: '📍', label: 'Venue', val: hack.venue },
                                    { icon: '📅', label: 'Starts', val: fmt(hack.start_date) },
                                    { icon: '📅', label: 'Ends', val: fmt(hack.end_date) },
                                    { icon: '👥', label: 'Team Size', val: `${hack.min_team_size}–${hack.max_team_size} members` },
                                    { icon: '⏰', label: 'Enroll By', val: fmt(hack.enroll_deadline) },
                                ].map(item => (
                                    <div key={item.label} style={{ padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                        <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 3 }}>{item.icon} {item.label}</p>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{item.val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <h3 style={{ marginBottom: 10 }}>About this Hackathon</h3>
                            <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{hack.description}</p>
                        </div>
                    </div>

                    {/* Action card */}
                    <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ marginBottom: 0 }}>My Status</h3>

                        {alreadyEnrolled ? (
                            <div>
                                <div className="alert alert-success" style={{ marginBottom: 12 }}>
                                    ✅ You are enrolled as team "<strong>{enrolledTeam?.team_name}</strong>" ({enrolledTeam?.mode} mode)
                                </div>
                            </div>
                        ) : deadlinePassed ? (
                            <div className="alert alert-error">❌ Enrollment deadline has passed</div>
                        ) : (
                            <button className="btn btn-primary btn-lg" onClick={() => setShowEnroll(true)} style={{ alignSelf: 'flex-start' }}>
                                🚀 Enroll Now
                            </button>
                        )}

                        {!deadlinePassed && (
                            <div>
                                <h4 style={{ marginBottom: 10, fontSize: 15 }}>Email Reminder</h4>
                                <ReminderButton hackathonId={hack.id} existingReminder={reminder} onUpdate={loadData} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
