import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { api } from "../services/api";

const loginSchema = z.object({
  email: z.string().min(1, "El correo es requerido.").email("El correo no tiene un formato valido."),
  password: z.string().min(1, "La contrasena es requerida.").min(6, "La contrasena debe tener al menos 6 caracteres.")
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  mode?: "login" | "forgot" | "reset";
};

export function LoginPage({ onLogin, mode = "login" }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [developmentToken, setDevelopmentToken] = useState<string | null>(null);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const recoveryForm = useForm<{ email: string }>({
    defaultValues: { email: searchParams.get("email") ?? "" }
  });
  const resetForm = useForm<{ email: string; resetToken: string; newPassword: string }>({
    defaultValues: {
      email: searchParams.get("email") ?? "",
      resetToken: searchParams.get("token") ?? "",
      newPassword: ""
    }
  });

  async function submitLogin(values: LoginFormValues) {
    try {
      await onLogin(values.email, values.password);
    } catch (caught) {
      loginForm.setError("root", {
        message: caught instanceof Error ? caught.message : "No se pudo iniciar sesion."
      });
    }
  }

  async function submitRecovery(values: { email: string }) {
    setMessage(null);
    setDevelopmentToken(null);
    try {
      const response = await api.forgotPassword(values.email);
      setMessage(response.message);
      setDevelopmentToken(response.developmentResetToken ?? null);
    } catch (caught) {
      recoveryForm.setError("root", {
        message: caught instanceof Error ? caught.message : "No se pudo procesar la solicitud."
      });
    }
  }

  async function submitReset(values: { email: string; resetToken: string; newPassword: string }) {
    setMessage(null);
    try {
      const response = await api.resetPassword(values.email, values.resetToken, values.newPassword);
      setMessage(response.message);
      resetForm.reset({ email: values.email, resetToken: "", newPassword: "" });
    } catch (caught) {
      resetForm.setError("root", {
        message: caught instanceof Error ? caught.message : "No se pudo actualizar la contrasena."
      });
    }
  }

  const isSubmitting = loginForm.formState.isSubmitting || recoveryForm.formState.isSubmitting || resetForm.formState.isSubmitting;
  const title = mode === "forgot" ? "Recuperar acceso" : mode === "reset" ? "Restablecer contrasena" : "Sistema de punto de venta";

  return (
    <main className="login-page">
      <form
        className="login-panel"
        onSubmit={
          mode === "forgot"
            ? recoveryForm.handleSubmit(submitRecovery)
            : mode === "reset"
              ? resetForm.handleSubmit(submitReset)
              : loginForm.handleSubmit(submitLogin)
        }
        noValidate
      >
        <div className="login-header">
          <div className="brand-mark">RP</div>
          <div className="login-header-text">
            <strong>RAME POS</strong>
            <span>{title}</span>
          </div>
        </div>

        <div className="login-body">
          {mode === "login" && (
            <>
              <div className="login-field-group">
                <label className="login-field-label" htmlFor="login-email">
                  <Mail size={14} />
                  Correo electronico
                </label>
                <label className={`login-field${loginForm.formState.errors.email ? " login-field--error" : ""}`}>
                  <input id="login-email" type="email" autoComplete="email" placeholder="usuario@empresa.com" {...loginForm.register("email")} />
                </label>
                {loginForm.formState.errors.email && <span className="field-error" role="alert">{loginForm.formState.errors.email.message}</span>}
              </div>

              <div className="login-field-group">
                <label className="login-field-label" htmlFor="login-password">
                  <LockKeyhole size={14} />
                  Contrasena
                </label>
                <label className={`login-field${loginForm.formState.errors.password ? " login-field--error" : ""}`}>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contrasena"
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    className="login-field-toggle"
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                    onClick={() => setShowPassword((value) => !value)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </label>
                {loginForm.formState.errors.password && <span className="field-error" role="alert">{loginForm.formState.errors.password.message}</span>}
              </div>
            </>
          )}

          {mode === "forgot" && (
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="recovery-email">
                <Mail size={14} />
                Correo de la cuenta
              </label>
              <label className={`login-field${recoveryForm.formState.errors.email ? " login-field--error" : ""}`}>
                <input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@empresa.com"
                  {...recoveryForm.register("email", { required: "El correo es requerido." })}
                />
              </label>
              {recoveryForm.formState.errors.email && <span className="field-error" role="alert">{recoveryForm.formState.errors.email.message}</span>}
            </div>
          )}

          {mode === "reset" && (
            <>
              <div className="login-field-group">
                <label className="login-field-label" htmlFor="reset-email"><Mail size={14} />Correo</label>
                <label className={`login-field${resetForm.formState.errors.email ? " login-field--error" : ""}`}>
                  <input id="reset-email" type="email" {...resetForm.register("email", { required: "El correo es requerido." })} />
                </label>
                {resetForm.formState.errors.email && <span className="field-error" role="alert">{resetForm.formState.errors.email.message}</span>}
              </div>
              <div className="login-field-group">
                <label className="login-field-label" htmlFor="reset-token"><LockKeyhole size={14} />Token</label>
                <label className={`login-field${resetForm.formState.errors.resetToken ? " login-field--error" : ""}`}>
                  <input id="reset-token" {...resetForm.register("resetToken", { required: "El token es requerido." })} />
                </label>
                {resetForm.formState.errors.resetToken && <span className="field-error" role="alert">{resetForm.formState.errors.resetToken.message}</span>}
              </div>
              <div className="login-field-group">
                <label className="login-field-label" htmlFor="reset-password"><LockKeyhole size={14} />Nueva contrasena</label>
                <label className={`login-field${resetForm.formState.errors.newPassword ? " login-field--error" : ""}`}>
                  <input
                    id="reset-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimo 8, mayuscula, numero y simbolo"
                    {...resetForm.register("newPassword", { required: "La contrasena es requerida." })}
                  />
                </label>
                {resetForm.formState.errors.newPassword && <span className="field-error" role="alert">{resetForm.formState.errors.newPassword.message}</span>}
              </div>
            </>
          )}

          {message && <div className="success-banner" role="status">{message}</div>}
          {developmentToken && (
            <div className="login-dev-token">
              <span>Token de desarrollo</span>
              <code>{developmentToken}</code>
            </div>
          )}
          {loginForm.formState.errors.root && <div className="error-banner" role="alert">{loginForm.formState.errors.root.message}</div>}
          {recoveryForm.formState.errors.root && <div className="error-banner" role="alert">{recoveryForm.formState.errors.root.message}</div>}
          {resetForm.formState.errors.root && <div className="error-banner" role="alert">{resetForm.formState.errors.root.message}</div>}

          <button className="login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? <><span className="spin" style={{ display: "inline-block" }}>...</span><span>Procesando...</span></>
              : mode === "forgot"
                ? <><Send size={18} /><span>Enviar instrucciones</span></>
                : mode === "reset"
                  ? <><LockKeyhole size={18} /><span>Actualizar contrasena</span></>
                  : <><LogIn size={18} /><span>Iniciar sesion</span></>
            }
          </button>

          <div className="login-actions">
            {mode === "login" ? (
              <Link to="/forgot-password">Olvide mi contrasena</Link>
            ) : (
              <Link to="/login"><ArrowLeft size={14} /> Volver al login</Link>
            )}
            {mode === "forgot" && <Link to="/reset-password">Ya tengo un token</Link>}
          </div>
        </div>

        <p className="login-footer">
          Acceso exclusivo para personal autorizado. &copy; RAME POS
        </p>
      </form>
    </main>
  );
}
