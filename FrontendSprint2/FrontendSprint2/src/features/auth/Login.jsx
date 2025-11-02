import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from './api';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import { useAuth } from './AuthContext.jsx';
import './auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_KEYS = ['auth.access', 'auth.refresh', 'auth.user', 'auth.remember'];

function pickStorage(remember) {
  if (typeof window === 'undefined') {
    return { getItem() {}, setItem() {}, removeItem() {} };
  }
  return remember ? localStorage : sessionStorage;
}

function otherStorage(remember) {
  if (typeof window === 'undefined') {
    return { removeItem() {} };
  }
  return remember ? sessionStorage : localStorage;
}

function getInitialRemember() {
  if (typeof window === 'undefined') return false;
  const stored =
    localStorage.getItem('auth.remember') ?? sessionStorage.getItem('auth.remember');
  return stored === 'true';
}

export default function Login() {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(getInitialRemember);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetData, setResetData] = useState({ email: '', token: '' });

  const emailError = clientErrors.email || serverErrors.email;
  const passwordError = clientErrors.password || serverErrors.password;
  const passwordType = showPassword ? 'text' : 'password';
  const toggleLabel = showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';

  const openForgotModal = (event) => {
    if (event) {
      event.preventDefault();
    }
    setShowForgotModal(true);
    setShowResetModal(false);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
  };

  const handleForgotSuccess = ({ email: validatedEmail, response }) => {
    setResetData({
      email: validatedEmail,
      token: response?.token || '',
    });
    setShowForgotModal(false);
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetData({ email: '', token: '' });
  };

  const reopenForgotFromReset = () => {
    closeResetModal();
    setShowForgotModal(true);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setClientErrors({});
    setServerErrors({});
    setGlobalError('');
    setGlobalSuccess('');

    const nextClientErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      nextClientErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(trimmedEmail)) {
      nextClientErrors.email = 'Email invalido';
    }
    if (!password) {
      nextClientErrors.password = 'La contraseña es obligatoria';
    }
    if (Object.keys(nextClientErrors).length > 0) {
      setClientErrors(nextClientErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ email: trimmedEmail, password });
      const active = pickStorage(remember);
      const secondary = otherStorage(remember);
      AUTH_KEYS.forEach((key) => secondary.removeItem(key));
      if (data?.access) active.setItem('auth.access', data.access);
      if (data?.refresh) active.setItem('auth.refresh', data.refresh);
      if (data?.user) {
        try {
          active.setItem('auth.user', JSON.stringify(data.user));
        } catch {}
      }
      active.setItem('auth.remember', String(remember));
      setAuthSession(
        {
          accessToken: data?.access ?? null,
          refreshToken: data?.refresh ?? null,
          user: data?.user ?? null,
        },
        { remember },
      );
      setGlobalSuccess('Sesion iniciada.');
      navigate('/dashboard', { replace: true }); // placeholder segun HU-02
    } catch (error) {
      const payload = error?.data;
      const nextServerErrors = {};

      const detail = typeof payload?.detail === 'string' ? payload.detail : '';
      const nonField = Array.isArray(payload?.non_field_errors)
        ? payload.non_field_errors.join(' ')
        : typeof payload?.non_field_errors === 'string'
        ? payload.non_field_errors
        : '';

      const combined = [detail, nonField]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (combined && /(invalid|credenciales|incorrect)/.test(combined)) {
        nextServerErrors.password = 'Credenciales invalidas';
        setPassword('');
      }
      if (Array.isArray(payload?.email) && payload.email[0]) {
        nextServerErrors.email = payload.email[0];
      }
      if (Array.isArray(payload?.password) && payload.password[0]) {
        nextServerErrors.password = payload.password[0];
      }

      setServerErrors(nextServerErrors);

      const hasFieldErrors = Object.keys(nextServerErrors).length > 0;
      if (!hasFieldErrors && !combined) {
        setGlobalError('Ocurrio un error. Intentalo nuevamente.');
      } else if (hasFieldErrors) {
        setGlobalError('');
      } else if (combined && !/(invalid|credenciales|incorrect)/.test(combined)) {
        setGlobalError('Ocurrio un error. Intentalo nuevamente.');
      } else {
        setGlobalError('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <div className="brand">BakerSoft</div>
        <h1 className="hero-title">Sistema de Gestión</h1>
        <p>Administra tu panadería de manera eficiente con nuestro sistema integral de gestión.</p>
      </div>
      
      <div className="auth-forms">
        <section className="form" aria-labelledby="login-title">
          <div className="form-card">
            <div className="form-header">
              <div className="form-icon" aria-hidden="true">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-3.866 0-7 3.134-7 7 0 .552.448 1 1 1h12c.552 0 1-.448 1-1 0-3.866-3.134-7-7-7Z"
                    fill="#7A4D14"
                  />
                </svg>
              </div>
              <h2 id="login-title">Iniciar sesion</h2>
              <p>Ingresa tus credenciales para continuar</p>
            </div>

            {globalSuccess ? (
              <div className="alert success" role="status" aria-live="polite">
                <div className="alert-message">
                  <span>{globalSuccess}</span>
                </div>
              </div>
            ) : null}

            {globalError && !globalSuccess ? (
              <div className="alert error" role="alert" aria-live="assertive">
                {globalError}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="login-email">Correo electronico</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="ejemplo@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-required="true"
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'login-email-error' : undefined}
                  className={emailError ? 'has-error' : ''}
                  disabled={loading}
                  required
                />
                {emailError ? (
                  <p id="login-email-error" className="error" role="alert">
                    {emailError}
                  </p>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="login-password">Contraseña</label>
                <div className="input-with-icon">
                  <input
                    id="login-password"
                    type={passwordType}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={passwordError ? 'login-password-error' : undefined}
                    className={passwordError ? 'has-error' : ''}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={toggleLabel}
                    disabled={loading}
                  >
                    <span aria-hidden="true">{showPassword ? 'ocultar' : 'ver'}</span>
                  </button>
                </div>
                {passwordError ? (
                  <p id="login-password-error" className="error" role="alert">
                    {passwordError}
                  </p>
                ) : null}
              </div>

              <div className="field field-inline">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    disabled={loading}
                  />
                  <span>Recordarme</span>
                </label>
                <Link to="/register" className="secondary" role="button">
                  Registrarse
                </Link>
                <Link to="/forgot-password" onClick={openForgotModal}>
                  Olvide mi contraseña
                </Link>
              </div>

              <div className="actions">
                <button type="submit" className="primary full-width" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {showForgotModal ? (
        <ForgotPassword
          isModal
          onClose={closeForgotModal}
          onSuccess={handleForgotSuccess}
        />
      ) : null}

      {showResetModal ? (
        <ResetPassword
          isModal
          onClose={closeResetModal}
          token={resetData.token}
          email={resetData.email}
          onRequestToken={reopenForgotFromReset}
        />
      ) : null}
    </div>
  );
}
