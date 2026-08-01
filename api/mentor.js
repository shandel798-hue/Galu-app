module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido." }); return; }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { res.status(500).json({ error: "Falta configurar ANTHROPIC_API_KEY." }); return; }
  const { system, messages, max_tokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) { res.status(400).json({ error: 'Se requiere "messages".' }); return; }
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: Math.min(Number(max_tokens) || 1000, 2000), system, messages }),
    });
    const data = await upstream.json();
    if (!upstream.ok) { res.status(upstream.status).json({ error: data?.error?.message || "Error de Anthropic." }); return; }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error de red." });
  }
};
