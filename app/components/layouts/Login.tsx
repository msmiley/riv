import React from 'react';
import { useNavigate } from 'react-router';
import CenteredColumn from './CenteredColumn';
import Column from '../containers/Column';
import Form from '../forms/Form';
import Slot from '../slots/Slot';
import InputText from '../inputs/InputText';
import Button from '../buttons/Button';
import Row from '../containers/Row';
import useRiv from '~/hooks/useRiv';
import RivLogo from '../misc/RivLogo';
import Card from '../containers/Card';

export default function Login() {
  const riv = useRiv();
  const navigate = useNavigate();

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // if already logged in redirect to dashboard
  React.useEffect(() => {
    if (riv.getters.isLoggedIn()) {
      navigate('/dashboard');
    }
  }, [riv.state.authState]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    riv.apiCall('Auth.login', { username, password })
      .then((data) => {
        riv.dispatch({ type: 'login', data });
        navigate('/dashboard');
      })
      .catch((err) => {
        setError(String(err));
      })
      .finally(() => setLoading(false));
  };

  const disabled = loading || !username || !password;

  // subtle animated, toned-down gradient (reduced saturation/brightness via alpha overlays)
  const gradientStyle: React.CSSProperties = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)),
                 radial-gradient(circle at 22% 18%, color-mix(in srgb, var(--riv-cobalt) 95%, transparent) 0%, transparent 55%),
                 radial-gradient(circle at 78% 72%, color-mix(in srgb, var(--riv-cyan) 40%, transparent) 0%, transparent 60%),
                 linear-gradient(120deg, var(--riv-indigo) 0%, var(--riv-prussian) 35%, var(--riv-navy) 65%, var(--riv-dark) 100%)`,
    backgroundBlendMode: 'normal, overlay, overlay, normal',
    position: 'relative',
    overflow: 'hidden',
  };

  const animatedLayerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at 30% 40%, color-mix(in srgb, var(--riv-pink) 15%, transparent) 0%, transparent 62%),
                 radial-gradient(circle at 70% 60%, color-mix(in srgb, var(--riv-teal) 18%, transparent) 0%, transparent 68%)`,
    mixBlendMode: 'screen',
    animation: 'rivGradientDrift 14s ease-in-out infinite, rivGradientRotate 200s linear infinite',
    opacity: 0.72,
    pointerEvents: 'none',
  };

  return (
    <Column grow center justify="center" style={{ width: '100%', ...gradientStyle }}>
      <style>{`
        @keyframes rivGradientDrift {
          0% { transform: translate3d(0%,0%,0) scale(1); }
          25% { transform: translate3d(-4%, -3%, 0) scale(1.04); }
          50% { transform: translate3d(3%, 2%, 0) scale(2); }
          75% { transform: translate3d(-2%, 4%, 0) scale(1.03); }
          100% { transform: translate3d(0%,0%,0) scale(1); }
        }
        @keyframes rivGradientRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={animatedLayerStyle}/>
      <Card>
        <Row nowrap gap="xl">
          <div style={{ flex: 'none', width: '14em', aspectRatio: '1 / 1' }}>
            <RivLogo style={{ height: '100%' }}/>
          </div>
          <Form onSubmit={onSubmit} style={{ minWidth: '300px' }}>
            <Column gap="md">
              <h2>Sign in</h2>
              <InputText size="lg" value={username} placeholder="Username" onUpdate={setUsername} required>
                <Slot name="label">Username</Slot>
              </InputText>
              <InputText size="lg" value={password} placeholder="Password" inputType="password" onUpdate={setPassword} required>
                <Slot name="label">Password</Slot>
              </InputText>
              {error && <div style={{ color: 'var(--riv-red)', fontSize: '0.85em' }}>{error}</div>}
              <Row justify="end">
                <Button disabled={disabled} htmlType="submit">
                  {loading ? 'Signing in...' : 'Login'}
                </Button>
              </Row>
            </Column>
          </Form>
        </Row>
      </Card>
    </Column>
  );
}
