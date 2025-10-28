// Official RSS feed categories and validation rules
export const AGENCIA_BRASIL_CATEGORIES = [
  'Últimas Notícias',
  'Internacional',
  'Direitos Humanos',
  'Economia',
  'Educação',
  'Esportes',
  'Geral',
  'Justiça',
  'Política',
  'Saúde',
  'Parceiros'
] as const;

export const RADIOAGENCIA_NACIONAL_CATEGORIES = [
  'Últimas Notícias',
  'Internacional',
  'Cultura',
  'Direitos Humanos',
  'Economia', 
  'Educação',
  'Esportes',
  'Geral',
  'Justiça',
  'Meio Ambiente',
  'Pesquisa e Inovação',
  'Política',
  'Saúde',
  'Segurança'
] as const;

export const METROPOLE_ONLINE_CATEGORIES = [
  'Últimas Notícias',
  'Mundo',
  'Barueri',
  'Cajamar',
  'Cidades',
  'Celebridades',
  'Esportes',
  'Francisco Morato',
  'Franco da Rocha',
  'Grande SP',
  'Política',
  'Poder Legislativo de Cajamar',
  'Santana de Parnaíba',
  'Tecnologia',
  'Metrópole Pet'
] as const;

export interface FeedValidationResult {
  isDuplicate: boolean;
  isValidCategory: boolean;
  suggestedAction?: string;
  conflictingFeed?: string;
}

// Helper functions for better feed processing
const normalizeFeedName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[-–—]/g, '-')
    .trim();
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getCategoryFromName = (feedName: string, prefix: string): string => {
  const escapedPrefix = escapeRegExp(prefix);
  const regex = new RegExp(`^${escapedPrefix}\\s*[-–—:]\\s*(.+)$`, 'i');
  const match = feedName.match(regex);
  return match ? match[1].trim() : feedName;
};

export const validateRSSFeed = (
  feedName: string,
  feedUrl: string,
  isNative: boolean,
  existingFeeds: Array<{ name: string; url: string; is_native: boolean }>
): FeedValidationResult => {
  const normalizedName = normalizeFeedName(feedName);
  
  // Check for duplicates - more precise validation
  const duplicate = existingFeeds.find(feed => 
    feed.url === feedUrl || 
    (normalizeFeedName(feed.name) === normalizedName && feed.is_native === isNative)
  );

  if (duplicate) {
    return {
      isDuplicate: true,
      isValidCategory: false,
      suggestedAction: 'Remove duplicate feed',
      conflictingFeed: duplicate.name
    };
  }

  // Validate category for native feeds - more precise matching
  if (isNative) {
    if (feedName.includes('Agência Brasil') && !feedName.includes('Radioagência Nacional')) {
      const category = getCategoryFromName(feedName, 'Agência Brasil');
      const categoryValid = AGENCIA_BRASIL_CATEGORIES.some(cat => 
        cat.toLowerCase() === category.toLowerCase()
      );
      return {
        isDuplicate: false,
        isValidCategory: categoryValid,
        suggestedAction: categoryValid ? undefined : 'Check category against official list'
      };
    }
    
    if (feedName.includes('Radioagência Nacional')) {
      const category = getCategoryFromName(feedName, 'Radioagência Nacional');
      const categoryValid = RADIOAGENCIA_NACIONAL_CATEGORIES.some(cat => 
        cat.toLowerCase() === category.toLowerCase()
      );
      return {
        isDuplicate: false,
        isValidCategory: categoryValid,
        suggestedAction: categoryValid ? undefined : 'Check category against official list'
      };
    }
    
    if (feedName.includes('Metrópole Online')) {
      const category = getCategoryFromName(feedName, 'Metrópole Online');
      const categoryValid = METROPOLE_ONLINE_CATEGORIES.some(cat => 
        cat.toLowerCase() === category.toLowerCase()
      );
      return {
        isDuplicate: false,
        isValidCategory: categoryValid,
        suggestedAction: categoryValid ? undefined : 'Check category against official list'
      };
    }
  }

  return {
    isDuplicate: false,
    isValidCategory: true
  };
};

const AGENCIA_BRASIL_PRIORITY_ORDER = ['Últimas Notícias', 'Internacional'];
const RADIOAGENCIA_PRIORITY_ORDER = ['Últimas Notícias', 'Internacional'];
const METROPOLE_PRIORITY_ORDER = ['Últimas Notícias', 'Mundo'];

const createSortFunction = (prefix: string, priorityOrder: string[]) => {
  return (feeds: Array<{ 
    id: string;
    name: string; 
    url: string; 
    is_native: boolean;
    active: boolean;
  }>) => {
    return feeds.sort((a, b) => {
      const categoryA = getCategoryFromName(a.name, prefix);
      const categoryB = getCategoryFromName(b.name, prefix);
      
      // Check if categories are in priority order
      const priorityA = priorityOrder.indexOf(categoryA);
      const priorityB = priorityOrder.indexOf(categoryB);
      
      // Both in priority list - sort by priority order
      if (priorityA !== -1 && priorityB !== -1) {
        return priorityA - priorityB;
      }
      
      // Only A in priority list - A comes first
      if (priorityA !== -1 && priorityB === -1) {
        return -1;
      }
      
      // Only B in priority list - B comes first  
      if (priorityA === -1 && priorityB !== -1) {
        return 1;
      }
      
      // Neither in priority list - sort alphabetically
      return categoryA.localeCompare(categoryB, 'pt-BR');
    });
  };
};

const sortAgenciaBrasilFeeds = createSortFunction('Agência Brasil', AGENCIA_BRASIL_PRIORITY_ORDER);
const sortRadioagenciaFeeds = createSortFunction('Radioagência Nacional', RADIOAGENCIA_PRIORITY_ORDER);
const sortMetropoleOnlineFeeds = createSortFunction('Metrópole Online', METROPOLE_PRIORITY_ORDER);

export const groupFeedsBySource = (feeds: Array<{ 
  id: string;
  name: string; 
  url: string; 
  is_native: boolean;
  active: boolean;
}>) => {
  const agenciaBrasil = feeds.filter(feed => 
    feed.is_native && 
    feed.name.includes('Agência Brasil') && 
    !feed.name.includes('Radioagência Nacional')
  );
  
  const radioagencia = feeds.filter(feed => 
    feed.is_native && feed.name.includes('Radioagência Nacional')  
  );
  
  const metropoleOnline = feeds.filter(feed => 
    feed.is_native && feed.name.includes('Metrópole Online')
  );
  
  const custom = feeds.filter(feed => !feed.is_native);

  return {
    agenciaBrasil: sortAgenciaBrasilFeeds(agenciaBrasil),
    radioagencia: sortRadioagenciaFeeds(radioagencia),
    metropoleOnline: sortMetropoleOnlineFeeds(metropoleOnline),
    custom: custom.sort((a, b) => a.name.localeCompare(b.name))
  };
};