import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: corsHeaders }
      )
    }

    const csvData = await req.text()
    
    if (!csvData) {
      return new Response(
        JSON.stringify({ error: 'No CSV data provided' }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('Starting natural products import process...')
    
    // Start processing in background
    EdgeRuntime.waitUntil(processCSVData(supabaseClient, csvData))
    
    return new Response(
      JSON.stringify({ success: true, message: 'Natural products import started' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in import-natural-products:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processCSVData(supabaseClient: any, csvData: string) {
  try {
    console.log('Processing natural products CSV data...')
    console.log('CSV data first 500 characters:', csvData.substring(0, 500))
    
    const lines = csvData.split('\n').filter(line => line.trim())
    console.log(`Total lines: ${lines.length}`)
    
    // Skip header row and limit to first 20 records for testing
    const dataLines = lines.slice(1, 21) // Only first 20 records for testing
    console.log(`Data lines to process (TEST): ${dataLines.length}`)
    
    let processedCount = 0
    let errorCount = 0
    const batchSize = 50
    
    for (let i = 0; i < dataLines.length; i += batchSize) {
      const batch = dataLines.slice(i, i + batchSize)
      const records = []
      
      for (const line of batch) {
        try {
          const values = parseCSVLine(line)
          
          if (values.length >= 9) {
            const record = {
              irc: cleanValue(values[0]) || '',
              atc_code: cleanValue(values[1]) || null, // Column 1 has ATC code
              full_en_brand_name: cleanValue(values[2]) || '', // Column 2 has the brand name
              license_owner_name: cleanValue(values[3]) || null, // Company name in column 3
              license_owner_national_code: cleanValue(values[4]) || null, // Company national code in column 4
              erx_code: cleanValue(values[5]) || null, // ErxCode is in column 5
              package_count: values[6] ? parseInt(cleanValue(values[6])) || null : null, // Package count in column 6
              gtin: cleanValue(values[7]) || null, // GTIN in column 7
              action: cleanValue(values[8]) || null // Action/Status is in column 8
            }
            
            records.push(record)
          }
        } catch (parseError) {
          console.error('Error parsing line:', parseError)
          errorCount++
        }
      }
      
      if (records.length > 0) {
        const { error } = await supabaseClient
          .from('natural_products')
          .insert(records)
        
        if (error) {
          console.error('Batch insert error:', error)
          errorCount += records.length
        } else {
          processedCount += records.length
        }
      }
      
      // Log progress every 50 records
      if (processedCount % 50 === 0) {
        console.log(`Processed ${processedCount} natural products so far...`)
      }
    }
    
    console.log(`Natural products import completed! Processed: ${processedCount}, Errors: ${errorCount}`)
  } catch (error) {
    console.error('Error in processCSVData:', error)
  }
}

function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

function cleanValue(value: string): string {
  return value.replace(/^"|"$/g, '').trim()
}