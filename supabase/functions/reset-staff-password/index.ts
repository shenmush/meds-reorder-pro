import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { userId, pharmacyEnglishName } = await req.json();

    console.log('Reset password request for user:', userId);

    // Verify the requester is a pharmacy manager
    const { data: managerRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('pharmacy_id')
      .eq('user_id', user.id)
      .eq('role', 'pharmacy_manager')
      .single();

    if (roleError || !managerRole) {
      throw new Error('Only pharmacy managers can reset staff passwords');
    }

    // Verify the target user belongs to the same pharmacy
    const { data: staffRole, error: staffRoleError } = await supabaseClient
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('pharmacy_id', managerRole.pharmacy_id)
      .in('role', ['pharmacy_staff', 'pharmacy_accountant'])
      .single();

    if (staffRoleError || !staffRole) {
      throw new Error('Staff member not found or access denied');
    }

    // Generate new random password (6 digits)
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();

    // Get current user metadata to extract username
    const { data: currentUserData, error: getUserError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (getUserError || !currentUserData.user) {
      throw new Error('Failed to get user data');
    }

    const username = currentUserData.user.user_metadata?.username || 'unknown';

    // Update user password
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      throw new Error('Failed to update password');
    }

    console.log('Password reset successfully for user:', userId);

    return new Response(
      JSON.stringify({
        success: true,
        username: username,
        password: newPassword
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in reset-staff-password function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});