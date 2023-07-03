import { conform, useForm } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import { json, type ActionArgs, redirect } from "@remix-run/cloudflare"
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { z } from "zod"
import { handleAuthError } from "@/lib/utils"

const schema = z.object({
  email: z.string().min(1, "Email is required").email(),
  password: z
    .string()
    .min(1, "Password is required")
    .max(64, "Password must be less than 64 characters")
    .regex(
      new RegExp(".*[A-Z].*"),
      "Password must contain one uppercase character"
    )
    .regex(
      new RegExp(".*[a-z].*"),
      "Password must contain one lowercase character"
    )
    .regex(new RegExp(".*\\d.*"), "Password must contain one number")
    .regex(
      new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
      "Password must contain one special character"
    )
    .min(8, "The password should be at least 8 characters long"),
})

export async function action({ request, params, context }: ActionArgs) {
  const formData = await request.formData()
  const submission = parse(formData, { schema })
  const baseResponse = {
    ...submission,
    payload: { email: submission.payload.email },
    value: { email: submission.payload.email },
  }
  if (!submission.value || submission.intent !== "submit") {
    return json(
      { ...submission, payload: { email: submission.payload.email } },
      { status: 400 }
    )
  }
  const headers = new Headers()
  const authRequest = context.auth.handleRequest(request, headers)

  try {
    const token = await context.passwordResetToken.validate(params.token ?? "")
    const user = await context.auth.getUser(token.userId)
    await context.auth.invalidateAllUserSessions(user.userId)
    await context.auth.updateKeyPassword(
      "email",
      user.email,
      submission.value.password
    )
    const session = await context.auth.createSession(user.userId)
    authRequest.setSession(session)
    return redirect("/", { headers })
  } catch (e) {
    const { error, status } = handleAuthError(e)
    return json({ ...baseResponse, error }, { status, headers })
  }
}

export default function ChangePasswordPage() {
  const navigation = useNavigation()
  const lastSubmission = useActionData<typeof action>()
  const [form, { email, password }] = useForm<z.input<typeof schema>>({
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })
  return (
    <div>
      Change your password
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
        <label>
          Password
          <input
            type="password"
            className="ring-1 ring-gray-500"
            {...conform.input(password)}
          />
          {password.error && <div>{password.error}</div>}
        </label>
        <button
          type="submit"
          className="w-fit bg-black text-white"
          disabled={navigation.state === "submitting"}
        >
          Change password
        </button>
        <div className="text-red-500">{form.error}</div>
      </Form>
    </div>
  )
}
