
import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { loginWithEmail, sendPasswordResetEmail } from '../services/authService';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { SunIcon, MoonIcon } from '../components/Icons';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { useTheme } from '../hooks/useTheme';

interface LoginProps {
  onNavigate: (page: Page) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { setTheme, theme, toggleTheme } = useTheme();

  // State for password reset modal
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);

  useEffect(() => {
      // Force light mode ONLY when the login page first loads/mounts.
      // Empty dependency array [] ensures this runs once and doesn't loop when theme changes.
      setTheme('light');
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      // onLogin is no longer needed, App will react to auth state change
    } catch (err: any) {
        if (err.message.includes("Email logins are disabled")) {
            setError('O login por e-mail está desativado.');
        } else if (err.message.includes("Invalid login credentials")) {
            setError('Credenciais inválidas. Verifique seu e-mail e senha.');
        } else {
            setError('Ocorreu um erro ao tentar fazer login.');
        }
    }
    setIsLoading(false);
  };

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
            setResetError('A recuperação de senha por e-mail está desativada.');
        } else {
            setResetError('Não foi possível enviar o link. Verifique se o e-mail está correto.');
        }
    }
    setIsSendingResetLink(false);
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-creme-velado dark:bg-verde-escuro-profundo p-4 relative transition-colors duration-300">
        
        {/* Theme Toggle Button */}
        <button 
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10 transition-colors z-10"
            aria-label="Alternar tema"
        >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>

        <div className="w-full max-w-md mx-auto bg-branco-nevoa dark:bg-verde-mata p-8 rounded-2xl shadow-2xl transition-colors duration-300">
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
