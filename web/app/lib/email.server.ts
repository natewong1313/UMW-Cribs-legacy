const API_URL = "https://email-api.natewong.workers.dev/"
export const sendPasswordResetLinkEmail = async (
  recepientEmail: string,
  resetLink: string,
  apiKey: string
) =>
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      type: "reset-password",
      recepientEmail,
      url: resetLink,
    }),
  })
