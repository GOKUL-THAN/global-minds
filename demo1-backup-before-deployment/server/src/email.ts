import { config } from './config.js';

export class EmailDeliveryConfigurationError extends Error {
  constructor() {
    super('Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.');
    this.name = 'EmailDeliveryConfigurationError';
  }
}

export async function sendAccountEmail(
  recipient: string,
  subject: string,
  text: string,
): Promise<void> {
  if (!config.emailConfigured || !config.resendApiKey || !config.emailFrom) {
    throw new EmailDeliveryConfigurationError();
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.emailFrom,
      to: [recipient],
      subject,
      text,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    const responseText = await response.text();
    console.error('[email] Provider rejected account email:', {
      status: response.status,
      response: responseText.slice(0, 500),
    });
    throw new Error('Email provider could not deliver the message.');
  }
}
