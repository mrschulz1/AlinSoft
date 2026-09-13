import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejo del preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { patente } = await req.json();

    if (!patente) {
      return new Response(
        JSON.stringify({ error: 'La patente es requerida' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener el Token JWT desde las variables de entorno de Supabase
    const BOOSTR_TOKEN = Deno.env.get('BOOSTR_TOKEN');

    if (!BOOSTR_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Token de API no configurado en el servidor' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Consulta Server-to-Server hacia Boostr API
    const response = await fetch(
      `https://api.boostr.cl/vehicle/${patente}.json?include=owner`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${BOOSTR_TOKEN}`
        }
      }
    );

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { status: response.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});