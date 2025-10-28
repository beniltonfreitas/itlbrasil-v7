-- Populate articles table with example content
INSERT INTO public.articles (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  meta_title,
  meta_description,
  category_id,
  author_id,
  featured,
  read_time,
  published_at
) VALUES
-- Featured Articles
(
  'Tensões no Mar do Sul da China: Análise Geopolítica Atual',
  'tensoes-mar-sul-china-analise-geopolitica',
  'As crescentes tensões entre China, Estados Unidos e países do Sudeste Asiático no Mar do Sul da China representam um dos principais pontos de atrito geopolítico mundial.',
  '<h2>Contexto Histórico</h2><p>O Mar do Sul da China tem sido uma região de disputa territorial há décadas, com reivindicações sobrepostas de vários países.</p><h2>Atores Principais</h2><p>China, Estados Unidos, Filipinas, Vietnã e outros países da ASEAN são os principais atores neste cenário complexo.</p><h2>Implicações Econômicas</h2><p>A região é crucial para o comércio global, com cerca de 30% do tráfego marítimo mundial passando por essas águas.</p><h2>Perspectivas Futuras</h2><p>As tensões continuam a escalar, exigindo diplomacia cuidadosa para evitar conflitos maiores.</p>',
  '/src/assets/hero-geopolitics.jpg',
  'Tensões no Mar do Sul da China: Análise Geopolítica Completa 2024',
  'Análise detalhada das tensões geopolíticas no Mar do Sul da China, envolvendo China, EUA e países do Sudeste Asiático. Entenda os impactos globais.',
  (SELECT id FROM categories WHERE slug = 'geopolitica'),
  (SELECT id FROM authors WHERE slug = 'ana-silva'),
  true,
  8,
  NOW() - INTERVAL '2 days'
),
(
  'Impactos da Guerra na Ucrânia na Economia Global',
  'impactos-guerra-ucrania-economia-global',
  'A guerra na Ucrânia continua a causar ondas de choque na economia mundial, afetando desde preços de commodities até cadeias de suprimento globais.',
  '<h2>Commodities em Alta</h2><p>Os preços de grãos, energia e metais dispararam desde o início do conflito, criando pressões inflacionárias globais.</p><h2>Cadeia de Suprimentos</h2><p>Interrupções nas cadeias de suprimento afetam desde a indústria automotiva até a produção de fertilizantes.</p><h2>Sanctions e Isolamento</h2><p>As sanções contra a Rússia criaram um novo paradigma nas relações econômicas internacionais.</p><h2>Adaptação dos Mercados</h2><p>Países e empresas buscam alternativas para reduzir dependências e diversificar fornecedores.</p>',
  '/src/assets/news-economy.jpg',
  'Guerra na Ucrânia: Impactos Econômicos Globais e Perspectivas',
  'Análise dos impactos econômicos da guerra na Ucrânia na economia global, commodities, inflação e cadeias de suprimento mundiais.',
  (SELECT id FROM categories WHERE slug = 'economia'),
  (SELECT id FROM authors WHERE slug = 'carlos-mendoza'),
  true,
  12,
  NOW() - INTERVAL '1 day'
),
(
  'Inteligência Artificial e o Futuro da Diplomacia',
  'inteligencia-artificial-futuro-diplomacia',
  'Como a IA está transformando a diplomacia moderna, desde análise de dados até negociações automatizadas e previsão de conflitos.',
  '<h2>IA na Análise Geopolítica</h2><p>Algoritmos avançados permitem análise em tempo real de grandes volumes de dados diplomáticos e econômicos.</p><h2>Negociações Digitais</h2><p>Plataformas de IA estão sendo testadas para facilitar negociações complexas entre países.</p><h2>Prevenção de Conflitos</h2><p>Sistemas preditivos ajudam a identificar potenciais áreas de tensão antes que se tornem crises.</p><h2>Desafios Éticos</h2><p>O uso de IA na diplomacia levanta questões sobre transparência e responsabilidade nas decisões.</p>',
  '/src/assets/news-technology.jpg',
  'IA na Diplomacia: Como a Tecnologia Está Mudando as Relações Internacionais',
  'Descubra como a inteligência artificial está revolucionando a diplomacia moderna, negociações internacionais e prevenção de conflitos.',
  (SELECT id FROM categories WHERE slug = 'tecnologia-politica'),
  (SELECT id FROM authors WHERE slug = 'elena-rodriguez'),
  true,
  10,
  NOW() - INTERVAL '3 hours'
),

-- Regular Articles
(
  'BRICS: Expansão e Impacto na Ordem Mundial',
  'brics-expansao-impacto-ordem-mundial',
  'A recente expansão do BRICS com novos membros marca uma mudança significativa no equilíbrio de poder global.',
  '<h2>Novos Membros</h2><p>A inclusão de países como Arábia Saudita, Emirados Árabes Unidos e outros representa uma expansão estratégica.</p><h2>Poder Econômico</h2><p>O bloco agora representa mais de 40% da população mundial e uma parcela significativa do PIB global.</p><h2>Alternativa ao Ocidente</h2><p>O BRICS se posiciona como uma alternativa às instituições dominadas pelo Ocidente.</p>',
  null,
  'BRICS 2024: Expansão e Novo Equilíbrio de Poder Mundial',
  'Análise da expansão do BRICS e seu impacto na geopolítica mundial, economia global e ordem internacional.',
  (SELECT id FROM categories WHERE slug = 'geopolitica'),
  (SELECT id FROM authors WHERE slug = 'ana-silva'),
  false,
  6,
  NOW() - INTERVAL '5 days'
),
(
  'Crise Energética Europeia: Adaptações e Alternativas',
  'crise-energetica-europeia-adaptacoes-alternativas',
  'A Europa busca alternativas energéticas após a ruptura com fornecedores tradicionais, acelerando a transição verde.',
  '<h2>Diversificação de Fontes</h2><p>Países europeus buscam novos fornecedores de gás natural e petróleo fora da Rússia.</p><h2>Energia Renovável</h2><p>Investimentos massivos em solar, eólica e outras fontes renováveis aceleram a transição energética.</p><h2>Impactos Econômicos</h2><p>Os altos custos energéticos afetam a competitividade industrial europeia.</p>',
  null,
  'Crise Energética na Europa: Estratégias de Adaptação e Futuro',
  'Como a Europa está lidando com a crise energética, diversificando fontes e acelerando a transição para energias renováveis.',
  (SELECT id FROM categories WHERE slug = 'economia'),
  (SELECT id FROM authors WHERE slug = 'carlos-mendoza'),
  false,
  9,
  NOW() - INTERVAL '6 days'
),
(
  'Eleições Americanas 2024: Impactos Globais',
  'eleicoes-americanas-2024-impactos-globais',
  'As próximas eleições presidenciais americanas podem redefinir alianças internacionais e políticas globais.',
  '<h2>Candidatos e Posições</h2><p>Diferentes candidatos apresentam visões distintas sobre política externa e comércio internacional.</p><h2>Alianças Internacionais</h2><p>O resultado pode afetar a OTAN, parcerias no Pacífico e relações com a China.</p><h2>Política Comercial</h2><p>Tarifas, acordos comerciais e políticas protecionistas estão em jogo.</p>',
  null,
  'Eleições EUA 2024: O Que Esperar Para a Geopolítica Mundial',
  'Análise dos possíveis impactos das eleições americanas de 2024 na geopolítica mundial, alianças e comércio internacional.',
  (SELECT id FROM categories WHERE slug = 'politica-internacional'),
  (SELECT id FROM authors WHERE slug = 'elena-rodriguez'),
  false,
  7,
  NOW() - INTERVAL '1 week'
),
(
  'Mudanças Climáticas e Conflitos Geopolíticos',
  'mudancas-climaticas-conflitos-geopoliticos',
  'Como as mudanças climáticas estão criando novos focos de tensão e conflitos ao redor do mundo.',
  '<h2>Escassez de Recursos</h2><p>A diminuição de recursos hídricos e terras aráveis cria tensões entre países vizinhos.</p><h2>Migração Climática</h2><p>Movimentos populacionais em massa devido a eventos climáticos extremos geram pressões políticas.</p><h2>Competição por Recursos</h2><p>O degelo do Ártico abre novas rotas comerciais e disputas territoriais.</p>',
  null,
  'Clima e Geopolítica: Como Mudanças Climáticas Geram Conflitos',
  'Explore a relação entre mudanças climáticas e conflitos geopolíticos, incluindo escassez de recursos e migração forçada.',
  (SELECT id FROM categories WHERE slug = 'meio-ambiente'),
  (SELECT id FROM authors WHERE slug = 'ana-silva'),
  false,
  11,
  NOW() - INTERVAL '8 days'
),
(
  'Criptomoedas e Soberania Monetária Nacional',
  'criptomoedas-soberania-monetaria-nacional',
  'O crescimento das criptomoedas desafia a soberania monetária dos Estados e cria novos paradigmas econômicos.',
  '<h2>CBDCs</h2><p>Bancos centrais desenvolvem suas próprias moedas digitais para manter controle monetário.</p><h2>Regulamentação Global</h2><p>Países adotam abordagens diferentes para regular o mercado de criptomoedas.</p><h2>Impactos Geopolíticos</h2><p>Moedas digitais podem contornar sanções econômicas tradicionais.</p>',
  null,
  'Criptomoedas vs Estados: O Futuro da Soberania Monetária',
  'Análise do impacto das criptomoedas na soberania monetária nacional e as respostas dos governos globalmente.',
  (SELECT id FROM categories WHERE slug = 'economia'),
  (SELECT id FROM authors WHERE slug = 'carlos-mendoza'),
  false,
  8,
  NOW() - INTERVAL '10 days'
),
(
  'Corrida Espacial Moderna: Geopolítica Além da Terra',
  'corrida-espacial-moderna-geopolitica-alem-terra',
  'A nova corrida espacial entre potências mundiais tem implicações geopolíticas que vão muito além da exploração científica.',
  '<h2>Militarização do Espaço</h2><p>Países desenvolvem capacidades militares espaciais para proteção e projeção de poder.</p><h2>Economia Espacial</h2><p>Mineração de asteroides e turismo espacial criam novas oportunidades econômicas.</p><h2>Cooperação vs Competição</h2><p>Tensão entre colaboração científica e rivalidade geopolítica no espaço.</p>',
  null,
  'Nova Corrida Espacial: Geopolítica e Competição Entre Potências',
  'Como a nova corrida espacial está redefinindo a geopolítica mundial, incluindo militarização e economia espacial.',
  (SELECT id FROM categories WHERE slug = 'tecnologia-politica'),
  (SELECT id FROM authors WHERE slug = 'elena-rodriguez'),
  false,
  9,
  NOW() - INTERVAL '2 weeks'
),
(
  'Diplomacia Digital: Soft Power na Era das Redes Sociais',
  'diplomacia-digital-soft-power-era-redes-sociais',
  'Como países usam redes sociais e plataformas digitais para exercer influência e moldar opinião pública global.',
  '<h2>Influência Online</h2><p>Governos investem em estratégias de comunicação digital para projetar soft power.</p><h2>Desinformação</h2><p>O combate à desinformação se torna uma questão de segurança nacional.</p><h2>Diplomacia Cultural</h2><p>Plataformas digitais permitem nova forma de diplomacia cultural e intercâmbio.</p>',
  '/src/assets/news-diplomacy.jpg',
  'Diplomacia Digital: Como Países Exercem Soft Power Online',
  'Entenda como a diplomacia digital e o soft power nas redes sociais estão mudando as relações internacionais.',
  (SELECT id FROM categories WHERE slug = 'politica-internacional'),
  (SELECT id FROM authors WHERE slug = 'ana-silva'),
  false,
  7,
  NOW() - INTERVAL '2 weeks 3 days'
);

-- Update newsletter_subscribers RLS policy to allow public insertions
DROP POLICY IF EXISTS "Newsletter subscribers can view their own data" ON newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter" 
ON newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Newsletter subscribers are private" 
ON newsletter_subscribers 
FOR SELECT 
USING (false); -- No one can read subscribers for privacy