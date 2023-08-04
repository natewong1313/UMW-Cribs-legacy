import { conform, useForm } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import {
  type ActionArgs,
  json,
  redirect,
  type LoaderArgs,
} from "@remix-run/cloudflare"
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { z } from "zod"
import { handleAuthError, stripPasswordFromSubmission } from "@/lib/utils"

export async function loader({ request, context }: LoaderArgs) {
  const session = await context.session.get(request.headers.get("Cookie"))
  return json(
    { message: session.get("message") },
    { headers: { "Set-Cookie": await context.session.commit(session) } }
  )
}

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
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
  const submission = parse(await request.formData(), { schema })
  const baseResponse = stripPasswordFromSubmission(submission)
  if (!submission.value || submission.intent !== "submit") {
    return json(baseResponse, { status: 400 })
  }
  try {
    const user = await context.auth.createUser({
      key: {
        providerId: "email",
        providerUserId: submission.value.email,
        password: submission.value.password,
      },
      attributes: {
        providerId: "email",
        email: submission.value.email,
        firstName: submission.value.firstName,
        lastName: submission.value.lastName,
      },
    })
    const authSession = await context.auth.createSession({
      userId: user.userId,
      attributes: {},
    })
    const sessionCookie = context.auth.createSessionCookie(authSession)
    return redirect("/", {
      headers: { "Set-Cookie": sessionCookie.serialize() },
    })
  } catch (e) {
    console.log(e)
    const { error, status } = handleAuthError(e)
    return json({ ...baseResponse, error }, { status })
  }
}

export default function SignupPage() {
  const navigation = useNavigation()
  const { message } = useLoaderData<typeof loader>()
  const lastSubmission = useActionData<typeof action>()
  const [form, { firstName, lastName, email, password }] = useForm<
    z.input<typeof schema>
  >({
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })
  return (
    <div>
      SignupPage
      <div className="text-red-500">
        {message && handleAuthError(message).errorMessage}
      </div>
      <Form method="post" className="flex flex-col p-2" {...form.props}>
        <label>
          First name
          <input
            type="text"
            className="ring-1 ring-gray-500"
            {...conform.input(firstName)}
          />
        </label>
        <label>
          Last name
          <input
            type="text"
            className="ring-1 ring-gray-500"
            {...conform.input(lastName)}
          />
        </label>
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
        <div className="text-red-500">{form.error}</div>
      </Form>
      <div className="flex flex-col">
        <Link
          to="/signin/oauth/google?referer=/signup"
          className="w-fit ring-1 ring-gray-500"
        >
          Continue with google
        </Link>
        <Link to="/signin">Sign in instead</Link>
      </div>
    </div>
  )
}
