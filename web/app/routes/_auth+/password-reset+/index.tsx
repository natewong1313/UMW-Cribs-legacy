import { conform, useForm } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import { ActionArgs, json } from "@remix-run/cloudflare"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { user as userSchema } from "@/lib/db-schema.server"

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
  console.log(resetToken)
  return json(submission)
}

export default function PasswordResetPage() {
  const navigation = useNavigation()
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
        <div className="text-red-500">{form.error}</div>
      </Form>
    </div>
  )
}
