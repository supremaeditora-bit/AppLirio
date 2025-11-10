
import React from 'react';
import { User } from '../types';

interface MyGardenProps {
    user: User;
}

const MyGarden: React.FC<MyGardenProps> = ({ user }) => {
    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave mb-4">Meu Jardim</h1>
            <div className="bg-branco-nevoa dark:bg-verde-mata p-8 rounded-xl text-center">
                <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80">
                    Esta funcionalidade está em desenvolvimento. Em breve, você poderá cultivar seu jardim espiritual aqui!
                </p>
            </div>
        </div>
    );
};

export default MyGarden;
