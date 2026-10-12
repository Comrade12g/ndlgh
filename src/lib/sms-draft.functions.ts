import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM = `You write SMS notifications for NDL Ghana, a China-to-Ghana shipping company (sender ID "NDL").
Rules: one plain-text SMS, max 300 characters, friendly and clear, address the customer by first name,
include the shipping mark / reference given, state the update and any next step. No emojis, no markdown,
no quotes around the message. Never invent dates, amounts, or facts that were not provided.
End with "- NDL" . Output only the SMS text.`;

export const draftSms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      name: z.string().max(120),
      mark: z.string().max(40).optional().default(""),
      reference: z.string().max(80).optional().default(""),
      update: z.string().min(3).max(1500),
      tone: z.string().max(40).optional().default("friendly"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: staff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!staff) throw new Error("Staff only");
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const userMsg = `Customer name: ${data.name}\nShipping mark: ${data.mark || "-"}\nReference/tracking: ${data.reference || "-"}\nTone: ${data.tone}\nShipment update from staff:\n${data.update}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM,
        input: userMsg,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
      }),
    });
    if (!res.ok || !res.body) {
      const t = await res.text().catch(() => "");
      let msg = t;
      try { msg = JSON.parse(t)?.error?.message ?? JSON.parse(t)?.message ?? t; } catch {}
      if (res.status === 402) throw new Error("AI credits exhausted — top up in Settings → Plans & credits.");
      if (res.status === 429) throw new Error("AI is busy, please try again in a moment.");
      throw new Error(`AI error ${res.status}: ${String(msg).slice(0, 200)}`);
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const p = line.slice(5).trim();
        if (!p || p === "[DONE]") continue;
        try {
          const ev = JSON.parse(p);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          if (ev.type === "error" || ev.type === "response.failed") throw new Error(ev.error?.message ?? ev.response?.error?.message ?? "AI failed");
        } catch (e) { if (e instanceof Error && e.message !== "Unexpected end of JSON input" && !(e instanceof SyntaxError)) throw e; }
      }
    }
    text = text.trim();
    if (!text) throw new Error("The AI returned no message. Please adjust the update and try again.");
    return { text };
  });
