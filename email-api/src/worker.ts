import { Router } from "@tsndr/cloudflare-worker-router"
import resetPasswordTemplate from "./email-templates/reset-password"

export interface Env {
  EMAIL_API_KEY: string
}

// const router = new Router<Env>()
// router.cors()

// router.use(({ env, req, res, next }) => {
//   if (req.headers.get("x-api-key") !== env.EMAIL_API_KEY) {
//     res.status = 401
//     return
//   }
//   next()
// })

// router.post("/reset-password", async ({ req, res }) => {
//   if (!req.body.url || req.body.url === "") {
//     res.status = 400
//     res.body = { error: "url is required" }
//     return
//   }
//   const template = resetPasswordTemplate(req.body.url)
//   const emailRequest = buildEmailRequest("Reset Your Password", template)
//   const emailResponse = await fetch(emailRequest)
//   console.log(emailResponse)
//   res.status = emailResponse.status
//   res.body = await emailResponse.text()
// })

// export default {
//   async fetch(request: Request, env: Env): Promise<Response> {
//     return router.handle(env, request)
//   },
// }

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
        { to: [{ email: recepientEmail, name: "Recipient" }] },
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
