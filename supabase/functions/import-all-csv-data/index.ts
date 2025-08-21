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
    console.log('Starting complete CSV import process...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Start background task for processing
    EdgeRuntime.waitUntil(processAllCSVData(supabaseClient));
    
    // Return immediate response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Import process started in background',
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

async function processAllCSVData(supabaseClient: any) {
  try {
    console.log('Reading CSV file...');
    
    // Try to read the CSV file from the project root
    const csvPath = '/opt/app/کدینگ_نسخه‌نویسی_و_نسخه‌پیچی_داروهای_شیمیایی.csv';
    let csvContent: string;
    
    try {
      csvContent = await Deno.readTextFile(csvPath);
    } catch (readError) {
      console.error('Error reading CSV file from path:', csvPath, readError);
      
      // Alternative path if the first doesn't work
      const altPath = './کدینگ_نسخه‌نویسی_و_نسخه‌پیچی_داروهای_شیمیایی.csv';
      try {
        csvContent = await Deno.readTextFile(altPath);
      } catch (altError) {
        console.error('Error reading from alternative path:', altPath, altError);
        throw new Error('Could not read CSV file from any known path');
      }
    }
    
    console.log('CSV file read successfully, length:', csvContent.length);
    
    // Parse CSV content
    const lines = csvContent.split('\n');
    console.log('Total lines in CSV:', lines.length);
    
    let processedCount = 0;
    let errorCount = 0;
    let batchCount = 0;
    const batchSize = 50; // Smaller batch size for reliability
    
    // Skip header line and process in batches
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch: ChemicalDrugData[] = [];
      
      // Process batch
      for (let j = i; j < Math.min(i + batchSize, lines.length); j++) {
        const line = lines[j]?.trim();
        if (!line) continue;
        
        try {
          // Handle CSV parsing with quotes and commas
          const values = parseCSVLine(line);
          
          if (values.length >= 2) { // At least IRC and name required
            const drug: ChemicalDrugData = {
              irc: values[0]?.replace(/^"/, '').replace(/"$/, '') || '',
              full_brand_name: values[1]?.replace(/^"/, '').replace(/"$/, '') || '',
              generic_code: values[2]?.replace(/^"/, '').replace(/"$/, '') || null,
              license_owner_company_name: values[3]?.replace(/^"/, '').replace(/"$/, '') || null,
              license_owner_company_national_id: values[4]?.replace(/^"/, '').replace(/"$/, '') || null,
              package_count: values[5] ? parseInt(values[5].replace(/^"/, '').replace(/"$/, '')) : null,
              gtin: values[6]?.replace(/^"/, '').replace(/"$/, '') || null,
              erx_code: values[7]?.replace(/^"/, '').replace(/"$/, '') || null,
              action: values[8]?.replace(/^"/, '').replace(/"$/, '') || null,
            };
            
            // Only add if required fields are present
            if (drug.irc && drug.full_brand_name) {
              batch.push(drug);
            }
          }
        } catch (parseError) {
          console.error(`Error parsing line ${j}:`, parseError);
          errorCount++;
        }
      }
      
      // Insert batch if not empty
      if (batch.length > 0) {
        try {
          const { error } = await supabaseClient
            .from('chemical_drugs')
            .insert(batch);
          
          if (error) {
            console.error(`Error inserting batch ${batchCount}:`, error);
            errorCount += batch.length;
          } else {
            processedCount += batch.length;
            batchCount++;
            console.log(`Batch ${batchCount} completed: ${batch.length} records processed. Total: ${processedCount}`);
          }
        } catch (insertError) {
          console.error(`Insert error for batch ${batchCount}:`, insertError);
          errorCount += batch.length;
        }
      }
      
      // Small delay between batches to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Import completed! Processed: ${processedCount}, Errors: ${errorCount}, Batches: ${batchCount}`);
    
  } catch (error) {
    console.error('Background processing error:', error);
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
      current += char;
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