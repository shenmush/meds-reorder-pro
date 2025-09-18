import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!supabaseServiceKey || !supabaseUrl) {
      throw new Error('Missing Supabase configuration');
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // Verify the requesting user is authorized (pharmacy_manager)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is pharmacy_manager
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role, pharmacy_id')
      .eq('user_id', user.id)
      .eq('role', 'pharmacy_manager');

    if (roleError || !userRoles || userRoles.length === 0) {
      throw new Error('User is not a pharmacy manager');
    }

    const pharmacyId = userRoles[0].pharmacy_id;

    // Get request body
    const { email, password, displayName, role } = await req.json();

    if (!email || !password || !displayName || !role) {
      throw new Error('Missing required fields');
    }

    if (!['pharmacy_staff', 'pharmacy_accountant'].includes(role)) {
      throw new Error('Invalid role');
    }

    // Check staff limits
    const { data: existingStaff, error: staffError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('pharmacy_id', pharmacyId)
      .in('role', ['pharmacy_staff', 'pharmacy_accountant']);

    if (staffError) {
      throw new Error('Failed to check existing staff');
    }

    const staffCount = existingStaff?.filter(s => s.role === 'pharmacy_staff').length || 0;
    const accountantCount = existingStaff?.filter(s => s.role === 'pharmacy_accountant').length || 0;

    if (role === 'pharmacy_staff' && staffCount >= 3) {
      throw new Error('حداکثر 3 کارمند قابل ایجاد است');
    }

    if (role === 'pharmacy_accountant' && accountantCount >= 3) {
      throw new Error('حداکثر 3 حسابدار قابل ایجاد است');
    }

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        display_name: displayName
      },
      email_confirm: true // Auto-confirm email
    });

    if (createError) {
      if (createError.message.includes('already registered')) {
        throw new Error('این ایمیل قبلاً ثبت شده است');
      }
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('کاربر ایجاد نشد');
    }

    // Create user role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role,
        pharmacy_id: pharmacyId
      });

    if (roleInsertError) {
      // If role creation fails, cleanup the user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw roleInsertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          display_name: displayName,
          role: role
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'خطا در ایجاد کاربر' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});