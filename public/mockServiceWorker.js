/* eslint-disable */
/* tslint:disable */

/**
 * Mock Service Worker.
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 * - Please do NOT serve this file on production.
 */

const PACKAGE_VERSION = '2.1.2'
const INTEGRITY_CHECKSUM = 'e37b1a7c2e7e04b59f6f4c8e8b7e4f1a'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')
const activeClientIds = new Set()

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', async function (event) {
  const clientId = event.source.id
  if (!clientId || !self.clients) return
  const client = await self.clients.get(clientId)
  if (!client) return
  const allClients = await self.clients.matchAll({ type: 'window' })

  switch (event.data) {
    case 'KEEPALIVE_REQUEST': {
      // Respond on the MessageChannel port the client provided
      if (event.ports[0]) {
        event.ports[0].postMessage({ type: 'KEEPALIVE_RESPONSE' })
      }
      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      if (event.ports[0]) {
        event.ports[0].postMessage({
          type: 'INTEGRITY_CHECK_RESPONSE',
          payload: {
            packageVersion: PACKAGE_VERSION,
            checksum: INTEGRITY_CHECKSUM,
          },
        })
      }
      break
    }

    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)
      if (event.ports[0]) {
        event.ports[0].postMessage({
          type: 'MOCK_ACTIVATE',
          payload: { started: true },
        })
      }
      break
    }

    case 'MOCK_DEACTIVATE': {
      activeClientIds.delete(clientId)
      break
    }

    case 'CLIENT_CLOSED': {
      activeClientIds.delete(clientId)
      const remainingClients = allClients.filter((c) => c.id !== clientId)
      if (remainingClients.length === 0) {
        self.registration.unregister()
      }
      break
    }
  }
})

self.addEventListener('fetch', function (event) {
  const { request } = event
  if (request.mode === 'navigate') return
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return
  if (activeClientIds.size === 0) return
  const requestId = crypto.randomUUID()
  event.respondWith(handleRequest(event, requestId))
})

async function handleRequest(event, requestId) {
  const client = await resolveMainClient(event)
  const response = await getResponse(event, client, requestId)

  if (client && activeClientIds.has(client.id)) {
    const responseClone = response.clone()
    const responseBody = await responseClone.arrayBuffer()
    sendToClient(
      client,
      {
        type: 'RESPONSE',
        payload: {
          requestId,
          isMockedResponse: IS_MOCKED_RESPONSE in response,
          type: response.type,
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
          headers: Object.fromEntries(response.headers.entries()),
        },
      },
      [responseBody],
    )
  }

  return response
}

async function resolveMainClient(event) {
  const client = await self.clients.get(event.clientId)
  if (client?.frameType === 'top-level') return client
  const allClients = await self.clients.matchAll({ type: 'window' })
  return allClients
    .filter((c) => c.visibilityState === 'visible')
    .find((c) => activeClientIds.has(c.id))
}

async function getResponse(event, client, requestId) {
  const { request } = event
  const requestClone = request.clone()

  function passthrough() {
    return fetch(requestClone)
  }

  if (!client) return passthrough()
  if (!activeClientIds.has(client.id)) return passthrough()

  const requestBuffer = await request.arrayBuffer()
  const clientMessage = await sendToClient(
    client,
    {
      type: 'REQUEST',
      payload: {
        id: requestId,
        url: request.url,
        mode: request.mode,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        cache: request.cache,
        credentials: request.credentials,
        destination: request.destination,
        integrity: request.integrity,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        body: requestBuffer,
        keepalive: request.keepalive,
      },
    },
    [requestBuffer],
  )

  switch (clientMessage.type) {
    case 'MOCK_INACCESSIBLE':
      return passthrough()

    case 'MOCK_SUCCESS': {
      return new Response(clientMessage.payload.body, {
        status: clientMessage.payload.status,
        statusText: clientMessage.payload.statusText,
        headers: clientMessage.payload.headers,
      })
    }

    case 'MOCK_NOT_FOUND':
      return passthrough()

    case 'NETWORK_ERROR': {
      const { name, message } = clientMessage.payload
      const networkError = new Error(message)
      networkError.name = name
      throw networkError
    }

    case 'INTERNAL_ERROR':
    default:
      return passthrough()
  }
}

function sendToClient(client, message, transferrables = []) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) return reject(event.data.error)
      resolve(event.data)
    }
    client.postMessage(message, [channel.port2].concat(transferrables.filter(Boolean)))
  })
}
