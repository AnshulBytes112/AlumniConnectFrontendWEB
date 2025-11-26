import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface Props {
  onSuccess: (authResponse: any) => void;
}

export default function GoogleSignInButton({ onSuccess }: Props) {
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;

    // Wait until google is available
    const tryInit = () => {
      // @ts-ignore
      if (window.google && buttonRef.current) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            try {
              const res = await apiClient.googleSignIn({ idToken: response.credential });
              onSuccess(res);
            } catch (err: any) {
              toast({ title: 'Google sign-in failed', description: err?.message || String(err), variant: 'destructive' });
            }
          },
        });

        // @ts-ignore
        window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large' });
      }
    };

    // try immediately
    tryInit();

    const interval = setInterval(tryInit, 500);
    return () => clearInterval(interval);
  }, [onSuccess]);

  return (
    <div>
      <div ref={buttonRef} />
      {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <div className="mt-3 text-center text-sm text-muted-foreground">Set `VITE_GOOGLE_CLIENT_ID` to enable Google sign-in.</div>
      )}
    </div>
  );
}
