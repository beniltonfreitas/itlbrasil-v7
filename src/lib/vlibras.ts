/**
 * VLibras - Assistente virtual de tradução para Libras
 * https://www.gov.br/governodigital/pt-br/vlibras
 */

declare global {
  interface Window {
    VLibras?: {
      Widget: new (src: string) => void;
    };
  }
}

let isVLibrasLoaded = false;

export const loadVLibras = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Se já está carregado, resolve imediatamente
    if (isVLibrasLoaded && window.VLibras) {
      resolve();
      return;
    }

    // Verifica se o script já existe
    const existingScript = document.getElementById('vlibras-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Remove widget anterior se existir
    const existingWidget = document.querySelector('[vw]');
    if (existingWidget) {
      existingWidget.remove();
    }

    // Cria elemento container do widget
    const widgetDiv = document.createElement('div');
    widgetDiv.setAttribute('vw', '');
    widgetDiv.className = 'enabled';
    widgetDiv.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(widgetDiv);

    // Carrega o script
    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    
    script.onload = () => {
      try {
        if (window.VLibras) {
          new window.VLibras.Widget('https://vlibras.gov.br/app');
          isVLibrasLoaded = true;
          resolve();
        } else {
          reject(new Error('VLibras não foi carregado corretamente'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    script.onerror = () => {
      reject(new Error('Falha ao carregar VLibras'));
    };

    document.body.appendChild(script);
  });
};

export const unloadVLibras = () => {
  // Remove script
  const script = document.getElementById('vlibras-script');
  if (script) {
    script.remove();
  }

  // Remove widget
  const widget = document.querySelector('[vw]');
  if (widget) {
    widget.remove();
  }

  isVLibrasLoaded = false;
};
