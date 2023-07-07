import resetPasswordTemplate from "./email-templates/reset-password"

export interface Env {
  EMAIL_API_KEY: string
  DKIM_DOMAIN: string
  DKIM_SELECTOR: string
  DKIM_PRIVATE_KEY: string
}

type RequestBody = {
  type: string
  recepientEmail: string
  url?: string
}

export default {
  async fetch(req: Request, env: Env) {
    if (req.headers.get("x-api-key") !== env.EMAIL_API_KEY) {
      return new Response(null, { status: 401 })
    }
    if (req.method !== "POST") {
      return new Response(null, { status: 405 })
    }

    const body: RequestBody = await req.json()
    if (!body) {
      return new Response(null, { status: 400 })
    }
    if (!body.recepientEmail || body.recepientEmail === "") {
      return new Response(
        JSON.stringify({ error: "recepient email is required" }),
        { status: 400 }
      )
    }

    let emailRequest
    switch (body.type) {
      case "reset-password":
        if (!body.url || body.url === "") {
          return new Response(JSON.stringify({ error: "url is required" }), {
            status: 400,
          })
        }
        emailRequest = buildEmailRequest(
          env,
          "Reset Your Password",
          body.recepientEmail,
          resetPasswordTemplate(body.url)
        )
        break
      default:
        return new Response("Unknown type", { status: 400 })
    }
    const emailResponse = await fetch(emailRequest)
    return new Response(await emailResponse.text(), {
      status: emailResponse.status,
    })
  },
}

const buildEmailRequest = (
  env: Env,
  subject: string,
  recepientEmail: string,
  template: string
) =>
  new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: recepientEmail, name: "Recipient" }],
          dkim_domain: env.DKIM_DOMAIN,
          dkim_selector: env.DKIM_SELECTOR,
          dkim_private_key: env.DKIM_PRIVATE_KEY,
        },
      ],
      from: {
        email: "admin@umwcribs.com",
        name: "UMW Cribs",
      },
      subject: subject,
      content: [
        {
          type: "text/html",
          value: template,
        },
      ],
    }),
  })
