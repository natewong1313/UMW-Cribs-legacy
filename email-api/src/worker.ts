import { Router } from "@tsndr/cloudflare-worker-router"
import resetPasswordTemplate from "./email-templates/reset-password"

export interface Env {
  EMAIL_API_KEY: string
}

const router = new Router<Env>()
router.cors()

router.use(({ env, req, res, next }) => {
  if (req.headers.get("x-api-key") !== env.EMAIL_API_KEY) {
    res.status = 401
    return
  }
  next()
})

router.post("/reset-password", async ({ req, res }) => {
  if (!req.body.url || req.body.url === "") {
    res.status = 400
    res.body = { error: "url is required" }
    return
  }
  const template = resetPasswordTemplate(req.body.url)
  const emailRequest = buildEmailRequest("Reset Your Password", template)
  const emailResponse = await fetch(emailRequest)
  res.status = emailResponse.status
  res.body = await emailResponse.text()
})

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return router.handle(env, request)
  },
}

const buildEmailRequest = (subject: string, template: string) =>
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
