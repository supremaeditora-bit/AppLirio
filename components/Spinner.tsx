
import React from 'react';

interface SpinnerProps {
  variant?: 'page' | 'button';
}

export default function Spinner({ variant = 'page' }: SpinnerProps) {
    if (variant === 'button') {
        return (
            <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-t-transparent"
                role="status"
                aria-label="carregando"
            ></div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-dourado-suave border-t-transparent"
                role="status"
                aria-label="carregando"
            ></div>
            <p className="font-serif text-xl text-dourado-suave">Carregando...</p>
        </div>
    );
}