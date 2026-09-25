import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authApi';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Fuel,
  Gauge,
  Lock,
  Mail,
  Radio,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';

const stationStats = [
  { label: 'Pump 01', value: '2,450 L', detail: 'Today', status: 'Online', type: 'status' },
  { label: 'Pump 02', value: '1,980 L', detail: 'Today', status: 'Online', type: 'status' },
  { label: "Today's Sales", value: '12,840 DT', detail: '+12%', type: 'trend' },
  { label: 'Stock', value: '78%', detail: '78,560 L Available', type: 'stock' },
] as const;

const platformFeatures = [
  { icon: Radio, label: 'Real-time Monitoring' },
  { icon: BarChart3, label: 'Sales & Reports' },
  { icon: Fuel, label: 'Fuel Stock Management' },
  { icon: Users, label: 'Team & Roles' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const clearError = () => {
    if (error) setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Identifiants incorrects. Veuillez vérifier votre email et votre mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-hero" aria-label="Kiosk Fuel Management System">
        <div className="login-hero__content">
          <div className="login-hero__brand">
            <div className="login-hero__logo" aria-hidden="true">
              <Fuel className="h-6 w-6" />
            </div>
            <div>
              <div className="login-hero__wordmark">KIOSK</div>
              <div className="login-hero__tagline">Fuel Management System</div>
            </div>
          </div>

          <div className="login-hero__message">
            <p className="login-hero__eyebrow">Your station, always in control</p>
            <h1>
              Manage. Monitor. <span>Grow.</span>
            </h1>
            <p>Your complete fuel station management solution</p>
          </div>

          <div className="login-stat-section" aria-label="Illustrative station metrics">
            <div className="login-stat-section__caption">Station preview <span>Illustrative metrics</span></div>
            <div className="login-stat-grid">
              {stationStats.map((stat) => (
                <article className="login-stat-card" key={stat.label}>
                  <div className="login-stat-card__label">
                    <span>{stat.label}</span>
                    {stat.type === 'status' && <span className="login-stat-card__online"><i />{stat.status}</span>}
                  </div>
                  <div className="login-stat-card__value">{stat.value}</div>
                  <div className={`login-stat-card__detail login-stat-card__detail--${stat.type}`}>
                    {stat.type === 'trend' && <TrendingUp className="h-3.5 w-3.5" />}
                    {stat.type === 'stock' && <Gauge className="h-3.5 w-3.5" />}
                    <span>{stat.detail}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="login-hero__features" aria-label="Platform capabilities">
          {platformFeatures.map(({ icon: Icon, label }) => (
            <div className="login-hero__feature" key={label}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <main className="login-panel">
        <div className="login-panel__content">
          <div className="login-panel__topline">
            Fueling a better tomorrow
            <span aria-hidden="true" />
          </div>

          <div className="login-mobile-brand">
            <div className="login-mobile-brand__icon" aria-hidden="true"><Fuel className="h-5 w-5" /></div>
            <div>
              <div>KIOSK</div>
              <span>Fuel Management System</span>
            </div>
          </div>

          <div className="login-form-brand">
            <div className="login-form-brand__icon" aria-hidden="true"><Fuel className="h-7 w-7" /></div>
            <div>
              <div className="login-form-brand__wordmark">KIOSK</div>
              <div className="login-form-brand__label">Dashboard</div>
            </div>
          </div>

          <div className="login-form-heading">
            <h2>Bienvenue <span aria-hidden="true">👋</span></h2>
            <p>Connectez-vous à votre espace de gestion</p>
          </div>

          {error && (
            <div id="login-error" className="login-form-error" role="alert">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate={false}>
            <div className="login-form__field">
              <label htmlFor="email">Email ou nom d&apos;utilisateur</label>
              <div className="login-form__input-wrap">
                <Mail className="login-form__input-icon h-5 w-5" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(event) => {
                    clearError();
                    setEmail(event.target.value);
                  }}
                  placeholder="votre@email.com"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>
            </div>

            <div className="login-form__field">
              <label htmlFor="password">Mot de passe</label>
              <div className="login-form__input-wrap">
                <Lock className="login-form__input-icon h-5 w-5" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(event) => {
                    clearError();
                    setPassword(event.target.value);
                  }}
                  placeholder="Saisissez votre mot de passe"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'login-error' : undefined}
                />
                <button
                  className="login-form__password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={loading}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <label className="login-form__remember">
              <input
                type="checkbox"
                checked={remember}
                disabled={loading}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Se souvenir de moi</span>
            </label>

            <button className="login-form__submit" type="submit" disabled={loading}>
              {loading ? (
                <><span className="login-form__spinner" aria-hidden="true" />Connexion...</>
              ) : (
                <>Se connecter <ArrowRight className="h-5 w-5" aria-hidden="true" /></>
              )}
            </button>
          </form>
          
        </div>
{/* Quick Demo Credentials Info */}
          <div className="border-t border-slate-800/80 pt-4 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Demo Accounts Available:</span>
            <div className="text-[11px] text-slate-400">
              Admin: <code className="text-cyan-400">admin@fuelstation.tn</code> / <code className="text-cyan-400">Admin123!</code>
            </div>
          </div>
        <footer className="login-panel__footer">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Kiosk Management System</span>
          <span aria-hidden="true">•</span>
          <span>© 2026. Tous droits réservés.</span>
        </footer>
      </main>
    </div>
  );
};
