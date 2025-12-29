import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Upload, 
  Eye, 
  Code, 
  History, 
  BarChart3, 
  Globe, 
  Clock,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Copy,
  Link,
  FileJson,
  Layers,
  Zap,
  Settings
} from "lucide-react";

interface TutorialSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const TutorialSection = ({ title, icon, children }: TutorialSectionProps) => (
  <AccordionItem value={title} className="border rounded-lg mb-2 px-4">
    <AccordionTrigger className="hover:no-underline">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <span className="font-semibold">{title}</span>
      </div>
    </AccordionTrigger>
    <AccordionContent className="pt-4 pb-6">
      {children}
    </AccordionContent>
  </AccordionItem>
);

const TipBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-4">
    <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
    <div className="text-sm text-muted-foreground">{children}</div>
  </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg mt-4">
    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
    <div className="text-sm text-muted-foreground">{children}</div>
  </div>
);

const CodeExample = ({ children }: { children: React.ReactNode }) => (
  <pre className="p-4 bg-muted rounded-lg text-sm font-mono overflow-x-auto mt-4">
    {children}
  </pre>
);

const StepList = ({ steps }: { steps: string[] }) => (
  <ol className="list-decimal list-inside space-y-2 mt-4">
    {steps.map((step, index) => (
      <li key={index} className="text-sm text-muted-foreground">{step}</li>
    ))}
  </ol>
);

export function NoticiasAITutorial() {
  return (
    <div className="space-y-4">
      <div className="text-center pb-4 border-b">
        <h2 className="text-2xl font-bold">Tutorial Completo</h2>
        <p className="text-muted-foreground mt-2">
          Aprenda a usar todas as funcionalidades do Notícias AI
        </p>
      </div>

      <Accordion type="multiple" className="w-full" defaultValue={["Modos de Entrada"]}>
        {/* SEÇÃO 1: Modos de Entrada */}
        <TutorialSection title="Modos de Entrada" icon={<FileText className="h-5 w-5" />}>
          <p className="text-muted-foreground mb-4">
            O Notícias AI detecta automaticamente o tipo de entrada e processa o conteúdo de acordo. 
            Você pode usar palavras-chave especiais para forçar um modo específico.
          </p>

          <div className="space-y-6">
            {/* EXCLUSIVA */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-500">EXCLUSIVA</Badge>
                <span className="font-medium">Preservar Texto Original</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Use quando o texto não pode ser alterado, como comunicados oficiais ou textos de agências.
                O sistema manterá o conteúdo exatamente como fornecido.
              </p>
              <CodeExample>
{`EXCLUSIVA

Brasília - O Ministério da Economia divulgou 
hoje os novos índices de inflação...

[O texto será preservado sem alterações]`}
              </CodeExample>
            </div>

            {/* CADASTRO MANUAL */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500">CADASTRO MANUAL</Badge>
                <span className="font-medium">Campos para Copiar</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Gera apenas os campos formatados para você copiar e colar no painel de cadastro.
                Não gera JSON para importação automática.
              </p>
              <CodeExample>
{`CADASTRO MANUAL

Título da notícia aqui
Conteúdo completo da matéria...`}
              </CodeExample>
            </div>

            {/* JSON */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500">JSON</Badge>
                <span className="font-medium">Importação Automática</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Gera JSON no formato compatível com "Importar em Massa". 
                Ideal para automatizar o cadastro de notícias.
              </p>
              <CodeExample>
{`JSON

Título da notícia
Conteúdo da matéria completa...`}
              </CodeExample>
            </div>

            {/* LINK */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  <Link className="h-3 w-3 mr-1" />
                  LINK/URL
                </Badge>
                <span className="font-medium">Extrair de URL</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Cole uma URL e o sistema extrairá automaticamente o conteúdo da página.
                Funciona melhor com sites de notícias conhecidos.
              </p>
              <CodeExample>
{`https://www.exemplo.com/noticia/titulo-da-materia

[O sistema acessará a URL e extrairá o conteúdo]`}
              </CodeExample>
            </div>

            {/* LOTE */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-500">
                  <Layers className="h-3 w-3 mr-1" />
                  LOTE
                </Badge>
                <span className="font-medium">Múltiplas URLs</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Processe até 10 URLs de uma vez. Cada URL deve estar em uma linha separada.
              </p>
              <CodeExample>
{`https://site1.com/noticia1
https://site2.com/noticia2
https://site3.com/noticia3

[Máximo 10 URLs por vez]`}
              </CodeExample>
            </div>
          </div>

          <TipBox>
            <strong>Detecção Automática:</strong> Se você não usar uma palavra-chave, o sistema 
            detectará automaticamente se é um link, JSON ou texto comum e processará adequadamente.
          </TipBox>
        </TutorialSection>

        {/* SEÇÃO 2: Upload de Imagem */}
        <TutorialSection title="Upload de Imagem" icon={<Upload className="h-5 w-5" />}>
          <p className="text-muted-foreground mb-4">
            Faça upload de imagens e obtenha URLs públicas para usar nas notícias.
          </p>

          <div className="grid gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Formatos Aceitos
              </h4>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">JPG/JPEG</Badge>
                <Badge variant="secondary">PNG</Badge>
                <Badge variant="secondary">WEBP</Badge>
                <Badge variant="secondary">GIF</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Tamanho máximo: 10MB por imagem
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Como Usar</h4>
              <StepList steps={[
                "Clique no botão 'Enviar Imagem'",
                "Selecione a imagem do seu computador (ou arraste)",
                "Aguarde o upload completar",
                "A URL da imagem será inserida automaticamente no campo de texto",
                "Continue escrevendo seu conteúdo normalmente"
              ]} />
            </div>
          </div>

          <TipBox>
            A URL gerada é pública e permanente. Você pode usá-la em qualquer lugar, 
            não apenas no Notícias AI.
          </TipBox>
        </TutorialSection>

        {/* SEÇÃO 3: Visualização Manual */}
        <TutorialSection title="Visualização Manual" icon={<Eye className="h-5 w-5" />}>
          <p className="text-muted-foreground mb-4">
            A aba "Cadastro Manual" mostra os campos formatados para copiar e colar no painel de cadastro.
          </p>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Campos Gerados</h4>
              <div className="grid gap-2">
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Título</span>
                  <Badge variant="outline">Máx. 100 caracteres</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Slug</span>
                  <Badge variant="outline">Automático</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Resumo</span>
                  <Badge variant="outline">Máx. 160 caracteres</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Meta Title</span>
                  <Badge variant="outline">Máx. 60 caracteres</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Meta Description</span>
                  <Badge variant="outline">Máx. 160 caracteres</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Tags</span>
                  <Badge variant="outline">12 tags, máx. 40 chars cada</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Conteúdo</span>
                  <Badge variant="outline">Texto completo</Badge>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copiando Campos
              </h4>
              <p className="text-sm text-muted-foreground">
                Cada campo tem um botão de copiar. Clique para copiar o conteúdo 
                e cole no campo correspondente do painel de cadastro.
              </p>
            </div>
          </div>

          <WarningBox>
            Os limites de caracteres são importantes para SEO. 
            O sistema já formata respeitando esses limites.
          </WarningBox>
        </TutorialSection>

        {/* SEÇÃO 4: Visualização JSON */}
        <TutorialSection title="JSON e Importação" icon={<FileJson className="h-5 w-5" />}>
          <p className="text-muted-foreground mb-4">
            A aba "JSON (Repórter Pró)" gera JSON no formato compatível com "Importar em Massa".
          </p>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Estrutura do JSON</h4>
              <CodeExample>
{`{
  "noticias": [
    {
      "titulo": "Título da notícia",
      "slug": "titulo-da-noticia",
      "resumo": "Resumo em até 160 caracteres...",
      "conteudo": "<p>Conteúdo em HTML...</p>",
      "categoria": "politica",
      "tags": ["tag1", "tag2", ...],
      "imagem": "https://url-da-imagem.jpg",
      "meta_title": "Título SEO",
      "meta_description": "Descrição SEO",
      "fonte": "https://fonte-original.com"
    }
  ]
}`}
              </CodeExample>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Auto-Correções
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Lide em negrito:</strong> Primeira frase é formatada automaticamente</li>
                <li>• <strong>Parágrafos HTML:</strong> Conteúdo é envolvido em tags &lt;p&gt;</li>
                <li>• <strong>Slug:</strong> Gerado automaticamente do título</li>
                <li>• <strong>Tags:</strong> Limitadas a 12, máx. 40 caracteres cada</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Ações Disponíveis</h4>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge className="bg-green-500">Importar Notícias</Badge>
                  <span className="text-sm text-muted-foreground">
                    Importa direto para o banco de dados
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge variant="outline">Copiar JSON</Badge>
                  <span className="text-sm text-muted-foreground">
                    Copia para usar em outro lugar
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge variant="outline">Preview</Badge>
                  <span className="text-sm text-muted-foreground">
                    Visualiza como card de notícia
                  </span>
                </div>
              </div>
            </div>
          </div>

          <TipBox>
            Após importar, a notícia vai direto para a lista de artigos com status "publicado".
            Você pode editar depois se necessário.
          </TipBox>
        </TutorialSection>

        {/* SEÇÃO 5: Histórico */}
        <TutorialSection title="Histórico de Importações" icon={<History className="h-5 w-5" />}>
          <p className="text-muted-foreground mb-4">
            Acompanhe todas as importações realizadas pelo Notícias AI.
          </p>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Informações Registradas</h4>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Título</Badge>
                  <span className="text-sm text-muted-foreground">Título do artigo importado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Status</Badge>
                  <span className="text-sm text-muted-foreground">Sucesso ou erro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Fonte</Badge>
                  <span className="text-sm text-muted-foreground">Site de origem</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Data/Hora</Badge>
                  <span className="text-sm text-muted-foreground">Quando foi importado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Correção</Badge>
                  <span className="text-sm text-muted-foreground">Se houve auto-correção</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Links Rápidos</h4>
              <p className="text-sm text-muted-foreground">
                Cada entrada tem links para:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Editar o artigo no painel admin</li>
                <li>• Ver a fonte original</li>
                <li>• Ver detalhes do erro (se houver)</li>
              </ul>
            </div>
          </div>
        </TutorialSection>

        {/* SEÇÃO 6: Estatísticas */}
        <TutorialSection title="Dashboard de Estatísticas" icon={<BarChart3 className="h-5 w-5" />}>
          <p className="text-muted-foreground mb-4">
            Visualize métricas e análises das suas importações.
          </p>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Métricas Disponíveis</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-2xl font-bold text-primary">Total</div>
                  <div className="text-xs text-muted-foreground">Importações</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-2xl font-bold text-green-500">Taxa</div>
                  <div className="text-xs text-muted-foreground">Sucesso %</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-2xl font-bold text-amber-500">Correções</div>
                  <div className="text-xs text-muted-foreground">Automáticas</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <div className="text-2xl font-bold text-destructive">Erros</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Filtros por Período</h4>
              <div className="flex gap-2">
                <Badge variant="outline">Hoje</Badge>
                <Badge variant="outline">7 dias</Badge>
                <Badge variant="outline">30 dias</Badge>
                <Badge variant="outline">Personalizado</Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Gráficos</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Importações por dia (linha/barra)</li>
                <li>• Distribuição por fonte (pizza)</li>
                <li>• Top 5 fontes mais usadas</li>
              </ul>
            </div>
          </div>
        </TutorialSection>

        {/* SEÇÃO 7: Fontes */}
        <TutorialSection title="Gerenciamento de Fontes" icon={<Globe className="h-5 w-5" />}>
          <p className="text-muted-foreground mb-4">
            Configure fontes de notícias para melhor extração de conteúdo.
          </p>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Tipos de Fontes</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge className="bg-blue-500">Sistema</Badge>
                  <span className="text-sm text-muted-foreground">
                    Pré-configuradas (G1, Folha, UOL, etc.)
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge className="bg-purple-500">Personalizadas</Badge>
                  <span className="text-sm text-muted-foreground">
                    Criadas por você
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Campos de uma Fonte</h4>
              <div className="grid gap-2">
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Nome</span>
                  <span className="text-xs text-muted-foreground">Ex: Folha de S.Paulo</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Badge</span>
                  <span className="text-xs text-muted-foreground">Ex: FOLHA</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Domínio</span>
                  <span className="text-xs text-muted-foreground">Ex: folha.uol.com.br</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Cor do Badge</span>
                  <span className="text-xs text-muted-foreground">Cor hexadecimal</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Instruções</span>
                  <span className="text-xs text-muted-foreground">Como processar (opcional)</span>
                </div>
              </div>
            </div>
          </div>

          <TipBox>
            Fontes personalizadas ajudam o sistema a extrair melhor o conteúdo 
            de sites específicos que você usa frequentemente.
          </TipBox>
        </TutorialSection>

        {/* SEÇÃO 8: Agendamentos */}
        <TutorialSection title="Agendamentos Automáticos" icon={<Clock className="h-5 w-5" />}>
          <p className="text-muted-foreground mb-4">
            Configure importações automáticas em intervalos regulares.
          </p>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Criando um Agendamento</h4>
              <StepList steps={[
                "Clique em 'Novo Agendamento'",
                "Defina um nome identificador",
                "Adicione as URLs das fontes",
                "Configure o intervalo (ex: a cada 60 minutos)",
                "Defina o máximo de artigos por execução",
                "Escolha se deve publicar automaticamente",
                "Ative o agendamento"
              ]} />
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </h4>
              <div className="grid gap-2">
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Intervalo</span>
                  <span className="text-xs text-muted-foreground">15min a 24h</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Máx. Artigos</span>
                  <span className="text-xs text-muted-foreground">1 a 20 por execução</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Auto-Publicar</span>
                  <span className="text-xs text-muted-foreground">Sim ou Não</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">Status</span>
                  <span className="text-xs text-muted-foreground">Ativo ou Pausado</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Ações do Agendamento</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Pausar/Ativar</Badge>
                <Badge variant="outline">Executar Agora</Badge>
                <Badge variant="outline">Ver Histórico</Badge>
                <Badge variant="outline">Editar</Badge>
                <Badge variant="outline">Excluir</Badge>
              </div>
            </div>
          </div>

          <WarningBox>
            Agendamentos muito frequentes podem sobrecarregar as fontes. 
            Recomendamos intervalos de pelo menos 30 minutos.
          </WarningBox>
        </TutorialSection>
      </Accordion>

      <Alert className="mt-6">
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Precisa de mais ajuda?</strong> Entre em contato com o suporte 
          ou consulte a documentação completa do sistema.
        </AlertDescription>
      </Alert>
    </div>
  );
}
