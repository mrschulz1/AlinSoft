import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { patente } = await req.json()

    if (!patente) {
      return new Response(
        JSON.stringify({ error: 'Debes proporcionar una patente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Petición a la API externa (ej. API de patentes / Boostr)
    const API_URL = `https://api.vehiculos.cl/v1/patente/${patente}` // Reemplaza con tu endpoint real de API
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('API_PATENTES_KEY') || ''}`
      }
    })

    if (!response.ok) {
      throw new Error(`Error en la consulta externa: ${response.status}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})