export interface Env {
  EMAIL_API_KEY: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.headers.get("x-api-key") !== env.EMAIL_API_KEY) {
      return new Response(null, {
        headers: { "content-type": "application/json" },
        status: 401,
      })
    }
    const emailRequest = buildEmailRequest()
    const emailResponse = await fetch(emailRequest)
    return new Response(
      JSON.stringify({
        success: emailResponse.status === 200,
        response: await emailResponse.text(),
      }),
      {
        headers: { "content-type": "application/json" },
      }
    )
  },
}

const buildEmailRequest = () =>
  new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        { to: [{ email: "natewong1@gmail.com", name: "Test Recipient" }] },
      ],
      from: {
        email: "test@umwcribs.com",
        name: "Test Sender",
      },
      subject: "Test Subject",
      content: [
        {
          type: "text/plain",
          value: "Test message content\n",
        },
      ],
    }),
  })
