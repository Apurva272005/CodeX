'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Navbar from '../../components/Navbar';
import HackathonCard from '../../components/HackathonCard';
import { getHackathons, setAuthToken } from '../../lib/api';

export default function StudentHackathonsPage() {
    const { getToken } = useAuth();
    const [hackathons, setHackathons] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        async function load() {
            const token = await getToken();
            setAuthToken(token);
            const data = await getHackathons();
            setHackathons(data);
            setFiltered(data);
            setLoading(false);
        }
        load();
    }, [getToken]);

    useEffect(() => {
        let result = hackathons;
        if (search) result = result.filter(h => h.title.toLowerCase().includes(search.toLowerCase()) || h.field.toLowerCase().includes(search.toLowerCase()));
        if (typeFilter !== 'all') result = result.filter(h => h.type === typeFilter);
        if (statusFilter !== 'all') result = result.filter(h => h.status === statusFilter);
        setFiltered(result);
    }, [search, typeFilter, statusFilter, hackathons]);

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="container">
                    <div className="page-header">
                        <h1>🚀 Hackathons</h1>
                        <p>Discover upcoming hackathons and start your journey</p>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
                        <input className="form-input" style={{ maxWidth: 280 }} placeholder="🔍 Search hackathons…" value={search} onChange={e => setSearch(e.target.value)} />
                        <select className="form-select" style={{ maxWidth: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="all">All Types</option>
                            <option value="government">Government</option>
                            <option value="private">Private</option>
                            <option value="internal">Internal</option>
                        </select>
                        <select className="form-select" style={{ maxWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
                        </select>
                        <span style={{ color: 'var(--gray-500)', fontSize: 13, marginLeft: 'auto' }}>{filtered.length} hackathon{filtered.length !== 1 ? 's' : ''}</span>
                    </div>

                    {loading ? (
                        <div className="spinner" />
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">🏆</div>
                            <h3>No hackathons found</h3>
                            <p>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="grid-cards">
                            {filtered.map(h => <HackathonCard key={h.id} hackathon={h} detailBase="/student" />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
