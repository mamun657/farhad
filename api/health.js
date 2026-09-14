export default function handler(_request, response) {
  response.json({
    ok: true,
    service: 'farhad-global-trade-api',
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
  })
}