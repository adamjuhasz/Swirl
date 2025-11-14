const GOOGLE_API_ROOT = 'https://gmail.googleapis.com/gmail/v1/users/me';

function decodeBase64Url(data) {
  if (!data) {
    return '';
  }
  const sanitized = data.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (sanitized.length % 4)) % 4;
  const padded = sanitized + '='.repeat(padLength);
  const base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  let buffer = 0;
  let bitsCollected = 0;

  for (let i = 0; i < padded.length; i += 1) {
    const char = padded[i];
    const value = base64Characters.indexOf(char);
    if (value < 0) {
      continue;
    }
    buffer = (buffer << 6) | value;
    bitsCollected += 6;
    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      const byte = (buffer >> bitsCollected) & 0xff;
      result += String.fromCharCode(byte);
      buffer &= (1 << bitsCollected) - 1;
    }
  }

  try {
    return decodeURIComponent(escape(result));
  } catch (error) {
    return result;
  }
}

function getHeaderValue(message, name) {
  const header = message.payload?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase());
  return header?.value ?? '';
}

function extractAddresses(raw) {
  if (!raw) {
    return { name: '', email: '' };
  }
  const emailMatch = raw.match(/<([^>]+)>/);
  const email = emailMatch ? emailMatch[1] : raw;
  const name = emailMatch ? raw.replace(emailMatch[0], '').replace(/"/g, '').trim() : raw.split('@')[0];
  return { name: name || email, email };
}

function traverseParts(part, accumulator) {
  if (!part) {
    return;
  }
  const mime = part.mimeType || '';
  if (mime === 'text/html') {
    accumulator.html.push(decodeBase64Url(part.body?.data || ''));
  } else if (mime === 'text/plain') {
    accumulator.text.push(decodeBase64Url(part.body?.data || ''));
  }
  if (Array.isArray(part.parts)) {
    part.parts.forEach((child) => traverseParts(child, accumulator));
  }
}

export function parseMessage(message) {
  const subject = getHeaderValue(message, 'Subject');
  const dateHeader = getHeaderValue(message, 'Date');
  const fromRaw = getHeaderValue(message, 'From');
  const { name: fromName, email: fromEmail } = extractAddresses(fromRaw);
  const snippet = message.snippet ?? '';

  const accumulator = { html: [], text: [] };
  traverseParts(message.payload, accumulator);

  const bodyHtml = accumulator.html.join('\n');
  const bodyText = accumulator.text.length > 0 ? accumulator.text.join('\n') : decodeBase64Url(message.payload?.body?.data || '');

  return {
    id: message.id,
    threadId: message.threadId,
    historyId: message.historyId,
    internalDate: message.internalDate,
    subject,
    dateHeader,
    fromName,
    fromEmail,
    snippet,
    bodyHtml,
    bodyText,
    labelIds: message.labelIds || [],
  };
}

export async function listInboxMessages(accessToken, maxResults = 50) {
  const response = await fetch(`${GOOGLE_API_ROOT}/messages?labelIds=INBOX&maxResults=${maxResults}&q=category:primary`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load messages: ${response.status}`);
  }

  const data = await response.json();
  return data.messages?.map((item) => item.id) ?? [];
}

export async function fetchMessage(accessToken, messageId) {
  const response = await fetch(`${GOOGLE_API_ROOT}/messages/${messageId}?format=full`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load message ${messageId}: ${response.status}`);
  }

  return response.json();
}

export async function archiveMessage(accessToken, messageId) {
  const response = await fetch(`${GOOGLE_API_ROOT}/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      removeLabelIds: ['INBOX'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to archive message ${messageId}: ${response.status}`);
  }

  return response.json();
}
