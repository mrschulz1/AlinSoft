

// Variable global para almacenar la instancia única
let supabaseInstance = null;

function initSupabase() {
    if (!supabaseInstance) {
        const SUPABASE_URL = 'https://okkydrwdexacxvfbtopb.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ra3lkcndkZXhhY3h2ZmJ0b3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjU0MzgsImV4cCI6MjA5OTcwMTQzOH0.ekbFeG6r176fbanPDUin0O_jwDcnmRRUVrJL3ohgXeE'; // Asegúrate de colocar tu llave pública real

        if (typeof supabase !== 'undefined') {
            supabaseInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error("El SDK de Supabase no se ha cargado.");
            return null;
        }
    }
    return supabaseInstance;
}