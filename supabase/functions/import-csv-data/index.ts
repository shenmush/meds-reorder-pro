import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChemicalDrugData {
  irc: string;
  full_brand_name: string;
  generic_code?: string;
  license_owner_company_name?: string;
  license_owner_company_national_id?: string;
  package_count?: number;
  gtin?: string;
  erx_code?: string;
  action?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting CSV import process...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Read the CSV file content
    const csvContent = await Deno.readTextFile('/opt/app/کدینگ_نسخه‌نویسی_و_نسخه‌پیچی_داروهای_شیمیایی.csv');
    
    console.log('CSV file read successfully');
    
    // Parse CSV content
    const lines = csvContent.split('\n');
    const header = lines[0].split(',');
    
    console.log('CSV header:', header);
    console.log('Total lines:', lines.length);
    
    const drugs: ChemicalDrugData[] = [];
    let processedCount = 0;
    let errorCount = 0;
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      try {
        const values = lines[i].split(',');
        
        // Map CSV columns to database fields
        const drug: ChemicalDrugData = {
          irc: values[0] || '',
          full_brand_name: values[1] || '',
          generic_code: values[2] || null,
          license_owner_company_name: values[3] || null,
          license_owner_company_national_id: values[4] || null,
          package_count: values[5] ? parseInt(values[5]) : null,
          gtin: values[6] || null,
          erx_code: values[7] || null,
          action: values[8] || null,
        };
        
        // Only add if required fields are present
        if (drug.irc && drug.full_brand_name) {
          drugs.push(drug);
          processedCount++;
        } else {
          console.log(`Skipping line ${i}: missing required fields`);
          errorCount++;
        }
        
        // Insert in batches of 100
        if (drugs.length >= 100) {
          const { error } = await supabaseClient
            .from('chemical_drugs')
            .insert(drugs);
          
          if (error) {
            console.error('Error inserting batch:', error);
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: error.message,
                processedCount,
                errorCount 
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500 
              }
            );
          }
          
          console.log(`Inserted batch of ${drugs.length} drugs`);
          drugs.length = 0; // Clear the array
        }
        
      } catch (e) {
        console.error(`Error processing line ${i}:`, e);
        errorCount++;
      }
    }
    
    // Insert remaining drugs
    if (drugs.length > 0) {
      const { error } = await supabaseClient
        .from('chemical_drugs')
        .insert(drugs);
      
      if (error) {
        console.error('Error inserting final batch:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message,
            processedCount,
            errorCount 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      console.log(`Inserted final batch of ${drugs.length} drugs`);
    }
    
    console.log(`Import completed. Processed: ${processedCount}, Errors: ${errorCount}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'CSV data imported successfully',
        processedCount,
        errorCount,
        totalLines: lines.length - 1
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
});