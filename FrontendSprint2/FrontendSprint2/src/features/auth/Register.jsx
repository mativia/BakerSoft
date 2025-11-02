import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './api';
import { validateRegister, isDuplicateEmailMessage } from './validators';
import './auth.css';

const initialValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const duplicateEmailMessage = 'Ya existe una cuenta con ese email';
const fallbackMessage = 'No se pudo completar el registro. Intentalo nuevamente.';

const getPasswordStrength = (value) => {
  if (!value) {
    return { label: 'Baja', level: 'empty', percent: 0 };
  }

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const levels = ['Baja', 'Baja', 'Media', 'Alta'];
  const kinds = ['weak', 'weak', 'medium', 'strong'];

  return {
    label: levels[score],
    level: kinds[score],
    percent: Math.min((score / 3) * 100, 100),
  };
};

const getFieldError = (clientErrors, serverErrors, field) => {
  return clientErrors[field] || serverErrors[field] || '';
};

function parseRegisterErrors(error) {
  const fieldErrors = {};
  let globalMessage = '';

  const data = error?.data;
  const status = Number(error?.status);

  if (!data || typeof data !== 'object') {
    return { fieldErrors, globalMessage: fallbackMessage };
  }

  const assignField = (sourceKey, targetKey = sourceKey) => {
    const messages = data[sourceKey];
    if (!Array.isArray(messages) || messages.length === 0 || fieldErrors[targetKey]) {
      return;
    }

    let message = String(messages[0]);
    if (targetKey === 'email' && isDuplicateEmailMessage(message)) {
      message = duplicateEmailMessage;
    }
    fieldErrors[targetKey] = message;
  };

  if (typeof data.detail === 'string') {
    if (isDuplicateEmailMessage(data.detail)) {
      fieldErrors.email = duplicateEmailMessage;
    } else {
      globalMessage = data.detail;
    }
  }

  assignField('nombre_completo', 'name');
  assignField('name', 'name');
  assignField('email', 'email');
  assignField('password', 'password');
  assignField('password1', 'password');
  assignField('password2', 'confirmPassword');
  assignField('confirm_password', 'confirmPassword');

  const nonField = data.non_field_errors;
  if (Array.isArray(nonField) && nonField.length > 0) {
    const message = String(nonField[0]);
    if (!fieldErrors.email && isDuplicateEmailMessage(message)) {
      fieldErrors.email = duplicateEmailMessage;
    } else if (!globalMessage) {
      globalMessage = message;
    }
  } else if (typeof nonField === 'string' && nonField && !globalMessage) {
    globalMessage = nonField;
  }

  if ((status === 400 || status === 409) && !fieldErrors.email) {
    if (isDuplicateEmailMessage(data?.message) || isDuplicateEmailMessage(JSON.stringify(data))) {
      fieldErrors.email = duplicateEmailMessage;
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  if (!globalMessage && !hasFieldErrors) {
    globalMessage = fallbackMessage;
  }

  return { fieldErrors, globalMessage };
}

export default function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = getPasswordStrength(values.password);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverErrors[name]) {
      setServerErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setGlobalError('');

    const validationErrors = validateRegister(values);
    if (Object.keys(validationErrors).length > 0) {
      setClientErrors(validationErrors);
      return;
    }

    setClientErrors({});
    setServerErrors({});
    setIsLoading(true);

    try {
      await registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        confirm: values.confirmPassword,
      });

      setSuccessMessage('Registro exitoso.');
      setValues(initialValues);
    } catch (error) {
      const { fieldErrors, globalMessage } = parseRegisterErrors(error);
      setServerErrors(fieldErrors);
      setGlobalError(globalMessage || '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const nameError = getFieldError(clientErrors, serverErrors, 'name');
  const emailError = getFieldError(clientErrors, serverErrors, 'email');
  const passwordError = getFieldError(clientErrors, serverErrors, 'password');
  const confirmError = getFieldError(clientErrors, serverErrors, 'confirmPassword');
  const passwordStrengthId = 'register-password-strength';

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <div className="brand">BakerSoft</div>
        <h1 className="hero-title">Únete a nosotros</h1>
        <p>Crea tu cuenta y comienza a gestionar tu panadería de manera profesional y eficiente.</p>
      </div>
      
      <div className="auth-forms">
        <section className="form" aria-labelledby="register-title">
      <div className="form-card register-card">
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
          <h2 id="register-title">Crear cuenta</h2>
          <p>Completa tus datos para comenzar</p>
        </div>

        {successMessage ? (
          <div className="alert success" role="status" aria-live="polite">
            <div className="alert-message">
              <span>{successMessage}</span>
            </div>
            <button type="button" className="secondary full-width" onClick={handleGoToLogin}>
              Ir a iniciar sesion
            </button>
          </div>
        ) : null}

        {globalError && !successMessage ? (
          <div className="alert error" role="alert" aria-live="assertive">
            {globalError}
          </div>
        ) : null}

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ej: Juan Perez"
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'name-error' : undefined}
              className={nameError ? 'has-error' : ''}
              disabled={isLoading}
              required
            />
            {nameError ? (
              <p id="name-error" className="error" role="alert">
                {nameError}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="email">Correo electronico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'email-error' : undefined}
              className={emailError ? 'has-error' : ''}
              disabled={isLoading}
              required
            />
            {emailError ? (
              <p id="email-error" className="error" role="alert">
                {emailError}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ingresa una contrasena segura"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? `password-error ${passwordStrengthId}` : passwordStrengthId
              }
              className={passwordError ? 'has-error' : ''}
              disabled={isLoading}
              required
            />
            <div className="strength" role="status" aria-live="polite">
              <span id={passwordStrengthId}>Fortaleza: {passwordStrength.label}</span>
              <div className="strength-meter" aria-hidden="true">
                <span
                  style={{ width: `${passwordStrength.percent}%` }}
                  data-strength={passwordStrength.level}
                />
              </div>
            </div>
            {passwordError ? (
              <p id="password-error" className="error" role="alert">
                {passwordError}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirmar contrasena</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite tu contrasena"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(confirmError)}
              aria-describedby={confirmError ? 'confirmPassword-error' : undefined}
              className={confirmError ? 'has-error' : ''}
              disabled={isLoading}
              required
            />
            {confirmError ? (
              <p id="confirmPassword-error" className="error" role="alert">
                {confirmError}
              </p>
            ) : null}
          </div>

          <div className="actions">
            <button type="submit" className="primary full-width" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrarme'}
            </button>
          </div>
        </form>
      </div>
    </section>
      </div>
    </div>
  );
}
