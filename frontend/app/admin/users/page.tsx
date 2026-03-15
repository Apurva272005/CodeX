'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Navbar from '../../../components/Navbar';
import { getAdminUsers, deleteUser, updateUserRole, setAuthToken } from '../../../lib/api';

const ROLE_COLORS: Record<string, string> = { student: 'badge-blue', faculty: 'badge-purple', admin: 'badge-red' };

export default function AdminUsersPage() {
    const { getToken } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [acting, setActing] = useState<string | null>(null);

    async function load() {
        const token = await getToken();
        setAuthToken(token);
        const data = await getAdminUsers();
        setUsers(data);
        setLoading(false);
    }

    useEffect(() => { load(); }, [getToken]);

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        setActing(id);
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (e: any) { alert(e.response?.data?.error || 'Delete failed'); }
        setActing(null);
    }

    async function handleRoleChange(id: string, newRole: string) {
        setActing(id);
        try {
            await updateUserRole(id, newRole);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch { }
        setActing(null);
    }

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="container">
                    <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div><h1>👥 User Management</h1><p>View, manage roles, and delete users</p></div>
                        <div className="badge badge-blue" style={{ fontSize: 14, padding: '8px 16px' }}>{users.length} total users</div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                        <input className="form-input" style={{ maxWidth: 280 }} placeholder="🔍 Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
                        <select className="form-select" style={{ maxWidth: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                            <option value="all">All Roles</option>
                            <option value="student">Students</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admins</option>
                        </select>
                        <span style={{ fontSize: 13, color: 'var(--gray-500)', alignSelf: 'center', marginLeft: 'auto' }}>{filtered.length} shown</span>
                    </div>

                    {loading ? <div className="spinner" /> : (
                        <div className="card" style={{ overflow: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Info</th>
                                        <th>Department</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(u => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                                            <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{u.email}</td>
                                            <td>
                                                <span className={`badge ${ROLE_COLORS[u.role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
                                            </td>
                                            <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.extra_info || '—'}</td>
                                            <td style={{ fontSize: 13 }}>{u.department || '—'}</td>
                                            <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{fmt(u.created_at)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                    <select
                                                        value={u.role}
                                                        onChange={e => handleRoleChange(u.id, e.target.value)}
                                                        disabled={acting === u.id}
                                                        style={{ padding: '4px 8px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 12, background: '#fff', cursor: 'pointer' }}
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="faculty">Faculty</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.name)} disabled={acting === u.id}>
                                                        {acting === u.id ? '…' : 'Del'}
                                                    </button>
                                                </div>
                                            </td>
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
