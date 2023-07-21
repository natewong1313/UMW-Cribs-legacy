import { TypesafeEnv } from "@/app"

const API_URL = "https://email-api.natewong.workers.dev/"
export const sendPasswordResetLinkEmail = async (
  recepientEmail: string,
  resetToken: string,
  env: TypesafeEnv
) => {
  const resetLink = `${env.BASE_URL}/reset-password/${resetToken}`
  const options = {
    method: "POST",
    headers: {
      "x-api-key": env.EMAIL_API_KEY,
    },
    body: JSON.stringify({
      type: "reset-password",
      recepientEmail,
      url: resetLink,
    }),
  }
  if (env.IS_DEV) {
    return await fetch(API_URL, options)
  }
  return await env.EMAIL_API_SERVICE.fetch(API_URL, options)
}
