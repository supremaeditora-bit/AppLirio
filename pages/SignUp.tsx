import React, { useState } from 'react';
import { Page } from '../types';
import { signupWithEmail, loginWithGoogle } from '../services/authService';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { GoogleIcon } from '../components/Icons';
import Spinner from '../components/Spinner';

interface SignUpProps {
  onNavigate: (page: Page) => void;
}

export default function SignUp({ onNavigate }: SignUpProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsSuccess(false);
    try {
        await signupWithEmail(displayName, email, password);
        setIsSuccess(true);
    } catch (err: any) {
        if (err.message.includes("User already registered")) {
            setError("Este e-mail já está cadastrado. Tente fazer login.");
        } else if (err.message.includes("Password should be at least 6 characters")) {
            setError("A senha deve ter pelo menos 6 caracteres.");
        } else {
            setError('Não foi possível criar a conta. Tente novamente.');
        }
    }
    setIsLoading(false);
  };
  
   const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
        await loginWithGoogle();
    } catch(err) {
      setError('Falha no login com o Google.');
    }
    setIsLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-creme-velado dark:bg-verde-escuro-profundo p-4">
      <div className="w-full max-w-md mx-auto bg-branco-nevoa dark:bg-verde-mata p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
            <span className="text-6xl text-dourado-suave">🌸</span>
            <h1 className="font-serif text-4xl font-bold mt-3 text-verde-mata dark:text-dourado-suave">Crie sua Conta</h1>
            <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2">Junte-se à nossa comunidade e comece sua jornada.</p>
        </div>

        {isSuccess ? (
            <div className="text-center p-4 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg">
                <h3 className="font-bold">Cadastro realizado com sucesso!</h3>
                <p className="text-sm mt-2">Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada para ativar sua conta.</p>
            </div>
        ) : (
            <>
                <form onSubmit={handleSignUp} className="space-y-6">
                <InputField id="displayName" label="Seu Nome" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
                <InputField id="email" label="Seu Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <InputField id="password" label="Crie uma Senha (mín. 6 caracteres)" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button type="submit" fullWidth disabled={isLoading}>
                    {isLoading ? <Spinner variant="button" /> : 'Criar Conta'}
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
            </>
        )}

        <p className="text-center font-sans text-sm mt-8 text-marrom-seiva dark:text-creme-velado/80">
            Já tem uma conta?{' '}
            <button onClick={() => onNavigate('login')} className="font-bold text-dourado-suave hover:underline">
                Entrar
            </button>
        </p>
      </div>
    </div>
  );
}