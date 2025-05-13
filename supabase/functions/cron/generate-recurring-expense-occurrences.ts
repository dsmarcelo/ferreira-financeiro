import { createClient } from "@supabase/supabase-js";
// If you have a generated Database type, import it. Otherwise, use 'any' for now.
// import { Database } from '@/types/supabase';

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient<any>(supabaseUrl, supabaseServiceRoleKey);

function getTodayDate() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export default async function handler(req: Request) {
  try {
    const today = getTodayDate();
    // Get all active recurring expenses that should trigger today
    const { data: recurringExpenses, error } = await supabase
      .from("recurring_expense")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", today)
      .or(`end_date.is.null,end_date.gte.${today}`);

    if (error) throw error;
    if (!recurringExpenses)
      return new Response(JSON.stringify({ created: 0 }), {
        headers: { "Content-Type": "application/json" },
      });

    let created = 0;
    for (const exp of recurringExpenses) {
      // Check if an occurrence already exists for today
      const { data: existing, error: existingError } = await supabase
        .from("recurring_expense_occurrence")
        .select("id")
        .eq("recurring_expense_id", exp.id)
        .eq("due_date", today)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) continue;
      // Create occurrence for today
      const { error: insertError } = await supabase
        .from("recurring_expense_occurrence")
        .insert({
          recurring_expense_id: exp.id,
          due_date: today,
          value: exp.value,
          is_paid: false,
        });
      if (insertError) throw insertError;
      created++;
    }
    return new Response(JSON.stringify({ created }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Cron job error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Supabase Edge Function entrypoint
Deno.serve(handler);
