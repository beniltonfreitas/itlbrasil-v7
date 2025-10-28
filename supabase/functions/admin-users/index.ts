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

    // Verify JWT and check if user is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid token');
    }

    // Check if user has admin or superadmin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (!roles || roles.length === 0) {
      throw new Error('Unauthorized: Admin access required');
    }

    const userRoles = roles.map(r => r.role);
    const isSuperAdmin = userRoles.includes('superadmin');
    const isAdmin = userRoles.includes('admin') || isSuperAdmin;

    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const { action, email, password, userId, name, role } = await req.json();

    switch (action) {
      case 'create_user': {
        console.log('Creating user:', email, 'with role:', role);
        
        // Validação de hierarquia: apenas superadmin pode criar admin/superadmin
        if ((role === 'admin' || role === 'superadmin') && !isSuperAdmin) {
          throw new Error('Unauthorized: Only superadmins can create admin or superadmin users');
        }

        // Validação de senha forte
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        // Create user in auth
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { 
            name,
            role: role || 'author'
          }
        });

        if (createError) {
          throw createError;
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUser.user.id,
            user_id: newUser.user.id,
            name: name || email.split('@')[0],
            email,
            role: role || 'author',
            status: 'active'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: newUser.user.id,
            role: role || 'author'
          });

        if (roleError) {
          console.error('Role assignment error:', roleError);
        }

        console.log('User created successfully:', newUser.user.id, 'with role:', role);
        
        // Log de auditoria
        console.log('AUDIT: User', user.email, 'created user', email, 'with role', role);

        return new Response(
          JSON.stringify({ success: true, user: newUser.user }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set_password': {
        console.log('Setting password for user:', userId);
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          { password }
        );

        if (updateError) {
          throw updateError;
        }

        console.log('Password updated successfully');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete_user': {
        console.log('Deleting user:', userId);
        
        // First try to delete from auth.users
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

        // If user doesn't exist in auth, that's ok - we'll still delete from profiles
        if (deleteError && !deleteError.message.includes('User not found')) {
          throw deleteError;
        }

        if (deleteError && deleteError.message.includes('User not found')) {
          console.log('User not found in auth.users, deleting from profiles only');
        }

        // Also delete from profiles table (in case it's orphaned)
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (profileError) {
          console.error('Profile deletion error:', profileError);
          throw new Error(`Failed to delete profile: ${profileError.message}`);
        }

        console.log('User and profile deleted successfully');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error('Error in admin-users function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes('Unauthorized') ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
