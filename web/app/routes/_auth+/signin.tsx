import { conform, useForm } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from "@remix-run/cloudflare"
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { z } from "zod"
import { handleAuthError } from "@/lib/utils"

export async function loader({ request, context }: LoaderArgs) {
  const session = await context.session.get(request.headers.get("Cookie"))
  return json(
    { message: session.get("message") },
    { headers: { "Set-Cookie": await context.session.commit(session) } }
  )
}

const schema = z.object({
  email: z.string().min(1, "Email is required").email(),
  password: z.string().min(1, "Password is required"),
})
export async function action({ request, context }: ActionArgs) {
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
  try {
    const key = await context.auth.useKey(
      "email",
      submission.value.email,
      submission.value.password
    )
    const authSession = await context.auth.createSession(key.userId)
    const authRequest = context.auth.handleRequest(request, headers)
    authRequest.setSession(authSession)
    return redirect("/", { headers })
  } catch (e) {
    const { error, status } = handleAuthError(e)
    return json({ ...baseResponse, error }, { status })
  }
}

export default function SigninPage() {
  const navigation = useNavigation()
  const { message } = useLoaderData<typeof loader>()
  const lastSubmission = useActionData<typeof action>()
  const [form, { email, password }] = useForm<z.input<typeof schema>>({
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })
  return (
    <div>
      Signin to UMW-Cribs
      <div className="text-red-500">
        {message && handleAuthError(message).errorMessage}
      </div>
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
        <Link to="/password-reset">Forgot password</Link>
        <button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="w-fit bg-black text-white"
        >
          Sign in
        </button>
      </Form>
      <div className="flex flex-col">
        <Link
          to="/signin/oauth/google?referer=/signin"
          className="w-fit ring-1 ring-gray-500"
        >
          Continue with google
        </Link>
        <Link to="/signup">Sign up instead</Link>
      </div>
    </div>
  )
}
