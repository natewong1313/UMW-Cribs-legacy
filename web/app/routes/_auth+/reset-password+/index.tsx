import { conform, useForm } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import { ActionArgs, LoaderArgs, json } from "@remix-run/cloudflare"
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import {
  passwordResetTokens,
  user as userSchema,
} from "@umw-cribs/db/schema.server"
import { eq } from "drizzle-orm"
import { generateRandomString } from "lucia/utils"
import { z } from "zod"
import { sendPasswordResetLinkEmail } from "@/lib/email.server"

export async function loader({ request, context }: LoaderArgs) {
  const session = await context.session.get(request.headers.get("Cookie"))
  return json(
    { message: session.get("message") },
    { headers: { "Set-Cookie": await context.session.commit(session) } }
  )
}

const schema = z.object({
  email: z.string().min(1, "Email is required").email(),
})
export async function action({ request, context }: ActionArgs) {
  const submission = parse(await request.formData(), { schema })
  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 })
  }
  const foundUsers = await context.db
    .select()
    .from(userSchema)
    .where(eq(userSchema.email, submission.value.email))
  if (foundUsers.length === 0) {
    return json(
      { ...submission, error: { email: "User with email does not exist" } },
      { status: 400 }
    )
  }
  const user = foundUsers[0]
  if (user.providerId !== "email") {
    return json(
      {
        ...submission,
        error: { "": `Cannot reset a ${user.providerId} account` },
      },
      { status: 400 }
    )
  }
  const resetToken = generateRandomString(63)
  await context.db.insert(passwordResetTokens).values({
    id: resetToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  })
  await sendPasswordResetLinkEmail(user.email, resetToken, context.env)
  const session = await context.session.get(request.headers.get("Cookie"))
  session.flash(
    "message",
    "Please check your email for the link to reset your password"
  )
  return json(submission, {
    headers: {
      "Set-Cookie": await context.session.commit(session),
    },
  })
}

export default function PasswordResetPage() {
  const navigation = useNavigation()
  const { message } = useLoaderData<typeof loader>()
  const lastSubmission = useActionData<typeof action>()
  const [form, { email }] = useForm<z.input<typeof schema>>({
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })
  return (
    <div>
      Reset your password
      <Form method="post" className="flex flex-col p-2" {...form.props}>
        <label>
          Email
          <input
            type="text"
            className="ring-1 ring-gray-500"
            {...conform.input(email)}
          />
          {email.error && <div>{email.error}</div>}
        </label>
        <button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="w-fit bg-black text-white"
        >
          Reset Password
        </button>
        <div className="text-green-500">{message}</div>
        <div className="text-red-500">{form.error}</div>
      </Form>
    </div>
  )
}
