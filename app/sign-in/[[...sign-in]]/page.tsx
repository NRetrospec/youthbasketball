import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-court-black flex items-center justify-center px-4">
      {/* Decorative circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/[0.03] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}>
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2c0 0-4 5-4 10s4 10 4 10" />
                <path d="M2 12h20" />
              </svg>
            </div>
          </div>
          <h1 className="font-bebas text-5xl text-white tracking-wide">Welcome Back</h1>
          <p className="text-court-cream/50 font-dm text-sm mt-2">Sign in to your Hooper account</p>
        </div>

        <SignIn
          appearance={{
            variables: {
              colorBackground: '#111111',
              colorText:       '#EDE8DD',
              colorPrimary:    '#FF4500',
              colorInputBackground: '#1a1a1a',
              colorInputText:  '#EDE8DD',
              borderRadius:    '0.75rem',
              fontFamily:      'DM Sans, sans-serif',
            },
            elements: {
              card:             'shadow-none border border-white/10',
              formButtonPrimary:'bg-court-orange hover:bg-court-amber font-barlow tracking-widest uppercase text-sm',
              footerActionLink: 'text-court-orange hover:text-court-amber',
              identityPreviewEditButton: 'text-court-orange',
            },
          }}
          fallbackRedirectUrl="/select"
        />
      </div>
    </div>
  );
}
