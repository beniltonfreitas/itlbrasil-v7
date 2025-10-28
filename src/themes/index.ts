export interface ThemeModel {
  id: string;
  name: string;
  description: string;
  version: string;
  features: string[];
  component: React.ComponentType;
}

// Theme component imports
import { ModeloPadrao } from './modelo-padrao/ModeloPadrao';
import { ModeloClassico } from './modelo-classico/ModeloClassico';
import { ModeloModerno } from './modelo-moderno/ModeloModerno';
import { ModeloMagazine } from './modelo-magazine/ModeloMagazine';
import { ModeloCompacto } from './modelo-compacto/ModeloCompacto';
import { ModeloItl02 } from './modelo-itl-02/ModeloItl02';
import { ModeloItl03 } from './modelo-itl-03/ModeloItl03';
import { ModeloItl04 } from './modelo-itl-04/ModeloItl04';
import { ModeloItl05 } from './modelo-itl-05/ModeloItl05';

export const THEME_MODELS: ThemeModel[] = [
  {
    id: "modelo-itl-05-v1",
    name: "Modelo ITL 05 (USA TODAY Pro)",
    description: "Design premium USA TODAY com grid avançado, breaking news bar azul (#1565C0), widgets integrados e layout profissional otimizado",
    version: "V1.0",
    features: ["Grid Avançado", "Breaking News Azul", "Header com Widgets", "Hero 3 Colunas", "Widgets Lateral", "Footer 4 Colunas", "Performance Otimizada"],
    component: ModeloItl05
  },
  {
    id: "modelo-padrao-v10",
    name: "Modelo ITL 01 (Padrão)",
    description: "Layout atual otimizado com design limpo e profissional",
    version: "V10",
    features: ["Layout Responsivo", "Design Limpo", "Foco em Conteúdo", "Navegação Intuitiva"],
    component: ModeloPadrao
  },
  {
    id: "modelo-itl-02-v1",
    name: "Modelo ITL 02",
    description: "Design baseado no modelo de referência com header azul e layout otimizado",
    version: "V1.0",
    features: ["Header Azul", "Layout Referência", "Responsivo", "Moderno"],
    component: ModeloItl02
  },
  {
    id: "modelo-itl-03-v1",
    name: "Modelo ITL 03 (USA Today Style)",
    description: "Design inspirado no USA Today com header escuro, layout em grid e navegação moderna",
    version: "V1.0",
    features: ["Header Escuro", "Layout Grid", "InfoBar Integrado", "Design Corporativo", "Multi-coluna Footer"],
    component: ModeloItl03
  },
  {
    id: "modelo-itl-04-v1",
    name: "Modelo ITL 04 (USA Today Full Style)",
    description: "Design completo USA Today com breaking news bar, hero panorâmico, indicadores financeiros integrados e layout profissional de jornal",
    version: "V1.0",
    features: ["Breaking News Bar", "Hero Panorâmico", "Indicadores Financeiros", "Layout 2 Colunas", "Cards com Hover", "Newsletter Integrada", "Footer 4 Colunas"],
    component: ModeloItl04
  }
];

export const getThemeById = (id: string) => {
  return THEME_MODELS.find(theme => theme.id === id);
};

export const getDefaultTheme = () => {
  return THEME_MODELS[0]; // Modelo ITL 05
};