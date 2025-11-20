
import React, { useState } from 'react';
import Modal from './Modal';
import { AppearanceSettings } from '../types';

interface FooterProps {
    appearanceSettings?: AppearanceSettings | null;
}

export default function Footer({ appearanceSettings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'contact' | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
    <footer className="w-full py-8 px-4 mt-auto border-t border-marrom-seiva/10 dark:border-creme-velado/10 bg-creme-velado dark:bg-verde-escuro-profundo text-marrom-seiva dark:text-creme-velado transition-colors duration-300">
      <div className="container mx-auto flex flex-col items-center justify-center space-y-4">
        <div className="text-center">
            <p className="font-serif text-lg font-bold text-verde-mata dark:text-dourado-suave">Escola Lírios do Vale</p>
            <p className="text-xs mt-1 italic">“Floresça no Vale, terra santa, regada pelo céu.”</p>
        </div>
        
        <div className="flex space-x-6 text-sm font-sans">
            <button onClick={() => setActiveModal('terms')} className="hover:text-dourado-suave transition-colors bg-transparent border-none cursor-pointer">Termos de Uso</button>
            <button onClick={() => setActiveModal('privacy')} className="hover:text-dourado-suave transition-colors bg-transparent border-none cursor-pointer">Privacidade</button>
            <button onClick={() => setActiveModal('contact')} className="hover:text-dourado-suave transition-colors bg-transparent border-none cursor-pointer">Contato</button>
        </div>

        <div className="text-center text-xs text-marrom-seiva/60 dark:text-creme-velado/60">
          <p>&copy; {currentYear} Escola Lírios do Vale. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>

    {/* Modals */}
    <Modal isOpen={activeModal === 'terms'} onClose={closeModal} title="Termos de Uso">
        <div className="prose dark:prose-invert max-w-none font-sans text-sm whitespace-pre-wrap">
            {appearanceSettings?.termsOfUse || "Conteúdo dos termos de uso não disponível."}
        </div>
    </Modal>

    <Modal isOpen={activeModal === 'privacy'} onClose={closeModal} title="Política de Privacidade">
        <div className="prose dark:prose-invert max-w-none font-sans text-sm whitespace-pre-wrap">
            {appearanceSettings?.privacyPolicy || "Conteúdo da política de privacidade não disponível."}
        </div>
    </Modal>

    <Modal isOpen={activeModal === 'contact'} onClose={closeModal} title="Contato">
         <div className="prose dark:prose-invert max-w-none font-sans text-sm whitespace-pre-wrap">
            {appearanceSettings?.contactInfo || "Informações de contato não disponíveis."}
        </div>
    </Modal>
    </>
  );
}
