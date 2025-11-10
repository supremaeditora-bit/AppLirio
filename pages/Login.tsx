
import React, { useState } from 'react';
import { Page } from '../types';
import { loginWithEmail, loginWithGoogle, sendPasswordResetEmail } from '../services/authService';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { GoogleIcon } from '../components/Icons';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';

interface LoginProps {
  onNavigate: (page: Page) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for password reset modal
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      // onLogin is no longer needed, App will react to auth state change
    } catch (err: any) {
        if (err.message.includes("Email logins are disabled")) {
            setError('O login por e-mail está desativado. Por favor, tente fazer login com o Google.');
        } else if (err.message.includes("Invalid login credentials")) {
            setError('Credenciais inválidas. Verifique seu e-mail e senha.');
        } else {
            setError('Ocorreu um erro ao tentar fazer login.');
        }
    }
    setIsLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
        await loginWithGoogle();
    } catch (err) {
        setError('Falha no login com o Google.');
    }
    setIsLoading(false);
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingResetLink(true);
    setResetError('');
    setResetSuccess('');
    try {
        await sendPasswordResetEmail(resetEmail);
        setResetSuccess('Link de redefinição enviado! Verifique sua caixa de entrada e pasta de spam.');
    } catch (err: any) {
        if (err.message.includes("Email logins are disabled")) {
            setResetError('A recuperação de senha por e-mail está desativada. Por favor, tente fazer login com o Google.');
        } else {
            setResetError('Não foi possível enviar o link. Verifique se o e-mail está correto.');
        }
    }
    setIsSendingResetLink(false);
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-creme-velado dark:bg-verde-escuro-profundo p-4">
        <div className="w-full max-w-md mx-auto bg-branco-nevoa dark:bg-verde-mata p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
              <span className="text-6xl text-dourado-suave">🌸</span>
              <h1 className="font-serif text-4xl font-bold mt-3 text-verde-mata dark:text-dourado-suave">Bem-vinda de volta</h1>
              <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2">Acesse sua conta para continuar sua jornada.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <InputField id="email" label="Seu Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="space-y-1">
              <InputField id="password" label="Sua Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <div className="text-right">
                <button
                    type="button"
                    onClick={() => {
                      setResetError('');
                      setResetSuccess('');
                      setResetEmail(email);
                      setIsForgotPasswordModalOpen(true);
                    }}
                    className="font-sans text-sm font-semibold text-dourado-suave hover:underline focus:outline-none"
                >
                    Esqueci a senha
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? <Spinner variant="button" /> : 'Entrar'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-marrom-seiva/20 dark:border-creme-velado/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-branco-nevoa dark:bg-verde-mata font-sans text-marrom-seiva/70 dark:text-creme-velado/70">OU</span>
            </div>
          </div>

          <Button variant="secondary" fullWidth onClick={handleGoogleLogin} disabled={isLoading}>
            <GoogleIcon />
            <span className="ml-3">Continuar com Google</span>
          </Button>
          
          <p className="text-center font-sans text-sm mt-8 text-marrom-seiva dark:text-creme-velado/80">
              Não tem uma conta?{' '}
              <button onClick={() => onNavigate('signup')} className="font-bold text-dourado-suave hover:underline">
                  Cadastre-se
              </button>
          </p>
        </div>
      </div>
      <Modal isOpen={isForgotPasswordModalOpen} onClose={() => setIsForgotPasswordModalOpen(false)} title="Redefinir Senha">
          {resetSuccess ? (
              <div className="text-center">
                  <p className="text-green-600 dark:text-green-400">{resetSuccess}</p>
                  <Button onClick={() => setIsForgotPasswordModalOpen(false)} className="mt-4">Fechar</Button>
              </div>
          ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                  <p className="font-sans text-sm text-marrom-seiva dark:text-creme-velado/80">
                      Digite seu e-mail e enviaremos um link para você redefinir sua senha.
                  </p>
                  <InputField
                      id="reset-email"
                      label="Seu Email"
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      required
                      autoFocus
                  />
                  {resetError && <p className="text-red-500 text-sm">{resetError}</p>}
                  <div className="flex justify-end gap-4 pt-4">
                      <Button type="button" variant="secondary" onClick={() => setIsForgotPasswordModalOpen(false)} disabled={isSendingResetLink}>
                          Cancelar
                      </Button>
                      <Button type="submit" disabled={isSendingResetLink}>
                          {isSendingResetLink ? <Spinner variant="button" /> : 'Enviar Link'}
                      </Button>
                  </div>
              </form>
          )}
      </Modal>
    </>
  );
}