import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';

export default function EditionSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Gerador</h1>
        <p className="text-muted-foreground">Configure padrões e preferências globais</p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Padrões de Edição</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_columns">Colunas Padrão</Label>
              <select id="default_columns" className="w-full border rounded-md px-3 py-2">
                <option value="1">1 coluna</option>
                <option value="2">2 colunas</option>
                <option value="3">3 colunas</option>
              </select>
            </div>
            <div>
              <Label htmlFor="default_theme">Tema Padrão</Label>
              <select id="default_theme" className="w-full border rounded-md px-3 py-2">
                <option value="claro">Claro</option>
                <option value="escuro">Escuro</option>
                <option value="sepia">Sépia</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_font">Fonte Padrão</Label>
              <select id="default_font" className="w-full border rounded-md px-3 py-2">
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-serif</option>
                <option value="mono">Mono</option>
              </select>
            </div>
            <div>
              <Label htmlFor="default_font_size">Tamanho de Fonte Padrão (px)</Label>
              <Input id="default_font_size" type="number" defaultValue="16" min="12" max="24" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Recursos de Acessibilidade</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable_tts">Text-to-Speech (TTS)</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir leitura de voz automática
                </p>
              </div>
              <Switch id="enable_tts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable_vlibras">VLibras</Label>
                <p className="text-sm text-muted-foreground">
                  Intérprete de Libras virtual
                </p>
              </div>
              <Switch id="enable_vlibras" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable_high_contrast">Alto Contraste</Label>
                <p className="text-sm text-muted-foreground">
                  Modo de alto contraste automático
                </p>
              </div>
              <Switch id="enable_high_contrast" defaultChecked />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">SEO e Metadados</h2>
          
          <div>
            <Label htmlFor="default_publisher">Editora Padrão</Label>
            <Input id="default_publisher" placeholder="Nome da editora" />
          </div>

          <div>
            <Label htmlFor="default_logo">Logo Padrão (URL)</Label>
            <Input id="default_logo" placeholder="https://..." />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="auto_sitemap" defaultChecked />
            <Label htmlFor="auto_sitemap">Gerar sitemap automaticamente</Label>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Exportação</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable_pdf">Exportar PDF</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir download em PDF
                </p>
              </div>
              <Switch id="enable_pdf" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable_epub">Exportar EPUB</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir download em EPUB
                </p>
              </div>
              <Switch id="enable_epub" defaultChecked />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
