import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)' }}>
            <SignIn afterSignInUrl="/dashboard" redirectUrl="/dashboard" />
        </div>
    );
}
