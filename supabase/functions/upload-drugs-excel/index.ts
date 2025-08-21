import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tableType = formData.get('tableType') as string;

    if (!file || !tableType) {
      return new Response(JSON.stringify({ error: 'File and table type are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse Excel/CSV content
    const content = await file.text();
    const lines = content.split('\n');
    const headers = lines[0].split('\t');
    
    console.log(`Processing ${tableType} with ${lines.length - 1} rows`);

    // Helper function to clean null characters and trim
    const cleanValue = (value: string | undefined): string | null => {
      if (!value) return null;
      // Remove null characters (\u0000) and other problematic characters
      const cleaned = value.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
      return cleaned || null;
    };

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split('\t');
        const row: any = {};
        
        // Map headers to database columns based on table type
        if (tableType === 'chemical_drugs') {
          row.irc = cleanValue(values[0]);
          row.full_brand_name = cleanValue(values[1]);
          row.license_owner_company_name = cleanValue(values[2]);
          row.license_owner_company_national_id = cleanValue(values[3]);
          row.package_count = values[4] && cleanValue(values[4]) ? parseInt(cleanValue(values[4])!) : null;
          row.erx_code = cleanValue(values[5]);
          row.gtin = cleanValue(values[6]);
          row.action = cleanValue(values[7]);
        } else if (tableType === 'natural_products') {
          row.irc = cleanValue(values[0]);
          row.full_en_brand_name = cleanValue(values[1]);
          row.license_owner_name = cleanValue(values[2]);
          row.license_owner_national_code = cleanValue(values[3]);
          row.package_count = values[4] && cleanValue(values[4]) ? parseInt(cleanValue(values[4])!) : null;
          row.erx_code = cleanValue(values[5]);
          row.gtin = cleanValue(values[6]);
          row.action = cleanValue(values[7]);
        } else if (tableType === 'medical_supplies') {
          row.irc = cleanValue(values[0]);
          row.title = cleanValue(values[1]);
          row.license_owner_company_name = cleanValue(values[2]);
          row.license_owner_company_national_code = cleanValue(values[3]);
          row.package_count = values[4] && cleanValue(values[4]) ? parseInt(cleanValue(values[4])!) : null;
          row.erx_code = cleanValue(values[5]);
          row.gtin = cleanValue(values[6]);
          row.action = cleanValue(values[7]);
        }
        
        data.push(row);
      }
    }

    // Insert data in batches
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { error } = await supabaseClient
        .from(tableType)
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${i}-${i + batchSize}:`, error);
        throw error;
      }
      
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${data.length} records`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully imported ${inserted} records to ${tableType}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-drugs-excel function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});