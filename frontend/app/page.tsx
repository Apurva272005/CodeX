'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/nextjs';

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)' }}>
      {/* Header */}
      <nav style={{ padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 16 }}>CX</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>Code<span style={{ color: 'var(--brand-primary)' }}>X</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <SignInButton mode="modal"><button className="btn btn-outline">Sign In</button></SignInButton>
          <SignUpButton mode="modal"><button className="btn btn-primary">Get Started</button></SignUpButton>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div className="badge badge-purple" style={{ margin: '0 auto 24px', fontSize: 13, padding: '6px 16px' }}>University Hackathon Platform</div>
        <h1 style={{ fontSize: 'clamp(40px,6vw,72px)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1.5px' }}>
          Win Hackathons,<br />
          <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Build the Future
          </span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--gray-500)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          CodeX connects students, faculty, and administrators on one platform
          to discover, manage, and participate in university hackathons.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <SignUpButton mode="modal"><button className="btn btn-primary btn-lg">Start for Free →</button></SignUpButton>
          <SignInButton mode="modal"><button className="btn btn-outline btn-lg">Sign In</button></SignInButton>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24 }}>
        {[
          { icon: '🎓', title: 'For Students', desc: 'Browse hackathons, enroll solo or in teams, set reminders, and track your journey.' },
          { icon: '👩‍🏫', title: 'For Faculty', desc: 'Create and manage hackathons, track participant registrations, and promote events.' },
          { icon: '⚡', title: 'For Admins', desc: 'Full platform control: approve hackathons, manage users, and view real-time stats.' },
        ].map(f => (
          <div key={f.title} className="card card-body" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
