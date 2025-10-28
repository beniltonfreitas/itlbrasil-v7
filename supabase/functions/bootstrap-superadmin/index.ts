import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const bootstrapSecret = Deno.env.get('BOOTSTRAP_SECRET_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { secret } = await req.json();

    // Verificar token secreto
    if (secret !== bootstrapSecret) {
      console.error('Invalid bootstrap secret provided');
      throw new Error('Unauthorized: Invalid bootstrap secret');
    }

    console.log('Starting bootstrap process...');

    // Verificar se já existe algum superadmin
    const { data: existingSuperadmin, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'superadmin')
      .limit(1);

    if (checkError) {
      console.error('Error checking for existing superadmin:', checkError);
      throw new Error(`Failed to check existing superadmin: ${checkError.message}`);
    }

    if (existingSuperadmin && existingSuperadmin.length > 0) {
      console.log('Superadmin already exists, bootstrap disabled');
      return new Response(
        JSON.stringify({ 
          error: 'Bootstrap already completed. Superadmin exists.',
          message: 'This function can only be used once and is now disabled.'
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Criar o Super Admin: bs7freitas@gmail.com
    console.log('Creating superadmin user: bs7freitas@gmail.com');
    const { data: superAdminUser, error: superAdminError } = await supabase.auth.admin.createUser({
      email: 'bs7freitas@gmail.com',
      password: 'S!pErAdm1n#7Kz9Rvx2QbT6y!',
      email_confirm: true,
      user_metadata: { 
        name: 'Bruno Freitas',
        role: 'superadmin'
      }
    });

    if (superAdminError) {
      console.error('Error creating superadmin user:', superAdminError);
      throw new Error(`Failed to create superadmin: ${superAdminError.message}`);
    }

    console.log('Superadmin user created successfully:', superAdminUser.user.id);

    // Criar perfil do superadmin
    const { error: superAdminProfileError } = await supabase
      .from('profiles')
      .insert({
        id: superAdminUser.user.id,
        user_id: superAdminUser.user.id,
        name: 'Bruno Freitas',
        email: 'bs7freitas@gmail.com',
        role: 'superadmin',
        status: 'active'
      });

    if (superAdminProfileError) {
      console.error('Error creating superadmin profile:', superAdminProfileError);
    }

    // Atribuir role de superadmin
    const { error: superAdminRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: superAdminUser.user.id,
        role: 'superadmin'
      });

    if (superAdminRoleError) {
      console.error('Error assigning superadmin role:', superAdminRoleError);
      throw new Error(`Failed to assign superadmin role: ${superAdminRoleError.message}`);
    }

    console.log('Superadmin role assigned successfully');

    // Criar o Admin: chiquinhomachado@gmail.com
    console.log('Creating admin user: chiquinhomachado@gmail.com');
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'chiquinhomachado@gmail.com',
      password: 'fcsm303118',
      email_confirm: true,
      user_metadata: { 
        name: 'Chiquinho Machado',
        role: 'admin'
      }
    });

    if (adminError) {
      console.error('Error creating admin user:', adminError);
      throw new Error(`Failed to create admin: ${adminError.message}`);
    }

    console.log('Admin user created successfully:', adminUser.user.id);

    // Criar perfil do admin
    const { error: adminProfileError } = await supabase
      .from('profiles')
      .insert({
        id: adminUser.user.id,
        user_id: adminUser.user.id,
        name: 'Chiquinho Machado',
        email: 'chiquinhomachado@gmail.com',
        role: 'admin',
        status: 'active'
      });

    if (adminProfileError) {
      console.error('Error creating admin profile:', adminProfileError);
    }

    // Atribuir role de admin
    const { error: adminRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: adminUser.user.id,
        role: 'admin'
      });

    if (adminRoleError) {
      console.error('Error assigning admin role:', adminRoleError);
      throw new Error(`Failed to assign admin role: ${adminRoleError.message}`);
    }

    console.log('Admin role assigned successfully');

    console.log('Bootstrap completed successfully!');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Bootstrap completed successfully',
        users: {
          superadmin: {
            email: 'bs7freitas@gmail.com',
            id: superAdminUser.user.id,
            role: 'superadmin'
          },
          admin: {
            email: 'chiquinhomachado@gmail.com',
            id: adminUser.user.id,
            role: 'admin'
          }
        },
        note: 'This function is now disabled and can only be used once.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in bootstrap-superadmin function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Bootstrap process failed. Check logs for details.'
      }),
      { 
        status: error.message.includes('Unauthorized') ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
