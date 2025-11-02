import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { confirmPasswordReset, validateResetToken } from './api';
import './auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPolicyRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function parseDrfErrors(data) {
  const fieldErrors = {};
  let globalMessage = '';

  if (!data || typeof data !== 'object') {
    return { fieldErrors, globalMessage };
  }

  if (typeof data.detail === 'string') {
    globalMessage = data.detail;
  }

  const nonField =
    Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0
      ? data.non_field_errors.join(' ')
      : typeof data.non_field_errors === 'string'
      ? data.non_field_errors
      : '';

  if (nonField) {
    globalMessage = nonField;
  }

  const mapField = (keys, alias) => {
    keys.forEach((key) => {
      if (Array.isArray(data[key]) && data[key].length > 0 && !fieldErrors[alias]) {
        fieldErrors[alias] = String(data[key][0]);
      }
    });
  };

  mapField(['email'], 'email');
  mapField(['password', 'new_password', 'new_password1'], 'password');
  mapField(['password2', 'new_password2', 'confirm_password'], 'confirmPassword');
  mapField(['token'], 'token');

  return { fieldErrors, globalMessage };
}

export default function ResetPassword({
  isModal = false,
  onClose,
  token: tokenProp,
  email: emailProp,
  onRequestToken,
} = {}) {
  const params = useParams();
  const routeToken = params?.token;
  const effectiveToken = useMemo(() => tokenProp ?? routeToken ?? '', [tokenProp, routeToken]);
  const hasToken = Boolean(effectiveToken);

  const [email, setEmail] = useState(emailProp ? String(emailProp) : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenIssue, setTokenIssue] = useState(false);

  useEffect(() => {
    if (emailProp) {
      setEmail(String(emailProp));
    }
  }, [emailProp]);

  useEffect(() => {
    if (!hasToken) {
      setTokenIssue(false);
      return;
    }

    let cancelled = false;
    setTokenIssue(false);
    setGlobalError('');

    (async () => {
      try {
        await validateResetToken({ token: effectiveToken });
      } catch (error) {
        if (cancelled) return;
        const message =
          error?.data?.detail ||
          (Array.isArray(error?.data?.token) && error.data.token[0]) ||
          'Token invalido o expirado.';
        setGlobalError(message);
        setTokenIssue(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveToken, hasToken]);

  const updateFieldError = (field) => {
    if (clientErrors[field]) {
      setClientErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (serverErrors[field]) {
      setServerErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    updateFieldError('email');
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    updateFieldError('password');
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    updateFieldError('confirmPassword');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setClientErrors({});
    setServerErrors({});
    setGlobalError('');
    setSuccessMessage('');
    setTokenIssue(false);

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const nextClientErrors = {};

    if (!normalizedEmail) {
      nextClientErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(normalizedEmail)) {
      nextClientErrors.email = 'Email invalido';
    }

    if (!password) {
      nextClientErrors.password = 'La contrasena es obligatoria';
    } else if (!passwordPolicyRegex.test(password)) {
      nextClientErrors.password = 'Debe cumplir la politica de seguridad';
    }

    if (!confirmPassword) {
      nextClientErrors.confirmPassword = 'Confirma tu contrasena';
    } else if (password && password !== confirmPassword) {
      nextClientErrors.confirmPassword = 'Las contrasenas no coinciden';
    }

    if (Object.keys(nextClientErrors).length > 0) {
      setClientErrors(nextClientErrors);
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset({
        token: hasToken ? effectiveToken : undefined,
        email: normalizedEmail,
        password,
        confirm: confirmPassword,
      });

      setServerErrors({});
      setClientErrors({});
      setSuccessMessage('Contrasena restablecida correctamente. Ya puedes iniciar sesion.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const { fieldErrors, globalMessage } = parseDrfErrors(error?.data);
      const tokenMessage = fieldErrors.token;
      if (tokenMessage) {
        delete fieldErrors.token;
      }
      setServerErrors(fieldErrors);
      const message = tokenMessage || globalMessage || 'Ocurrio un error. Intentalo nuevamente.';
      setGlobalError(message);
      setTokenIssue(Boolean(tokenMessage) || message.toLowerCase().includes('token'));
    } finally {
      setLoading(false);
    }
  };

  const emailError = clientErrors.email || serverErrors.email;
  const passwordError = clientErrors.password || serverErrors.password;
  const confirmError = clientErrors.confirmPassword || serverErrors.confirmPassword;
  const showCloseButton = isModal && typeof onClose === 'function';

  const cardContent = (
    <div className="form-card">
      <div className="form-header modal-header">
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
        <h2 id="reset-password-title">Restablecer contrasena</h2>
        <p>Ingresa una nueva contrasena segura para tu cuenta.</p>
        {showCloseButton ? (
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        ) : null}
      </div>

      {successMessage ? (
        <div className="alert success" role="status" aria-live="polite">
          <div className="alert-message">
            <span>{successMessage}</span>
          </div>
          <Link className="secondary full-width" to="/login" onClick={onClose}>
            Ir a iniciar sesion
          </Link>
        </div>
      ) : null}

      {globalError && !successMessage ? (
        <div className="alert error" role="alert" aria-live="assertive">
          <p>{globalError}</p>
          {tokenIssue ? (
            onRequestToken ? (
              <button
                type="button"
                className="secondary full-width"
                onClick={onRequestToken}
              >
                Volver a solicitar enlace
              </button>
            ) : (
              <Link className="secondary full-width" to="/forgot-password" onClick={onClose}>
                Volver a solicitar enlace
              </Link>
            )
          ) : null}
        </div>
      ) : null}

      <form className="reset-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="reset-email">Correo electronico</label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            aria-required="true"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'reset-email-error' : undefined}
            className={emailError ? 'has-error' : ''}
            disabled={loading}
            required
          />
          {emailError ? (
            <p id="reset-email-error" className="error" role="alert">
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="reset-password">Nueva contrasena</label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordChange}
            aria-required="true"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={
              passwordError ? 'reset-password-error reset-password-hint' : 'reset-password-hint'
            }
            className={passwordError ? 'has-error' : ''}
            disabled={loading}
            required
          />
          <p id="reset-password-hint" className="hint">
            Debe cumplir la politica de seguridad.
          </p>
          {passwordError ? (
            <p id="reset-password-error" className="error" role="alert">
              {passwordError}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="reset-confirm-password">Confirmar contrasena</label>
          <input
            id="reset-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            aria-required="true"
            aria-invalid={Boolean(confirmError)}
            aria-describedby={confirmError ? 'reset-confirm-password-error' : undefined}
            className={confirmError ? 'has-error' : ''}
            disabled={loading}
            required
          />
          {confirmError ? (
            <p id="reset-confirm-password-error" className="error" role="alert">
              {confirmError}
            </p>
          ) : null}
        </div>

        <div className="actions">
          <button type="submit" className="primary full-width" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-password-title"
      >
        <div className="modal-card">{cardContent}</div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <div className="brand">BakerSoft</div>
        <h1 className="hero-title">Nueva Contraseña</h1>
        <p>Crea una nueva contraseña segura para tu cuenta.</p>
      </div>
      
      <div className="auth-forms">
        <section className="form" aria-labelledby="reset-password-title">
          {cardContent}
        </section>
      </div>
    </div>
  );
}
