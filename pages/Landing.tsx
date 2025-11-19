import React from 'react';
import { Page } from '../types';
import { BookOpenIcon, UsersIcon, ChartPieIcon, AcademicCapIcon } from '../components/Icons';
import Button from '../components/Button';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

const Feature: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: IconComponent, title, children }) => (
    <div className="text-center p-6 bg-creme-velado dark:bg-verde-escuro-profundo rounded-xl shadow-lg transition-transform hover:scale-105">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-dourado-suave/20 rounded-full text-dourado-suave">
            <IconComponent className="w-8 h-8" />
        </div>
        <h4 className="font-serif text-xl font-bold text-verde-mata dark:text-dourado-suave">{title}</h4>
        <p className="mt-2 font-sans text-marrom-seiva/80 dark:text-creme-velado/80">{children}</p>
    </div>
);

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="bg-creme-velado dark:bg-verde-escuro-profundo text-marrom-seiva dark:text-creme-velado min-h-screen font-sans">
      {/* Header */}
      <header className="p-4 sm:p-6 flex justify-between items-center absolute w-full z-10">
        <div className="flex items-center space-x-2">
           <span className="text-3xl" aria-label="Lírios do Vale">🌸</span>
           <h1 className="font-serif text-2xl font-bold text-white drop-shadow-lg">Lírios do Vale</h1>
        </div>
        <nav className="space-x-2 sm:space-x-4">
           <Button 
             onClick={() => onNavigate('login')} 
             variant="secondary" 
             className="!py-2 !px-5 !bg-transparent border-2 border-white/80 !text-white hover:!bg-white/20"
           >
             Entrar
           </Button>
           <Button onClick={() => onNavigate('signup')} className="!py-2 !px-5">Criar Conta</Button>
        </nav>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="relative flex flex-col justify-end text-center min-h-screen text-white">
            <div className="absolute inset-0">
                <img 
                    src="https://images.unsplash.com/photo-1508542384958-3e4b3e21e612?q=80&w=1770&auto=format&fit=crop" 
                    alt="Caminho de fé iluminado pelo sol" 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-verde-escuro-profundo/80 via-transparent to-black/60"></div>
            </div>
            <div className="relative z-10 p-4 pb-24 sm:pb-32">
              <h2 className="font-serif text-5xl md:text-7xl font-black text-white leading-tight drop-shadow-lg">Sua Jornada Espiritual,</h2>
              <h3 className="font-serif text-4xl md:text-6xl font-bold text-dourado-suave mt-2 drop-shadow-md">Acolhida e Guiada.</h3>
              <p className="max-w-2xl mx-auto mt-6 text-lg text-white/90 drop-shadow">
                Uma comunidade de fé para mulheres que buscam sabedoria cristã prática para a vida diária. Encontre devocionais, mentorias e um lugar seguro para crescer.
              </p>
              <div className="mt-8">
                 <Button onClick={() => onNavigate('signup')} className="!py-3 !px-8 !text-lg">
                   Comece sua jornada gratuitamente
                 </Button>
              </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-branco-nevoa dark:bg-verde-mata px-4">
            <div className="container mx-auto max-w-5xl">
                <h3 className="font-serif text-4xl font-bold text-center text-verde-mata dark:text-dourado-suave mb-12">Um Oásis para sua Alma</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Feature icon={BookOpenIcon} title="Devocionais Diários">
                        Comece seu dia com reflexões inspiradoras para fortalecer seu espírito.
                    </Feature>
                    <Feature icon={ChartPieIcon} title="Mentorias Guiadas">
                        Cursos e conteúdos práticos para guiar sua jornada em diversas áreas da vida.
                    </Feature>
                     <Feature icon={UsersIcon} title="Comunidade de Fé">
                        Um espaço seguro para compartilhar testemunhos, pedir orações e estudar a Palavra.
                    </Feature>
                    <Feature icon={AcademicCapIcon} title="Planos de Leitura">
                        Aprofunde seu conhecimento bíblico com planos de estudo estruturados e guiados.
                    </Feature>
                </div>
            </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 px-4">
            <div className="text-center max-w-3xl mx-auto">
                <p className="font-serif text-3xl text-verde-mata dark:text-dourado-suave leading-relaxed">
                  "Encontrei na ELV um porto seguro. Um lugar onde sou ouvida, encorajada e onde minha fé é fortalecida todos os dias. É uma bênção!"
                </p>
                <p className="mt-6 font-semibold text-marrom-seiva dark:text-creme-velado/90">— Ana Sofia, Aluna</p>
            </div>
        </section>
        
        {/* Final CTA */}
        <section className="py-20 px-4 bg-verde-mata dark:bg-verde-escuro-profundo text-center">
           <h3 className="font-serif text-4xl font-bold text-dourado-suave">Junte-se à nossa comunidade</h3>
           <p className="max-w-xl mx-auto mt-4 text-lg text-creme-velado/90">
                Faça parte de uma comunidade de mulheres que se apoiam, oram juntas e crescem na Palavra.
           </p>
           <div className="mt-8">
                <Button onClick={() => onNavigate('signup')} className="!py-3 !px-8 !text-lg">
                    Crie sua conta agora
                </Button>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
          <p className="font-sans text-sm text-marrom-seiva/70 dark:text-creme-velado/70">&copy; {new Date().getFullYear()} Escola Lírios do Vale. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}