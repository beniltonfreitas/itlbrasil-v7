export interface BuildXMLOptions {
  loteNumero: number;
  prestadorCnpj: string;
  prestadorIM: string;
  rpsNumero: number;
  rpsSerie: string;
  rpsDataEmissao: string;
  naturezaOperacao: number;
  itemListaServico: number;
  discriminacao: string;
  municipioPrestacao: number;
  valorServicos: number;
  aliquota: number;
  issRetido: number;
  optanteSimplesNacional: number;
  incentivadorCultural: number;
  tomadorCnpjCpf: string;
  tomadorRazaoSocial: string;
  tomadorEndereco?: string;
  tomadorNumero?: string;
  tomadorBairro?: string;
  tomadorCodigoMunicipio?: number;
  tomadorUF?: string;
  tomadorCEP?: string;
  tomadorTelefone?: string;
  tomadorEmail?: string;
}

/**
 * Constrói XML ABRASF v1.00 para envio de lote RPS
 */
export function buildEnviarLoteRpsEnvio(opts: BuildXMLOptions): string {
  const valorDeducoes = 0;
  const valorPis = 0;
  const valorCofins = 0;
  const valorInss = 0;
  const valorIr = 0;
  const valorCsll = 0;
  const outrasRetencoes = 0;
  const descontoIncondicionado = 0;
  const descontoCondicionado = 0;

  return `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps Id="lote${opts.loteNumero}">
    <NumeroLote>${opts.loteNumero}</NumeroLote>
    <Cnpj>${opts.prestadorCnpj}</Cnpj>
    <InscricaoMunicipal>${opts.prestadorIM}</InscricaoMunicipal>
    <QuantidadeRps>1</QuantidadeRps>
    <ListaRps>
      <Rps>
        <InfRps Id="rps${opts.rpsNumero}">
          <IdentificacaoRps>
            <Numero>${opts.rpsNumero}</Numero>
            <Serie>${opts.rpsSerie}</Serie>
            <Tipo>1</Tipo>
          </IdentificacaoRps>
          <DataEmissao>${opts.rpsDataEmissao}</DataEmissao>
          <NaturezaOperacao>${opts.naturezaOperacao}</NaturezaOperacao>
          <OptanteSimplesNacional>${opts.optanteSimplesNacional}</OptanteSimplesNacional>
          <IncentivadorCultural>${opts.incentivadorCultural}</IncentivadorCultural>
          <Status>1</Status>
          <Servico>
            <Valores>
              <ValorServicos>${opts.valorServicos.toFixed(2)}</ValorServicos>
              <ValorDeducoes>${valorDeducoes.toFixed(2)}</ValorDeducoes>
              <ValorPis>${valorPis.toFixed(2)}</ValorPis>
              <ValorCofins>${valorCofins.toFixed(2)}</ValorCofins>
              <ValorInss>${valorInss.toFixed(2)}</ValorInss>
              <ValorIr>${valorIr.toFixed(2)}</ValorIr>
              <ValorCsll>${valorCsll.toFixed(2)}</ValorCsll>
              <IssRetido>${opts.issRetido}</IssRetido>
              <OutrasRetencoes>${outrasRetencoes.toFixed(2)}</OutrasRetencoes>
              <Aliquota>${opts.aliquota}</Aliquota>
              <DescontoIncondicionado>${descontoIncondicionado.toFixed(2)}</DescontoIncondicionado>
              <DescontoCondicionado>${descontoCondicionado.toFixed(2)}</DescontoCondicionado>
            </Valores>
            <ItemListaServico>${opts.itemListaServico}</ItemListaServico>
            <Discriminacao>${opts.discriminacao}</Discriminacao>
            <CodigoMunicipio>${opts.municipioPrestacao}</CodigoMunicipio>
          </Servico>
          <Prestador>
            <Cnpj>${opts.prestadorCnpj}</Cnpj>
            <InscricaoMunicipal>${opts.prestadorIM}</InscricaoMunicipal>
          </Prestador>
          <Tomador>
            <IdentificacaoTomador>
              <CpfCnpj>
                ${opts.tomadorCnpjCpf.length === 11 ? `<Cpf>${opts.tomadorCnpjCpf}</Cpf>` : `<Cnpj>${opts.tomadorCnpjCpf}</Cnpj>`}
              </CpfCnpj>
            </IdentificacaoTomador>
            <RazaoSocial>${opts.tomadorRazaoSocial}</RazaoSocial>
            ${opts.tomadorEndereco ? `
            <Endereco>
              <Endereco>${opts.tomadorEndereco}</Endereco>
              ${opts.tomadorNumero ? `<Numero>${opts.tomadorNumero}</Numero>` : ''}
              ${opts.tomadorBairro ? `<Bairro>${opts.tomadorBairro}</Bairro>` : ''}
              ${opts.tomadorCodigoMunicipio ? `<CodigoMunicipio>${opts.tomadorCodigoMunicipio}</CodigoMunicipio>` : ''}
              ${opts.tomadorUF ? `<Uf>${opts.tomadorUF}</Uf>` : ''}
              ${opts.tomadorCEP ? `<Cep>${opts.tomadorCEP}</Cep>` : ''}
            </Endereco>` : ''}
            ${opts.tomadorTelefone ? `
            <Contato>
              <Telefone>${opts.tomadorTelefone}</Telefone>
              ${opts.tomadorEmail ? `<Email>${opts.tomadorEmail}</Email>` : ''}
            </Contato>` : ''}
          </Tomador>
        </InfRps>
      </Rps>
    </ListaRps>
  </LoteRps>
</EnviarLoteRpsEnvio>`;
}

/**
 * Constrói XML de cancelamento NFS-e
 */
export function buildCancelamentoXML(opts: {
  numeroNfse: string;
  prestadorCnpj: string;
  prestadorIM: string;
  codMunicipio: number;
  motivo: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<CancelarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Pedido>
    <InfPedidoCancelamento>
      <IdentificacaoNfse>
        <Numero>${opts.numeroNfse}</Numero>
        <Cnpj>${opts.prestadorCnpj}</Cnpj>
        <InscricaoMunicipal>${opts.prestadorIM}</InscricaoMunicipal>
        <CodigoMunicipio>${opts.codMunicipio}</CodigoMunicipio>
      </IdentificacaoNfse>
      <CodigoCancelamento>1</CodigoCancelamento>
    </InfPedidoCancelamento>
  </Pedido>
</CancelarNfseEnvio>`;
}
