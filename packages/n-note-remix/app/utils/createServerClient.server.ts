import { createServerClient as createServerClient_ } from '@supabase/auth-helpers-remix';
import type { Database } from '~/../database';

export default function createServerClient(request: Request) {
    const response = new Response();
    const supabase = createServerClient_<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { request, response }
    );
    return { supabase, response, headers: response.headers };
}
