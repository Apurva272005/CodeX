'use client';
import Link from 'next/link';
import CountdownTimer from './CountdownTimer';

interface Hackathon {
    id: number;
    title: string;
    description: string;
    type: string;
    field: string;
    prize_pool: string;
    status: string;
    start_date: string;
    end_date: string;
    enroll_deadline: string;
    venue: string;
    min_team_size: number;
    max_team_size: number;
    creator_name?: string;
    banner_url?: string;
}

const typeColors: Record<string, string> = {
    government: 'badge-blue',
    private: 'badge-purple',
    internal: 'badge-green',
};

export default function HackathonCard({ hackathon, detailBase = '/student' }: { hackathon: Hackathon; detailBase?: string }) {
    const statusClass = `status-${hackathon.status}`;
    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
        >
            {/* Banner */}
            <div style={{
                height: 8,
                background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                borderRadius: '16px 16px 0 0',
            }} />

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className={`badge ${typeColors[hackathon.type] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{hackathon.type}</span>
                        <span className={`badge ${statusClass}`} style={{ textTransform: 'capitalize' }}>{hackathon.status}</span>
                    </div>
                    <CountdownTimer deadline={hackathon.enroll_deadline} />
                </div>

                {/* Title & field */}
                <div>
                    <h3 style={{ fontSize: 17, marginBottom: 4, lineHeight: 1.3 }}>{hackathon.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>🏷 {hackathon.field}</p>
                </div>

                {/* Description */}
                <p style={{
                    fontSize: 13.5, color: 'var(--gray-600)', lineHeight: 1.6, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                    {hackathon.description}
                </p>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 8px' }}>
                    {[
                        { icon: '🏆', label: 'Prize Pool', val: hackathon.prize_pool },
                        { icon: '📍', label: 'Venue', val: hackathon.venue },
                        { icon: '📅', label: 'Starts', val: fmt(hackathon.start_date) },
                        { icon: '👥', label: 'Team', val: hackathon.min_team_size === hackathon.max_team_size ? `${hackathon.min_team_size} person` : `${hackathon.min_team_size}–${hackathon.max_team_size} members` },
                    ].map(item => (
                        <div key={item.label} style={{ padding: '8px 10px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 2 }}>{item.icon} {item.label}</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>{item.val}</p>
                        </div>
                    ))}
                </div>

                {/* Deadline line */}
                <div style={{ padding: '10px 12px', background: '#FFF7ED', borderRadius: 'var(--radius-md)', border: '1px solid #FED7AA', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13 }}>⚡</span>
                    <div>
                        <p style={{ fontSize: 11, color: '#92400E', fontWeight: 500 }}>Enroll by</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#C2410C' }}>{fmt(hackathon.enroll_deadline)}</p>
                    </div>
                </div>

                {/* Action */}
                <Link href={`${detailBase}/${hackathon.id}`} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>
                    View Details →
                </Link>
            </div>
        </div>
    );
}
