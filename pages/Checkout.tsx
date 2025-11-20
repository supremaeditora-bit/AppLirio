
import React, { useState, useEffect } from 'react';
import { User, Event, Page } from '../types';
import { getEventById, registerForEvent, getAppearanceSettings } from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { CreditCardIcon, CheckCircleIcon, ChevronLeftIcon, LockClosedIcon } from '../components/Icons';

interface CheckoutProps {
    itemId?: string | null; // Se null, assume assinatura da plataforma
    user: User | null;
    onNavigate: (page: Page, id?: string) => void;
}

export default function Checkout({ itemId, user, onNavigate }: CheckoutProps) {
    const [item, setItem] = useState<Event | { title: string; price: number; description: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    
    useEffect(() => {
        const fetchItem = async () => {
            setIsLoading(true);
            if (itemId === 'book-launch') {
                // Fetch book details from settings
                const settings = await getAppearanceSettings();
                setItem({
                    title: settings.bookLaunch?.bookTitle || "Livro - Lançamento",
                    price: settings.bookLaunch?.bookPrice || 49.90,
                    description: settings.bookLaunch?.bookSubtitle || "Lançamento Exclusivo"
                });
            } else if (itemId) {
                // Assume it's an event for now
                const eventData = await getEventById(itemId);
                setItem(eventData);
            } else {
                // Platform Access / Subscription
                setItem({
                    title: "Acesso Anual - Escola Lírios do Vale",
                    price: 299.90,
                    description: "Acesso completo a todos os cursos, mentorias e devocionais por 1 ano."
                });
            }
            setIsLoading(false);
        };
        fetchItem();
    }, [itemId]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !item) return;
        
        setIsProcessing(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            if (itemId && itemId !== 'book-launch') {
                // It's an event, register the user
                await registerForEvent(itemId, user.id);
            }
            // For subscription or book purchase, we would call an API to update user status or record purchase
            
            setIsSuccess(true);
        } catch (error) {
            console.error("Payment failed", error);
            alert("Ocorreu um erro no processamento do pagamento. Tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (!item) {
        return <div className="text-center p-8">Item não encontrado.</div>;
    }

    if (isSuccess) {
        return (
            <div className="container mx-auto p-4 h-full flex items-center justify-center">
                <div className="bg-branco-nevoa dark:bg-verde-mata p-8 rounded-2xl shadow-2xl text-center max-w-md w-full animate-scale-in">
                    <div className="text-green-500 mb-4 flex justify-center">
                        <CheckCircleIcon className="w-20 h-20" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave mb-2">Pagamento Confirmado!</h2>
                    <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mb-6">
                        Sua compra de <strong>{item.title}</strong> foi realizada com sucesso. Você receberá um e-mail com os detalhes.
                    </p>
                    <Button onClick={() => onNavigate('home')} fullWidth>Voltar para o Início</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
            <button onClick={() => onNavigate('home')} className="flex items-center text-sm font-sans text-marrom-seiva/70 dark:text-creme-velado/70 hover:text-dourado-suave mb-6">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Cancelar e Voltar
            </button>

            <h1 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave mb-8 flex items-center gap-3">
                <CreditCardIcon className="w-8 h-8" /> Checkout Seguro
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg h-fit">
                    <h3 className="font-serif text-xl font-semibold mb-4 text-marrom-seiva dark:text-creme-velado">Resumo do Pedido</h3>
                    <div className="border-b border-marrom-seiva/10 dark:border-creme-velado/10 pb-4 mb-4">
                        <p className="font-bold text-lg text-verde-mata dark:text-creme-velado">{item.title}</p>
                        <p className="text-sm text-marrom-seiva/70 dark:text-creme-velado/70 mt-1">{item.description}</p>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span className="text-dourado-suave">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="mt-6 p-3 bg-dourado-suave/10 rounded-lg flex items-start gap-3 text-xs text-marrom-seiva/80 dark:text-creme-velado/80">
                        <LockClosedIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Pagamento processado em ambiente seguro. Seus dados estão protegidos.</p>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-creme-velado dark:bg-verde-escuro-profundo p-6 rounded-2xl border-2 border-marrom-seiva/10 dark:border-creme-velado/10">
                    <h3 className="font-serif text-xl font-semibold mb-6 text-marrom-seiva dark:text-creme-velado">Dados do Pagamento</h3>
                    <form onSubmit={handlePayment} className="space-y-4">
                        <InputField 
                            id="cardName" 
                            label="Nome no Cartão" 
                            placeholder="Como impresso no cartão" 
                            value={cardName} 
                            onChange={(e) => setCardName(e.target.value)} 
                            required 
                        />
                        <InputField 
                            id="cardNumber" 
                            label="Número do Cartão" 
                            placeholder="0000 0000 0000 0000" 
                            value={cardNumber} 
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} 
                            required 
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField 
                                id="expiry" 
                                label="Validade" 
                                placeholder="MM/AA" 
                                value={expiry} 
                                onChange={(e) => setExpiry(e.target.value)} 
                                required 
                            />
                            <InputField 
                                id="cvc" 
                                label="CVC" 
                                placeholder="123" 
                                value={cvc} 
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                                required 
                            />
                        </div>
                        
                        <div className="pt-4">
                            <Button type="submit" fullWidth disabled={isProcessing}>
                                {isProcessing ? <Spinner variant="button" /> : `Pagar R$ ${item.price.toFixed(2).replace('.', ',')}`}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
