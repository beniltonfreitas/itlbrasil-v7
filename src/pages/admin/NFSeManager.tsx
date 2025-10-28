import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNFSe, EmitirNFSeParams } from "@/hooks/useNFSe";
import { FileText, XCircle, List } from "lucide-react";

export default function NFSeManager() {
  const { emitirNFSe, cancelarNFSe, loading } = useNFSe();
  
  const [formData, setFormData] = useState<EmitirNFSeParams>({
    valorServicos: 0,
    discriminacao: "",
    tomador: {
      documento: "",
      razaoSocial: "",
      tipo: "PJ",
    },
    simular: false,
  });

  const [cancelData, setCancelData] = useState({
    numeroNfse: "",
    motivo: "",
  });

  const handleEmitir = async (e: React.FormEvent) => {
    e.preventDefault();
    await emitirNFSe(formData);
  };

  const handleCancelar = async (e: React.FormEvent) => {
    e.preventDefault();
    await cancelarNFSe(cancelData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciador de NFS-e</h1>
        <p className="text-muted-foreground">Sistema de emissão e cancelamento de Notas Fiscais de Serviço Eletrônicas</p>
      </div>

      <Tabs defaultValue="emitir" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emitir">
            <FileText className="w-4 h-4 mr-2" />
            Emitir NFS-e
          </TabsTrigger>
          <TabsTrigger value="cancelar">
            <XCircle className="w-4 h-4 mr-2" />
            Cancelar NFS-e
          </TabsTrigger>
          <TabsTrigger value="listar">
            <List className="w-4 h-4 mr-2" />
            Listar Notas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emitir">
          <Card>
            <CardHeader>
              <CardTitle>Nova Nota Fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmitir} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valorServicos">Valor dos Serviços (R$)</Label>
                    <Input
                      id="valorServicos"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.valorServicos}
                      onChange={(e) => setFormData({ ...formData, valorServicos: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoTomador">Tipo de Tomador</Label>
                    <Select
                      value={formData.tomador.tipo}
                      onValueChange={(value: "PF" | "PJ") => 
                        setFormData({ ...formData, tomador: { ...formData.tomador, tipo: value } })
                      }
                    >
                      <SelectTrigger id="tipoTomador">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PF">Pessoa Física</SelectItem>
                        <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento">
                    {formData.tomador.tipo === "PF" ? "CPF" : "CNPJ"}
                  </Label>
                  <Input
                    id="documento"
                    required
                    placeholder={formData.tomador.tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                    value={formData.tomador.documento}
                    onChange={(e) => 
                      setFormData({ ...formData, tomador: { ...formData.tomador, documento: e.target.value.replace(/\D/g, "") } })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">
                    {formData.tomador.tipo === "PF" ? "Nome Completo" : "Razão Social"}
                  </Label>
                  <Input
                    id="razaoSocial"
                    required
                    value={formData.tomador.razaoSocial}
                    onChange={(e) => 
                      setFormData({ ...formData, tomador: { ...formData.tomador, razaoSocial: e.target.value } })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discriminacao">Discriminação dos Serviços</Label>
                  <Textarea
                    id="discriminacao"
                    required
                    rows={4}
                    placeholder="Descreva os serviços prestados..."
                    value={formData.discriminacao}
                    onChange={(e) => setFormData({ ...formData, discriminacao: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="simular"
                    checked={formData.simular}
                    onChange={(e) => setFormData({ ...formData, simular: e.target.checked })}
                    className="rounded border-input"
                  />
                  <Label htmlFor="simular" className="cursor-pointer">
                    Modo de simulação (não enviará para prefeitura)
                  </Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Processando..." : "Emitir NFS-e"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelar">
          <Card>
            <CardHeader>
              <CardTitle>Cancelar Nota Fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCancelar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroNfse">Número da NFS-e</Label>
                  <Input
                    id="numeroNfse"
                    required
                    placeholder="123456"
                    value={cancelData.numeroNfse}
                    onChange={(e) => setCancelData({ ...cancelData, numeroNfse: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo do Cancelamento</Label>
                  <Textarea
                    id="motivo"
                    required
                    rows={3}
                    placeholder="Informe o motivo do cancelamento..."
                    value={cancelData.motivo}
                    onChange={(e) => setCancelData({ ...cancelData, motivo: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={loading} variant="destructive" className="w-full">
                  {loading ? "Processando..." : "Cancelar NFS-e"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listar">
          <Card>
            <CardHeader>
              <CardTitle>Notas Fiscais Emitidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de listagem será implementada em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
