addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  // Forward the POST body to the webhook
  const webhook = WEBHOOK_URL || '__WEBHOOK_URL__'
  if (!webhook) return new Response('Webhook not configured', { status: 500 })

  const init = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await request.text()
  }

  try {
    const resp = await fetch(webhook, init)
    const text = await resp.text()
    return new Response(text, { status: resp.status })
  } catch (err) {
    return new Response('Error proxying request: ' + err.message, { status: 502 })
  }
}
