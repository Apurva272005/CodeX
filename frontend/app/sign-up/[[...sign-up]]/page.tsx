import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)' }}>
            <SignUp afterSignUpUrl="/complete-profile" redirectUrl="/complete-profile" />
        </div>
    );
}
