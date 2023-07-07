import { TypesafeEnv } from "@/app"

const API_URL = "https://email-api.natewong.workers.dev/"
export const sendPasswordResetLinkEmail = async (
  recepientEmail: string,
  resetToken: string,
  env: TypesafeEnv
) => {
  const resetLink = `${env.BASE_URL}/reset-password?token=${resetToken}`
  console.log(env.EMAIL_API_SERVICE)
  let fetcher = env.EMAIL_API_SERVICE.fetch
  // if (env.IS_DEV) {
  //   fetcher = fetch
  // }

  const resp = await env.EMAIL_API_SERVICE.fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": env.EMAIL_API_KEY,
    },
    body: JSON.stringify({
      type: "reset-password",
      recepientEmail,
      url: resetLink,
    }),
  })
  console.log(resp.status, await resp.text())
}
