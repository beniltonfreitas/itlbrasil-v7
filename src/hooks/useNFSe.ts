import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmitirNFSeParams {
  perfilId?: string;
  valorServicos: number;
  discriminacao: string;
  tomador: {
    documento: string;
    razaoSocial: string;
    tipo: "PF" | "PJ";
    email?: string;
    telefone?: string;
    endereco?: {
      logradouro?: string;
      numero?: string;
      bairro?: string;
      cep?: string;
      uf?: string;
      municipioIbge?: number;
    };
  };
  simular?: boolean;
}

export interface CancelarNFSeParams {
  perfilId?: string;
  numeroNfse: string;
  motivo: string;
}

export function useNFSe() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const emitirNFSe = async (params: EmitirNFSeParams) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nfse-emitir", {
        body: params,
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ NFS-e emitida",
          description: `RPS ${data.rpsSerie}-${data.rpsNumero} • ${data.situacao}`,
        });
      } else {
        toast({
          title: "⚠️ Erro ao emitir",
          description: data.retorno || "Erro desconhecido",
          variant: "destructive",
        });
      }

      return data;
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message || "Falha ao emitir NFS-e",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelarNFSe = async (params: CancelarNFSeParams) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nfse-cancelar", {
        body: params,
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ NFS-e cancelada",
          description: `Nota ${data.numeroNfse} cancelada com sucesso`,
        });
      } else {
        toast({
          title: "⚠️ Erro ao cancelar",
          description: data.retorno || "Erro desconhecido",
          variant: "destructive",
        });
      }

      return data;
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message || "Falha ao cancelar NFS-e",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    emitirNFSe,
    cancelarNFSe,
    loading,
  };
}
