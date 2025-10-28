import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Heart, Globe, Users, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Missão",
      description: "Fornecer análises geopolíticas precisas e imparciais, promovendo o entendimento dos complexos cenários internacionais e seus impactos no Brasil e no mundo."
    },
    {
      icon: Eye,
      title: "Visão",
      description: "Ser reconhecido como o principal portal brasileiro de análise geopolítica, contribuindo para um debate público mais informado e qualificado sobre questões internacionais."
    },
    {
      icon: Heart,
      title: "Valores",
      description: "Independência editorial, rigor jornalístico, transparência, diversidade de perspectivas e compromisso com a verdade dos fatos."
    }
  ];

  const team = [
    {
      name: "Dr. Carlos Silva",
      role: "Editor-Chefe",
      description: "Doutor em Relações Internacionais, especialista em geopolítica e análise de cenários internacionais.",
      initials: "CS"
    },
    {
      name: "Ana Santos",
      role: "Editora de Geopolítica",
      description: "Mestre em Ciência Política, correspondente internacional com vasta experiência em diplomacia.",
      initials: "AS"
    },
    {
      name: "Ricardo Oliveira",
      role: "Editor de Economia",
      description: "Economista especializado em mercados internacionais e análise de política econômica global.",
      initials: "RO"
    },
    {
      name: "Maria Costa",
      role: "Editora de Tecnologia",
      description: "Jornalista especializada em tecnologia aplicada à geopolítica e transformação digital.",
      initials: "MC"
    }
  ];

  const achievements = [
    { number: "2M+", label: "Leitores mensais" },
    { number: "500+", label: "Artigos publicados" },
    { number: "50+", label: "Analistas especializados" },
    { number: "15+", label: "Países cobertos" }
  ];

  return (
    <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              ITL BRASIL
            </h1>
            <p className="text-xl mb-4 opacity-90">
              Instituto Tribuna Livre Brasil
            </p>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed opacity-80">
              Dedicado à análise geopolítica de excelência, oferecemos perspectivas fundamentadas 
              sobre os principais desenvolvimentos que moldam o cenário internacional e seus 
              reflexos no Brasil.
            </p>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-2xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Sobre o ITL Brasil
              </h2>
              
              <div className="prose prose-lg max-w-none space-y-6">
                <p className="text-lg leading-relaxed">
                  O Instituto Tribuna Livre Brasil (ITL Brasil) foi criado com o propósito de preencher 
                  uma lacuna no cenário jornalístico brasileiro: a necessidade de análises geopolíticas 
                  profundas, imparciais e acessíveis ao grande público.
                </p>

                <p>
                  Nosso portal representa mais do que um simples veículo de comunicação; somos uma 
                  plataforma dedicada ao esclarecimento e à educação política, especialmente no que 
                  se refere às complexas dinâmicas internacionais que influenciam diretamente a vida 
                  dos brasileiros.
                </p>

                <p>
                  Com uma equipe de analistas especializados, correspondentes internacionais e 
                  colaboradores acadêmicos, o ITL Brasil oferece conteúdo de alta qualidade que 
                  vai além das manchetes superficiais, proporcionando contexto histórico, análise 
                  crítica e perspectivas múltiplas sobre os eventos que moldam nosso mundo.
                </p>

                <h3 className="text-2xl font-bold mt-8 mb-4">Nossa Abordagem</h3>

                <p>
                  Acreditamos que o jornalismo de qualidade deve ser independente, rigoroso e 
                  comprometido com a verdade. Por isso, nossa linha editorial se baseia em:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>Análise baseada em dados e fontes verificáveis</li>
                  <li>Diversidade de perspectivas e vozes especializadas</li>
                  <li>Contexto histórico e geopolítico abrangente</li>
                  <li>Linguagem acessível sem sacrificar a profundidade</li>
                  <li>Compromisso com a imparcialidade e objetividade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nossos Números
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-muted-foreground">
                    {achievement.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nossa Equipe
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                      {member.initials}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {member.description}
                    </p>
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
              Junte-se à Nossa Comunidade
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Faça parte de uma comunidade informada e engaged que valoriza análises 
              de qualidade sobre geopolítica e questões internacionais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg font-medium transition-colors">
                Assinar Newsletter
              </button>
              <button className="border border-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3 rounded-lg font-medium transition-colors">
                Seguir nas Redes Sociais
              </button>
            </div>
          </div>
        </section>
    </main>
  );
};

export default About;