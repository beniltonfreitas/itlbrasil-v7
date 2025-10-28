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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    console.log(`🔍 Checking roles for user: ${email || userId}`);

    // Check if user already has roles
    const { data: existingRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (rolesError) {
      console.error('Error checking existing roles:', rolesError);
      throw rolesError;
    }

    // If user has no roles
    if (!existingRoles || existingRoles.length === 0) {
      console.log(`📝 No roles found for ${email}. Creating default role...`);

      // Special case: bs7freitas@gmail.com gets superadmin
      const defaultRole = (email === 'bs7freitas@gmail.com') ? 'superadmin' : 'author';

      const { data: newRole, error: createError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: defaultRole
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating role:', createError);
        throw createError;
      }

      console.log(`✅ Created ${defaultRole} role for ${email}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          roleCreated: true,
          role: defaultRole,
          message: `Role ${defaultRole} created successfully`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log(`✅ User ${email} already has roles:`, existingRoles.map(r => r.role));

      return new Response(
        JSON.stringify({ 
          success: true, 
          roleCreated: false,
          roles: existingRoles.map(r => r.role),
          message: 'User already has roles'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in auto-provision-roles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
