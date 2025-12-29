import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Accessibility, 
  Eye, 
  Type, 
  Volume2, 
  Keyboard, 
  Hand, 
  Moon,
  ArrowLeft,
  Info,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ACCESSIBILITY_SHORTCUTS } from '@/hooks/useAccessibilityShortcuts';

const AccessibilityPage: React.FC = () => {
  const features = [
    {
      icon: Hand,
      title: 'VLibras - Tradução para Libras',
      description: 'Tradução automática de conteúdo para Língua Brasileira de Sinais através de um avatar 3D.',
      howToUse: [
        'Clique no ícone de VLibras na lateral direita da página',
        'O avatar aparecerá traduzindo o conteúdo selecionado',
        'Use Alt+V para ativar/desativar rapidamente',
      ],
      badge: 'Libras',
      badgeColor: 'bg-blue-500',
    },
    {
      icon: Type,
      title: 'Ajuste de Tamanho da Fonte',
      description: 'Aumente ou diminua o tamanho do texto em todo o site para facilitar a leitura.',
      howToUse: [
        'Abra o menu de acessibilidade (Alt+A)',
        'Use os botões A- e A+ ou o slider para ajustar',
        'O tamanho varia de 90% a 160% do original',
        'Use Alt++ para aumentar e Alt+- para diminuir',
      ],
      badge: '90% - 160%',
      badgeColor: 'bg-green-500',
    },
    {
      icon: Eye,
      title: 'Modo Alto Contraste',
      description: 'Aumenta o contraste das cores para melhor visibilidade, ideal para pessoas com baixa visão.',
      howToUse: [
        'Abra o menu de acessibilidade (Alt+A)',
        'Ative a opção "Alto Contraste"',
        'Ou use o atalho Alt+C',
      ],
      badge: 'Visibilidade',
      badgeColor: 'bg-yellow-500',
    },
    {
      icon: Type,
      title: 'Fonte para Dislexia',
      description: 'Utiliza a fonte OpenDyslexic, especialmente projetada para facilitar a leitura por pessoas com dislexia.',
      howToUse: [
        'Abra o menu de acessibilidade (Alt+A)',
        'Ative a opção "Fonte Disléxica"',
        'Todo o texto do site será alterado',
      ],
      badge: 'OpenDyslexic',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: Type,
      title: 'Espaçamento de Linha',
      description: 'Ajuste o espaço entre as linhas do texto para melhorar a legibilidade.',
      howToUse: [
        'Abra o menu de acessibilidade (Alt+A)',
        'Escolha entre Normal (1.0x), Relaxado (1.5x) ou Espaçoso (2.0x)',
      ],
      badge: '1.0x - 2.0x',
      badgeColor: 'bg-orange-500',
    },
    {
      icon: Volume2,
      title: 'Leitura em Áudio (Text-to-Speech)',
      description: 'Ouça o conteúdo da página em voz alta em português brasileiro.',
      howToUse: [
        'Abra o menu de acessibilidade (Alt+A)',
        'Clique em "Ler Página" para iniciar',
        'Use "Pausar/Continuar" para controlar a leitura',
        'Use Alt+L para iniciar/pausar rapidamente',
      ],
      badge: 'Português BR',
      badgeColor: 'bg-red-500',
    },
    {
      icon: Accessibility,
      title: 'Modo Leitor de Tela',
      description: 'Melhora a navegação por teclado com foco visual aprimorado e descrição de imagens.',
      howToUse: [
        'Ative o "Modo Leitor de Tela" no menu (Alt+R)',
        'Use a tecla H para navegar entre títulos',
        'Shift+H para voltar ao título anterior',
        'O foco visual será destacado com borda amarela',
      ],
      badge: 'Navegação',
      badgeColor: 'bg-teal-500',
    },
    {
      icon: Keyboard,
      title: 'Navegação Rápida (Skip Links)',
      description: 'Links invisíveis que aparecem ao pressionar Tab, permitindo pular diretamente para seções importantes.',
      howToUse: [
        'Pressione Tab ao carregar a página',
        'Escolha "Pular para conteúdo principal"',
        'Ou navegue para outras seções rapidamente',
      ],
      badge: 'Tab',
      badgeColor: 'bg-indigo-500',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Acessibilidade | ITL Brasil</title>
        <meta name="description" content="Conheça todos os recursos de acessibilidade disponíveis no site ITL Brasil, incluindo VLibras, ajuste de fonte, alto contraste e muito mais." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary-foreground/10 rounded-full">
                <Accessibility className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Acessibilidade</h1>
                <p className="text-primary-foreground/80 text-lg mt-2">
                  Nosso compromisso é tornar o conteúdo acessível a todas as pessoas
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="container mx-auto px-4 py-12">
          {/* Introdução */}
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Sobre nossa Acessibilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  O ITL Brasil está comprometido em garantir que nosso site seja acessível a todas as pessoas, 
                  independentemente de suas habilidades ou deficiências. Seguimos as diretrizes de acessibilidade 
                  WCAG 2.1 (Web Content Accessibility Guidelines) nível AA.
                </p>
                <p>
                  Abaixo você encontra a descrição de todos os recursos de acessibilidade disponíveis e como utilizá-los.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Recursos de Acessibilidade */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Recursos Disponíveis</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <Badge className={`${feature.badgeColor} text-white`}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">Como usar:</h4>
                    <ul className="space-y-2">
                      {feature.howToUse.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator className="my-8" />

          {/* Atalhos de Teclado */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Keyboard className="w-6 h-6 text-primary" />
              Atalhos de Teclado
            </h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-6">
                  Use os seguintes atalhos de teclado para acessar rapidamente as funções de acessibilidade. 
                  Todos os atalhos usam a tecla <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Alt</kbd> combinada com outra tecla.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {ACCESSIBILITY_SHORTCUTS.map((shortcut, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 bg-background border rounded text-sm font-mono shadow-sm">
                        Alt + {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                  
                  {/* Atalhos adicionais do modo leitor */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Próximo título (modo leitor)</span>
                    <kbd className="px-3 py-1.5 bg-background border rounded text-sm font-mono shadow-sm">
                      H
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Título anterior (modo leitor)</span>
                    <kbd className="px-3 py-1.5 bg-background border rounded text-sm font-mono shadow-sm">
                      Shift + H
                    </kbd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contato */}
          <section>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
                <CardDescription>
                  Se você encontrar alguma barreira de acessibilidade ou tiver sugestões de melhorias, 
                  entre em contato conosco.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link 
                  to="/contato"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Ir para página de contato
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </CardContent>
            </Card>
          </section>
        </main>

        {/* Footer simples */}
        <footer id="footer" className="bg-muted py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} ITL Brasil. Todos os direitos reservados.</p>
            <p className="mt-2 text-sm">
              Este site segue as diretrizes WCAG 2.1 Nível AA
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AccessibilityPage;
