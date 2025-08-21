import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Import function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting import process...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Instead of reading file, we'll get CSV data from request body
    let csvData: string;
    
    if (req.method === 'POST') {
      // If CSV data is sent in request body
      csvData = await req.text();
    } else {
      // Return error - we need CSV data
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'CSV data required in request body'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('CSV data received, length:', csvData.length);
    
    // Start background processing
    EdgeRuntime.waitUntil(processCSVData(supabaseClient, csvData));
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Import process started successfully',
        status: 'processing'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})

async function processCSVData(supabaseClient: any, csvData: string) {
  try {
    console.log('Processing CSV data...');
    
    const lines = csvData.split('\n');
    console.log('Total lines:', lines.length);
    
    let processedCount = 0;
    let errorCount = 0;
    const batchSize = 50;
    
    // Skip header and process in batches
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch: any[] = [];
      
      for (let j = i; j < Math.min(i + batchSize, lines.length); j++) {
        const line = lines[j]?.trim();
        if (!line) continue;
        
        try {
          const values = parseCSVLine(line);
          
          if (values.length >= 2) {
            const drug = {
              irc: cleanValue(values[0]),
              full_brand_name: cleanValue(values[1]),
              generic_code: cleanValue(values[2]) || null,
              license_owner_company_name: cleanValue(values[3]) || null,
              license_owner_company_national_id: cleanValue(values[4]) || null,
              package_count: values[5] ? parseInt(cleanValue(values[5])) : null,
              gtin: cleanValue(values[6]) || null,
              erx_code: cleanValue(values[7]) || null,
              action: cleanValue(values[8]) || null,
            };
            
            if (drug.irc && drug.full_brand_name) {
              batch.push(drug);
            }
          }
        } catch (parseError) {
          console.error(`Error parsing line ${j}:`, parseError);
          errorCount++;
        }
      }
      
      if (batch.length > 0) {
        try {
          const { error } = await supabaseClient
            .from('chemical_drugs')
            .insert(batch);
          
          if (error) {
            console.error('Insert error:', error);
            errorCount += batch.length;
          } else {
            processedCount += batch.length;
            console.log(`Processed ${processedCount} records so far...`);
          }
        } catch (insertError) {
          console.error('Insert error:', insertError);
          errorCount += batch.length;
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`Import completed! Processed: ${processedCount}, Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Processing error:', error);
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function cleanValue(value: string): string {
  return value?.replace(/^"/, '').replace(/"$/, '').trim() || '';
}