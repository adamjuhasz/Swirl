const NEWSLETTER_SCHEMA = {
  name: 'newsletter_classification',
  schema: {
    type: 'object',
    properties: {
      isNewsletter: { type: 'boolean', description: 'True if the message is a newsletter or subscription content.' },
      summary: { type: 'string', description: 'One-sentence summary tailored for a quick inbox preview.' },
      topics: {
        type: 'array',
        description: '1-3 topical tags that describe the newsletter.',
        items: { type: 'string' },
      },
      confidence: {
        type: 'number',
        description: 'Confidence score between 0 and 1 in the classification.',
        minimum: 0,
        maximum: 1,
      },
      reasoning: {
        type: 'string',
        description: 'Short rationale describing why the message is or is not a newsletter.',
      },
    },
    required: ['isNewsletter', 'summary', 'topics', 'confidence'],
    additionalProperties: false,
  },
};

export async function classifyWithOpenAI({ apiKey, subject, preview, body }) {
  if (!apiKey) {
    throw new Error('Missing OpenAI API key.');
  }

  const prompt = `Subject: ${subject}\nPreview: ${preview}\n\nBody:\n${body.slice(0, 5000)}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_schema', json_schema: NEWSLETTER_SCHEMA },
      messages: [
        {
          role: 'system',
          content:
            'You are Marble, a minimalist newsletter assistant. Determine whether the message is a newsletter and provide a succinct summary.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`OpenAI classification failed: ${response.status} ${errorPayload}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Invalid OpenAI response payload.');
  }

  return JSON.parse(content);
}
