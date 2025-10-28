import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      content: "Av. Paulista, 1000 - Conjunto 123\nSão Paulo, SP - CEP 01310-100"
    },
    {
      icon: Phone,
      title: "Telefone",
      content: "+55 (11) 3456-7890\nWhatsApp: +55 (11) 99999-9999"
    },
    {
      icon: Mail,
      title: "E-mail",
      content: "contato@itlbrasil.com.br\nredacao@itlbrasil.com.br"
    },
    {
      icon: Clock,
      title: "Horário de Funcionamento",
      content: "Segunda a Sexta: 9h às 18h\nSábado: 9h às 13h"
    }
  ];

  const departments = [
    {
      name: "Redação",
      email: "redacao@itlbrasil.com.br",
      description: "Para sugestões de pautas, releases e material jornalístico"
    },
    {
      name: "Comercial",
      email: "comercial@itlbrasil.com.br",
      description: "Para parcerias, publicidade e oportunidades comerciais"
    },
    {
      name: "Assinantes",
      email: "assinantes@itlbrasil.com.br",
      description: "Suporte aos assinantes da newsletter e serviços premium"
    },
    {
      name: "Juridico",
      email: "juridico@itlbrasil.com.br",
      description: "Questões legais, direito de resposta e assuntos jurídicos"
    }
  ];

  return (
    <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Entre em Contato
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
              Estamos aqui para ouvir você. Entre em contato conosco para sugestões, 
              parcerias, dúvidas ou qualquer outra questão.
            </p>
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <Send className="h-6 w-6" />
                      <span>Envie sua Mensagem</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nome Completo *
                        </label>
                        <Input placeholder="Seu nome completo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          E-mail *
                        </label>
                        <Input type="email" placeholder="seu@email.com" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Telefone
                        </label>
                        <Input placeholder="(11) 99999-9999" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Assunto *
                        </label>
                        <select className="w-full px-3 py-2 border border-border rounded-md">
                          <option value="">Selecione o assunto</option>
                          <option value="geral">Contato Geral</option>
                          <option value="redacao">Sugestão de Pauta</option>
                          <option value="comercial">Parceria Comercial</option>
                          <option value="newsletter">Newsletter</option>
                          <option value="juridico">Questão Jurídica</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mensagem *
                      </label>
                      <Textarea 
                        placeholder="Escreva sua mensagem aqui..."
                        rows={6}
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <input type="checkbox" className="mt-1" />
                      <p className="text-sm text-muted-foreground">
                        Concordo em receber comunicações do ITL Brasil sobre 
                        notícias e atualizações. Posso cancelar a qualquer momento.
                      </p>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary-dark">
                      Enviar Mensagem
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                {/* Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                              <IconComponent className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="font-bold mb-2">{info.title}</h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {info.content}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Departments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Departamentos Específicos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {departments.map((dept, index) => (
                      <div key={index} className="border-b border-border last:border-0 pb-4 last:pb-0">
                        <h4 className="font-semibold text-primary mb-1">{dept.name}</h4>
                        <p className="text-sm font-medium mb-1">
                          <a href={`mailto:${dept.email}`} className="hover:underline">
                            {dept.email}
                          </a>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dept.description}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Map Placeholder */}
                <Card>
                  <CardContent className="p-0">
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Mapa interativo em breve
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Perguntas Frequentes
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "Como posso sugerir uma pauta?",
                  answer: "Envie sua sugestão para redacao@itlbrasil.com.br com o máximo de detalhes possível, incluindo fontes e relevância do tema."
                },
                {
                  question: "Vocês aceitam artigos de colaboradores externos?",
                  answer: "Sim! Analisamos propostas de especialistas em geopolítica. Entre em contato através do formulário ou e-mail da redação."
                },
                {
                  question: "Como posso anunciar no ITL Brasil?",
                  answer: "Para oportunidades publicitárias, entre em contato com nosso departamento comercial através do e-mail comercial@itlbrasil.com.br"
                },
                {
                  question: "Como funciona a newsletter?",
                  answer: "Nossa newsletter é gratuita e enviada semanalmente com as principais análises e notícias. Você pode se inscrever em qualquer página do site."
                }
              ].map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Trabalhe Conosco
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Está interessado em fazer parte da nossa equipe? Enviamos oportunidades 
              de trabalho e colaboração para profissionais qualificados.
            </p>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Ver Oportunidades
            </Button>
          </div>
        </section>
    </main>
  );
};

export default Contact;