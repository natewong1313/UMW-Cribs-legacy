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
import HouseIcon from "@/assets/house_logo.png"
import { GoogleIcon } from "@/components/Icons"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { handleAuthError, stripPasswordFromSubmission } from "@/lib/utils"

// this is for returning a message from oauth
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
  const submission = parse(await request.formData(), { schema })
  const baseResponse = stripPasswordFromSubmission(submission)
  if (!submission.value || submission.intent !== "submit") {
    return json(baseResponse, { status: 400 })
  }

  try {
    const user = await context.auth.useKey(
      "email",
      submission.value.email,
      submission.value.password
    )
    const authSession = await context.auth.createSession({
      userId: user.userId,
      attributes: {},
    })
    const sessionCookie = context.auth.createSessionCookie(authSession)
    return redirect("/", {
      headers: { "Set-Cookie": sessionCookie.serialize() },
    })
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
  console.log(form.error)
  return (
    // <div>
    //   Signin to UMW-Cribs
    //   <div className="text-red-500">
    //     {message && handleAuthError(message).errorMessage}
    //   </div>
    //   <Form method="post" className="flex flex-col p-2" {...form.props}>
    //     <label>
    //       Email
    //       <input
    //         type="text"
    //         className="ring-1 ring-gray-500"
    //         {...conform.input(email)}
    //       />
    //       {email.error && <div>{email.error}</div>}
    //     </label>
    //     <label>
    //       Password
    //       <input
    //         type="password"
    //         className="ring-1 ring-gray-500"
    //         {...conform.input(password)}
    //       />
    //       {password.error && <div>{password.error}</div>}
    //     </label>
    //     <Link to="/reset-password">Forgot password?</Link>
    //     <button
    //       type="submit"
    //       disabled={navigation.state === "submitting"}
    //       className="w-fit bg-black text-white"
    //     >
    //       Sign in
    //     </button>
    //     <div className="text-red-500">{form.error}</div>
    //   </Form>
    //   <div className="flex flex-col">
    //     <Link
    //       to="/signin/oauth/google?referer=/signin"
    //       className="w-fit ring-1 ring-gray-500"
    //     >
    //       Continue with google
    //     </Link>
    //     <Link to="/signup">Sign up instead</Link>
    //   </div>
    // </div>
    <div className="flex flex-col">
      <Link
        to="/"
        className="group flex items-center space-x-2 text-blue-950 transition-all"
      >
        <img
          src={HouseIcon}
          width={48}
          height={48}
          alt="UMW Cribs Logo"
          className="group-hover:opacity-90"
        />
        <h1 className="text-xl font-bold group-hover:opacity-90">UMW Cribs</h1>
      </Link>
      <div className="mt-4 w-[26rem] rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-lg font-semibold">Sign in to your account</h1>
        <Form method="post" className="mt-3" {...form.props}>
          <label className="block">
            <span className="text-sm font-medium">Email Address</span>
            <Input
              placeholder="Enter your email address"
              className="mt-1"
              {...conform.input(email)}
            />
          </label>
          {email.error && (
            <p className="mt-1 text-sm text-red-500">{email.error}</p>
          )}
          <label className="mt-1.5 block">
            <span className="text-sm font-medium">Password</span>
            <Input
              type="password"
              placeholder="Enter your password"
              className="mt-1"
              {...conform.input(password)}
            />
          </label>
          {password.error && (
            <p className="mt-1 text-sm text-red-500">{password.error}</p>
          )}
          <div className="mt-1">
            <Link
              to="/reset-password"
              className="text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            className="mt-2 w-full"
            type="submit"
            disabled={navigation.state === "submitting"}
          >
            Sign In
          </Button>
          <div className="text-red-500">{form.error}</div>
        </Form>
        <div className="relative mt-3">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm font-medium tracking-wide text-gray-500">
              OR
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-col space-y-2">
          <Button className="w-full" variant="outline" asChild>
            <Link to="/signin/oauth/google?referer=/signin">
              <GoogleIcon className="mr-2" />
              Sign in with Google
            </Link>
          </Button>
          {message && (
            <p className="text-sm text-red-500">
              {handleAuthError(message).errorMessage}
            </p>
          )}
        </div>
        <p className="mt-4 text-center text-sm font-medium text-gray-500">
          By signing in, you agree to our
          <br />{" "}
          <Link to="/tos" className="text-blue-500 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>{" "}
      <p className="mt-6 text-center text-sm font-medium text-gray-500">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-500 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
