
import React from 'react';
import { Event, User } from '../types';
import Modal from './Modal';
import { CalendarDaysIcon } from './Icons';

const QrCodePlaceholder: React.FC = () => (
  <svg viewBox="0 0 256 256" className="w-full h-full">
    <rect width="256" height="256" fill="white" />
    <rect x="32" y="32" width="64" height="64" fill="black" />
    <rect x="48" y="48" width="32" height="32" fill="white" />
    <rect x="160" y="32" width="64" height="64" fill="black" />
    <rect x="176" y="48" width="32" height="32" fill="white" />
    <rect x="32" y="160" width="64" height="64" fill="black" />
    <rect x="48" y="176" width="32" height="32" fill="white" />
    <path fill="black" d="M128 128h16v16h-16zm32 0h16v16h-16zm-32 32h16v16h-16zm32 0h16v16h-16zm32-32h16v16h-16zm-32 32h16v16h-16zm0-64h16v16h-16zm32 0h16v16h-16zm-64 64h16v16h-16zM96 96h16v16H96zm32 0h16v16h-16zm32 0h16v16h-16zm32 0h16v16h-16zM96 128h16v16H96zm0 32h16v16H96zm0-64h16v16H96zM32 128h16v16H32zm32 0h16v16H64zm-32 32h16v16H32zm32 0h16v16H64zm-32-64h16v16H32zm32 0h16v16H64zM128 96h16v16h-16zm32 64h16v16h-16zm32-32h16v16h-16zm0 32h16v16h-16z" />
  </svg>
);

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  user: User;
}

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, event, user }) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seu Ingresso Digital">
      <div className="bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg p-6 font-sans relative overflow-hidden border-2 border-dourado-suave">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-branco-nevoa dark:bg-verde-mata rounded-full border-2 border-dourado-suave"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 bg-branco-nevoa dark:bg-verde-mata rounded-full border-2 border-dourado-suave"></div>
        
        <div className="text-center border-b-2 border-dashed border-marrom-seiva/30 dark:border-creme-velado/30 pb-4">
          <p className="uppercase tracking-widest text-dourado-suave font-bold">Escola Lírios do Vale</p>
          <h3 className="font-serif text-2xl font-bold text-verde-mata dark:text-creme-velado mt-2">{event.title}</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-2 space-y-3">
            <div>
              <p className="text-xs uppercase font-semibold text-marrom-seiva/70 dark:text-creme-velado/70">Nome</p>
              <p className="font-semibold text-verde-mata dark:text-creme-velado">{user.fullName}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-marrom-seiva/70 dark:text-creme-velado/70">Data e Hora</p>
              <p className="font-semibold text-verde-mata dark:text-creme-velado">{formattedDate} às {formattedTime}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-marrom-seiva/70 dark:text-creme-velado/70">Local</p>
              <p className="font-semibold text-verde-mata dark:text-creme-velado">{event.location}</p>
            </div>
          </div>
          <div className="col-span-1 p-2 bg-white rounded-md flex items-center justify-center">
            <QrCodePlaceholder />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TicketModal;