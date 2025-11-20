
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, QuestionMarkCircleIcon, PencilIcon, PlusIcon, TrashIcon } from '../components/Icons';
import { User, FAQItem as FAQItemType } from '../types';
import { getAppearanceSettings, updateAppearanceSettings } from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Modal from '../components/Modal';
import InputField from '../components/InputField';

interface FAQProps {
    user?: User | null;
}

const FAQItemDisplay: React.FC<{ item: FAQItemType, canManage: boolean, onEdit: (item: FAQItemType) => void, onDelete: (id: string) => void }> = ({ item, canManage, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-marrom-seiva/10 dark:border-creme-velado/10 last:border-none">
            <div className="flex items-center justify-between w-full group">
                 <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="flex-1 flex items-center justify-between py-4 text-left focus:outline-none"
                >
                    <span className={`font-serif text-lg font-semibold transition-colors ${isOpen ? 'text-dourado-suave' : 'text-verde-mata dark:text-creme-velado group-hover:text-dourado-suave'}`}>
                        {item.question}
                    </span>
                    <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''} text-marrom-seiva dark:text-creme-velado ml-4`}>
                        <ChevronRightIcon className="w-5 h-5" />
                    </div>
                </button>
                
                {canManage && (
                     <div className="flex items-center space-x-2 ml-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(item)} className="p-2 hover:bg-dourado-suave/10 rounded-full text-marrom-seiva dark:text-creme-velado"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-full text-red-500"><TrashIcon className="w-4 h-4" /></button>
                     </div>
                )}
            </div>
           
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 leading-relaxed">
                    {item.answer}
                </p>
            </div>
        </div>
    );
};

export default function FAQ({ user }: FAQProps) {
    const [faqItems, setFaqItems] = useState<FAQItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FAQItemType | null>(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const fetchFAQ = async () => {
            setIsLoading(true);
            try {
                const settings = await getAppearanceSettings();
                setFaqItems(settings.faq || []);
            } catch (error) {
                console.error("Failed to fetch FAQ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFAQ();
    }, []);

    const handleOpenForm = (item: FAQItemType | null) => {
        setEditingItem(item);
        setQuestion(item?.question || '');
        setAnswer(item?.answer || '');
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        if (!question.trim() || !answer.trim()) return;
        setIsSaving(true);
        try {
            let newItems = [...faqItems];
            if (editingItem) {
                newItems = newItems.map(i => i.id === editingItem.id ? { ...i, question, answer } : i);
            } else {
                newItems.push({ id: crypto.randomUUID(), question, answer });
            }
            
            await updateAppearanceSettings({ faq: newItems });
            setFaqItems(newItems);
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to save FAQ", error);
            alert("Erro ao salvar FAQ. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta pergunta?")) {
             try {
                const newItems = faqItems.filter(i => i.id !== id);
                await updateAppearanceSettings({ faq: newItems });
                setFaqItems(newItems);
            } catch (error) {
                console.error("Failed to delete FAQ", error);
                alert("Erro ao excluir pergunta.");
            }
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-3xl min-h-full">
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-dourado-suave/20 rounded-full text-dourado-suave">
                        <QuestionMarkCircleIcon className="w-10 h-10" />
                    </div>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-verde-mata dark:text-dourado-suave">Dúvidas Frequentes</h1>
                <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2">
                    Encontre respostas para as perguntas mais comuns sobre nossa escola.
                </p>
                
                {isAdmin && (
                    <Button onClick={() => handleOpenForm(null)} className="mt-6 mx-auto">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Pergunta
                    </Button>
                )}
            </div>

            <div className="bg-branco-nevoa dark:bg-verde-mata p-6 sm:p-8 rounded-2xl shadow-lg">
                {faqItems.length > 0 ? (
                    faqItems.map((item) => (
                        <FAQItemDisplay 
                            key={item.id} 
                            item={item} 
                            canManage={isAdmin} 
                            onEdit={handleOpenForm} 
                            onDelete={handleDelete} 
                        />
                    ))
                ) : (
                    <p className="text-center text-marrom-seiva/70 dark:text-creme-velado/70">Nenhuma pergunta frequente cadastrada.</p>
                )}
            </div>
            
            <div className="text-center mt-8">
                <p className="text-sm text-marrom-seiva/70 dark:text-creme-velado/70">
                    Ainda tem dúvidas? <a href="mailto:contato@escolaliriosdovale.com" className="text-dourado-suave font-bold hover:underline">Entre em contato conosco</a>.
                </p>
            </div>

            {/* Edit/Add Modal */}
            {isAdmin && (
                <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingItem ? "Editar Pergunta" : "Nova Pergunta"}>
                    <div className="space-y-4">
                        <InputField 
                            id="question" 
                            label="Pergunta" 
                            value={question} 
                            onChange={(e) => setQuestion(e.target.value)} 
                            placeholder="Ex: Como cancelo minha assinatura?"
                        />
                        <InputField 
                            id="answer" 
                            label="Resposta" 
                            type="textarea"
                            value={answer} 
                            onChange={(e) => setAnswer(e.target.value)} 
                            placeholder="Digite a resposta detalhada..."
                            className="h-32"
                        />
                        <div className="flex justify-end gap-4 mt-6">
                            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isSaving}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Spinner variant="button" /> : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
