import { conform, useForm } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import { type ActionArgs, json, type LoaderArgs } from "@remix-run/cloudflare"
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react"
import { useEffect } from "react"
import { z } from "zod"

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
  if (!submission.value || submission.intent !== "submit") {
    return json(
      { ...submission, payload: { email: submission.payload.email } },
      { status: 400 }
    )
  }
  const session = await context.session.get(request.headers.get("Cookie"))
  session.flash("message", "Signed in successfully")
  return json(submission, {
    headers: { "Set-Cookie": await context.session.commit(session) },
  })
}

export default function SigninPage() {
  const navigation = useNavigation()
  const navigate = useNavigate()
  const { message } = useLoaderData<typeof loader>()
  const lastSubmission = useActionData<typeof action>()
  const [form, { email, password }] = useForm<z.input<typeof schema>>({
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })
  const signinSuccess = message === "Signed in successfully"
  useEffect(() => {
    if (signinSuccess) {
      navigate("/")
    }
  }, [signinSuccess, navigate])
  return (
    <div>
      Signin to UMW-Cribs
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
          disabled={navigation.state === "submitting"}
          className="w-fit bg-black text-white"
        >
          {signinSuccess ? "Successfully signed in" : "Sign in"}
        </button>
      </Form>
    </div>
  )
}
