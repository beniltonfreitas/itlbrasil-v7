export interface VPNServerData {
  id: string;
  name: string;
  region: string;
  state: string;
  host: string;
  port: number;
  protocol: string;
  priority: number;
}

export const BRAZILIAN_VPN_SERVERS: VPNServerData[] = [
  // São Paulo
  {
    id: 'br-sp-01',
    name: 'São Paulo - Datacenter 1',
    region: 'BR-SP',
    state: 'São Paulo',
    host: 'vpn-sp1.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 1
  },
  {
    id: 'br-sp-02',
    name: 'São Paulo - Datacenter 2',
    region: 'BR-SP',
    state: 'São Paulo',
    host: 'vpn-sp2.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 2
  },
  
  // Rio de Janeiro
  {
    id: 'br-rj-01',
    name: 'Rio de Janeiro - Datacenter 1',
    region: 'BR-RJ',
    state: 'Rio de Janeiro',
    host: 'vpn-rj1.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 3
  },
  {
    id: 'br-rj-02',
    name: 'Rio de Janeiro - Datacenter 2',
    region: 'BR-RJ',
    state: 'Rio de Janeiro',
    host: 'vpn-rj2.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 4
  },
  
  // Minas Gerais
  {
    id: 'br-mg-01',
    name: 'Belo Horizonte - Datacenter 1',
    region: 'BR-MG',
    state: 'Minas Gerais',
    host: 'vpn-mg1.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 5
  },
  
  // Rio Grande do Sul
  {
    id: 'br-rs-01',
    name: 'Porto Alegre - Datacenter 1',
    region: 'BR-RS',
    state: 'Rio Grande do Sul',
    host: 'vpn-rs1.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 6
  },
  {
    id: 'br-rs-02',
    name: 'Porto Alegre - Datacenter 2',
    region: 'BR-RS',
    state: 'Rio Grande do Sul',
    host: 'vpn-rs2.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 7
  },
  
  // Bahia
  {
    id: 'br-ba-01',
    name: 'Salvador - Datacenter 1',
    region: 'BR-BA',
    state: 'Bahia',
    host: 'vpn-ba1.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 8
  },
  
  // Brasília
  {
    id: 'br-df-01',
    name: 'Brasília - Datacenter 1',
    region: 'BR-DF',
    state: 'Brasília',
    host: 'vpn-df1.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 9
  },
  
  // Paraná
  {
    id: 'br-pr-01',
    name: 'Curitiba - Datacenter 1',
    region: 'BR-PR',
    state: 'Paraná',
    host: 'vpn-pr1.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 10
  },
  {
    id: 'br-pr-02',
    name: 'Curitiba - Datacenter 2',
    region: 'BR-PR',
    state: 'Paraná',
    host: 'vpn-pr2.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 11
  },
  
  // Santa Catarina
  {
    id: 'br-sc-01',
    name: 'Florianópolis - Datacenter 1',
    region: 'BR-SC',
    state: 'Santa Catarina',
    host: 'vpn-sc1.itlbrasil.com.br',
    port: 443,
    protocol: 'wss',
    priority: 12
  }
];

export const VPN_STATES = [
  'BR-SP', 'BR-RJ', 'BR-MG', 'BR-RS', 
  'BR-BA', 'BR-DF', 'BR-PR', 'BR-SC'
];

export function getServersByState(state: string): VPNServerData[] {
  return BRAZILIAN_VPN_SERVERS.filter(s => s.region === state);
}

export function getBestServerByState(state: string): VPNServerData | undefined {
  const servers = getServersByState(state);
  return servers.sort((a, b) => a.priority - b.priority)[0];
}

export function getAllServersByPriority(): VPNServerData[] {
  return [...BRAZILIAN_VPN_SERVERS].sort((a, b) => a.priority - b.priority);
}
