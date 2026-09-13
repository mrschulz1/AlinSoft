import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Manejo de CORS para permitir peticiones desde tu frontend en GitHub Pages
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { patente } = await req.json()
    if (!patente) {
      throw new Error("No se proporcionó ninguna patente.")
    }

    const patenteLimpia = patente.trim().toUpperCase()
    const urlBoostr = `https://api.boostr.cl/vehicle/${patenteLimpia}.json`

    // Realizar la petición a la API de Boostr
    const apiResponse = await fetch(urlBoostr, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-KEY': Deno.env.get('BOOSTR_API_KEY') ?? '' // Asegúrate de guardar tu clave en los secrets de Supabase
      }
    })

    const data = await apiResponse.json()

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})