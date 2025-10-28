import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { 
      tables = ['articles', 'categories', 'authors', 'site_settings'],
      format = 'json' 
    } = await req.json();

    console.log('Starting backup for tables:', tables);

    const backupData: { [key: string]: any } = {};
    const timestamp = new Date().toISOString();

    // Backup de cada tabela
    for (const table of tables) {
      try {
        console.log(`Backing up table: ${table}`);
        
        const { data, error } = await supabaseClient
          .from(table)
          .select('*');

        if (error) {
          console.error(`Erro ao fazer backup da tabela ${table}:`, error);
          backupData[table] = { error: error.message };
        } else {
          backupData[table] = {
            count: data?.length || 0,
            data: data || []
          };
        }
      } catch (tableError) {
        console.error(`Erro na tabela ${table}:`, tableError);
        backupData[table] = { error: tableError instanceof Error ? tableError.message : String(tableError) };
      }
    }

    // Metadados do backup
    const backupMetadata = {
      timestamp,
      version: '1.0',
      source: 'ITL Brasil',
      tables: tables,
      totalRecords: Object.values(backupData).reduce((total, tableData: any) => {
        return total + (tableData.count || 0);
      }, 0)
    };

    const backupResult = {
      metadata: backupMetadata,
      data: backupData
    };

    // Salvar backup no storage se solicitado
    const { saveToStorage = false, fileName = null } = await req.json().catch(() => ({}));
    
    if (saveToStorage) {
      const backupFileName = fileName || `backup-${timestamp.split('T')[0]}-${Date.now()}.json`;
      const backupContent = JSON.stringify(backupResult, null, 2);
      
      const { error: storageError } = await supabaseClient.storage
        .from('documents')
        .upload(`backups/${backupFileName}`, new Blob([backupContent], { type: 'application/json' }), {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Erro ao salvar backup no storage:', storageError);
      } else {
        console.log('Backup salvo no storage:', backupFileName);
      }
    }

    // Executar limpeza automática se solicitado
    const { cleanup = false } = await req.json().catch(() => ({}));
    if (cleanup) {
      try {
        await supabaseClient.rpc('cleanup_old_logs');
        console.log('Limpeza automática executada');
      } catch (cleanupError) {
        console.error('Erro na limpeza automática:', cleanupError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      backup: backupResult,
      message: `Backup concluído: ${backupMetadata.totalRecords} registros de ${tables.length} tabelas`
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-${timestamp.split('T')[0]}.json"`
      },
    });

  } catch (error) {
    console.error('Erro na função de backup:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});