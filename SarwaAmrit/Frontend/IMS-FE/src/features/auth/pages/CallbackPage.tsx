import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Typography } from '@thoughtstream/ui';
import { exchangeCodeForTokens, fetchUserInfo, persistOidcSession } from '../../../core/api';
import { SESSION_KEY } from '../../dashboard/DashboardPage';

export const CallbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      navigate('/dashboard', { replace: true });
      return;
    }
    const oauthError = params.get('error');
    if (oauthError) {
      setError(params.get('error_description') || 'Access was denied by policy.');
      return;
    }
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) {
      setError('Missing authorization code. Please sign in again.');
      return;
    }

    let cancelled = false;
    ;(async () => {
      try {
        const tokens = await exchangeCodeForTokens(code, state);
        const user = await fetchUserInfo(tokens.access_token);
        persistOidcSession(tokens);
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            email: user.email || '',
            name: user.name,
            userId: user.sub,
            tenantId: user.tenant_id,
          }),
        );
        if (!cancelled) navigate('/dashboard', { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Sign-in failed');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, navigate]);

  return (
    <div className="nn-gate" data-theme="dark">
      <div className="nn-gate-scrim">
        <div className="nn-gate-modal" role="status" aria-live="polite">
          <form className="nn-gate-auth" onSubmit={(event) => event.preventDefault()}>
            <Typography variant="headline" as="h1" className="nn-gate-title">
              Nector Nest - IMS
            </Typography>
            {error ? (
              <>
                <Typography variant="bodySmall" color="secondary" className="nn-gate-subtitle">
                  The identity provider rejected this session.
                </Typography>
                <p className="form-error">{error}</p>
                <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button variant="primary" size="large" fullWidth>
                    Return to login
                  </Button>
                </Link>
              </>
            ) : (
              <Typography variant="bodySmall" color="secondary" className="nn-gate-subtitle">
                Completing SSO sign-in…
              </Typography>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
