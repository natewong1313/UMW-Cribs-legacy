import { conform, useForm } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import { ActionArgs, LoaderArgs, json } from "@remix-run/cloudflare"
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { user as userSchema } from "@/lib/db-schema.server"
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
  const user = context.auth.transformDatabaseUser(foundUsers[0])
  const resetToken = await context.passwordResetToken.issue(user.userId)
  await sendPasswordResetLinkEmail(
    user.email,
    resetToken.toString(),
    context.env
  )
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
