import React from 'react';
import { useNavigate } from 'react-router';
import CenteredColumn from './CenteredColumn';
import Column from '../containers/Column';
import Card from '../containers/Card';
import Slot from '../slots/Slot';
import Row from '../containers/Row';
import RivLogo from '../misc/RivLogo';
import useRiv from '~/hooks/useRiv';

export default function Logout() {
  const riv = useRiv();
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<'pending' | 'done' | 'error'>('pending');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // try server side logout (ignore errors silently, still clear local state)
        try {
          await riv.apiCall?.('Auth.logout', {});
        } catch (e) {
          // swallow server logout errors
        }
        if (cancelled) return;
        riv.dispatch({ type: 'logout' });
        setStatus('done');
        navigate('/login');
      } catch (e: any) {
        if (cancelled) return;
        setError(String(e));
        setStatus('error');
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <Column style={{ width: '100%', minHeight: '100vh', justifyContent: 'center' }}>
      <CenteredColumn>
        <Card color="var(--riv-surface-raised)" cols={6}>
          <Slot name="title">
            <Row gap="sm" style={{ alignItems: 'center' }}>
              <RivLogo />
              <span>Logging Out</span>
            </Row>
          </Slot>
          <Slot name="description">{status === 'pending' && 'Ending your session...'}{status === 'error' && 'Issue logging out'}{status === 'done' && 'Redirecting...'}</Slot>
          {error && <div style={{ color: 'var(--riv-red, #f55)', fontSize: '0.85em' }}>{error}</div>}
        </Card>
      </CenteredColumn>
    </Column>
  );
}
