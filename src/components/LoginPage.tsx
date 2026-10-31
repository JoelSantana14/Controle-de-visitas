import React, { useState } from 'react';
import { useAuth, MASTER_ADMIN_EMAIL, DEFAULT_INITIAL_PASSWORD } from '../contexts/AuthContext';
import { Home, Lock, Mail, Eye, EyeOff, LogIn, ShieldCheck, Sparkles, AlertCircle, KeyRound, CheckCircle2, X, ArrowLeft } from 'lucide-react';
import { ThemeMode } from '../types';

interface LoginPageProps {
  theme?: ThemeMode;
}

export const LoginPage: React.FC<LoginPageProps> = ({ theme = 'bordo' }) => {
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState<string | null>(null);
  const [recoveryErrorMsg, setRecoveryErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.error || 'Falha ao autenticar.');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setRecoveryErrorMsg(null);
    const result = await loginWithGoogle();
    if (!result.success) {
      setErrorMessage(result.error || 'Erro no login com Google.');
      setRecoveryErrorMsg(result.error || 'Erro no login com Google.');
    } else {
      setIsForgotModalOpen(false);
    }
    setIsLoading(false);
  };

  const handleSendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setRecoveryErrorMsg('Por favor, digite seu e-mail para receber o link.');
      return;
    }

    setIsSendingRecovery(true);
    setRecoveryErrorMsg(null);
    setRecoverySuccessMsg(null);

    const result = await resetPassword(recoveryEmail);
    if (result.success) {
      setRecoverySuccessMsg(result.message || 'E-mail de recuperação enviado com sucesso!');
    } else {
      setRecoveryErrorMsg(result.error || 'Não foi possível enviar o e-mail de recuperação.');
    }
    setIsSendingRecovery(false);
  };

  const fillAdmin = () => {
    setEmail(MASTER_ADMIN_EMAIL);
    setPassword(DEFAULT_INITIAL_PASSWORD);
  };

  const openForgotPassword = () => {
    setRecoveryEmail(email.trim() || MASTER_ADMIN_EMAIL);
    setRecoverySuccessMsg(null);
    setRecoveryErrorMsg(null);
    setIsForgotModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-950 via-rose-900 to-rose-700 text-white shadow-xl shadow-rose-950/40 mb-3 border border-rose-700/50">
            <Home className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            ImmoFlow
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
              CRM Imobiliário
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão integrada de leads, plantão, crédito e vendas
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          <div className="mb-6 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              Acesso ao Sistema
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Entre com seu e-mail cadastrado e senha para continuar.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@imob.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium underline transition-colors cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Senha padrão inicial: <code className="text-slate-300 bg-slate-800 px-1 py-0.2 rounded font-mono font-bold">Immo123!</code></span>
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-rose-400 hover:underline"
                >
                  Não lembra da senha?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no ImmoFlow</span>
                </>
              )}
            </button>
          </form>

          {/* Google Sign-in Divider */}
          <div className="mt-5 pt-5 border-t border-slate-800 flex flex-col gap-3">
            <div className="text-center text-[11px] text-slate-400">
              Ou acesse instantaneamente sem senha:
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Entrar com conta Google ({MASTER_ADMIN_EMAIL.split('@')[0]})</span>
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Contas @gmail.com autenticam diretamente com 1 clique.
            </p>
          </div>

          {/* Help & Fast Access Box */}
          <div className="mt-6 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Acesso Seguro ImmoFlow</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>Administrador Master:</strong> Acesso irrestrito a todos os clientes, corretores e configurações globais.
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>Corretor:</strong> Acesso restrito exclusivamente aos clientes e atendimentos atribuídos a você.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
              >
                Preencher {MASTER_ADMIN_EMAIL.split('@')[0]}
              </button>
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          ImmoFlow CRM &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados
        </div>

      </div>

      {/* MODAL: ESQUECI MINHA SENHA */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Recuperação de Senha
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Redefina o acesso à sua conta ImmoFlow
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Feedback */}
            {recoverySuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>E-mail Enviado com Sucesso!</span>
                </div>
                <p className="leading-relaxed text-[11px] text-emerald-200/90">
                  {recoverySuccessMsg}
                </p>
                <p className="text-[11px] text-emerald-300 font-medium">
                  💡 Caso não encontre na Caixa de Entrada, confira também sua pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
                </p>
              </div>
            )}

            {/* Error Feedback */}
            {recoveryErrorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{recoveryErrorMsg}</span>
              </div>
            )}

            {!recoverySuccessMsg ? (
              <form onSubmit={handleSendRecoveryEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail Cadastrado
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="seu.email@imob.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enviaremos um link de uso único oficial do Firebase para você criar sua nova senha.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingRecovery}
                    className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSendingRecovery ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <span>Enviar Link de Recuperação</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  Voltar para Tela de Login
                </button>
              </div>
            )}

            {/* Google Shortcut */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Deseja entrar agora sem precisar redefinir a senha?</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Como seu e-mail de administrador ({MASTER_ADMIN_EMAIL}) é uma conta Google/Gmail, você pode entrar instantaneamente:
              </p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Acessar Imediatamente com Conta Google</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
