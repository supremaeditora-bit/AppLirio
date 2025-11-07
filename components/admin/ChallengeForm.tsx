import React, { useState, useEffect } from 'react';
import { Challenge } from '../../types';
import { createChallenge, updateChallenge } from '../../services/api';
import Modal from '../Modal';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';

interface ChallengeFormProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
}

const initialFormData = {
    title: '',
    description: '',
    points: 10,
};

export default function ChallengeForm({ isOpen, onClose, challenge }: ChallengeFormProps) {
  const [formData, setFormData] = useState<Partial<Challenge>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!challenge;

  useEffect(() => {
    if (isOpen) {
      setFormData(challenge || initialFormData);
    }
  }, [challenge, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
        if (isEditing && challenge) {
            await updateChallenge(challenge.id, formData);
        } else {
            await createChallenge(formData as Omit<Challenge, 'id' | 'createdAt'>);
        }
        onClose();
    } catch (error) {
        console.error("Failed to save challenge", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Desafio' : 'Novo Desafio'}>
      <div className="space-y-4">
        <InputField id="title" label="Título do Desafio" value={formData.title || ''} onChange={handleChange} required />
        <InputField id="description" label="Descrição" type="textarea" value={formData.description || ''} onChange={handleChange} required />
        <InputField id="points" label="Pontos de Recompensa" type="number" value={formData.points || ''} onChange={handleChange} required />
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <Spinner variant="button" /> : 'Salvar'}
        </Button>
      </div>
    </Modal>
  );
}