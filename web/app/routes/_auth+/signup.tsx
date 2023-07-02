import { conform, useForm } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import { type ActionArgs, json } from "@remix-run/cloudflare"
import { Form, Link, useActionData, useNavigation } from "@remix-run/react"
import { z } from "zod"

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
export async function action({ request, context }: ActionArgs) {
  const formData = await request.formData()
  const submission = parse(formData, { schema })
  if (!submission.value || submission.intent !== "submit") {
    return json(
      { ...submission, payload: { email: submission.payload.email } },
      { status: 400 }
    )
  }

  const session = await context.session.get(request.headers.get("Cookie"))
  // session.flash("success", true)
  return json(submission, {
    headers: { "Set-Cookie": await context.session.commit(session) },
  })
}

export default function SignupPage() {
  const navigation = useNavigation()
  const lastSubmission = useActionData<typeof action>()
  const [form, { email, password }] = useForm<z.input<typeof schema>>({
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })
  return (
    <div>
      SignupPage
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
          Sign up
        </button>
      </Form>
      <Link to="/signin/oauth/google" className="ring-1 ring-gray-500">
        Continue with google
      </Link>
    </div>
  )
}
