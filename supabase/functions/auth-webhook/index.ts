import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('AUTH_WEBHOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    // Verify webhook signature if secret is provided
    if (hookSecret) {
      const wh = new Webhook(hookSecret)
      try {
        wh.verify(payload, headers)
      } catch (error) {
        console.error('Webhook verification failed:', error)
        return new Response('Unauthorized', { 
          status: 401,
          headers: corsHeaders 
        })
      }
    }

    const data = JSON.parse(payload)
    console.log('Received webhook data:', data)

    const {
      user,
      email_data: { 
        token_hash, 
        redirect_to, 
        email_action_type,
        site_url 
      },
    } = data

    // Only handle confirmation emails
    if (email_action_type !== 'signup') {
      return new Response('Email type not handled', { 
        status: 200,
        headers: corsHeaders 
      })
    }

    const confirmation_url = `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || site_url}`

    // Render the React email template
    const html = await renderAsync(
      React.createElement(ConfirmationEmail, {
        confirmation_url,
        site_url,
        email: user.email,
      })
    )

    // Send email using Resend
    const { error } = await resend.emails.send({
      from: 'سیستم مدیریت داروخانه <noreply@yourdomain.com>',
      to: [user.email],
      subject: 'تایید حساب کاربری - سیستم مدیریت داروخانه',
      html,
    })

    if (error) {
      console.error('Email sending error:', error)
      throw error
    }

    console.log('Confirmation email sent successfully to:', user.email)

    return new Response(
      JSON.stringify({ success: true }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('Error in auth-webhook function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    )
  }
})