import { Submission } from "@conform-to/react"
import { clsx, type ClassValue } from "clsx"
import { LuciaError } from "lucia-auth"
import { twMerge } from "tailwind-merge"

type AuthErrorReturn = {
  error: Record<string, string>
  errorMessage: string
  status: number
}
export function handleAuthError(e: unknown): AuthErrorReturn {
  let errorMessage = ""

  if (e instanceof LuciaError || e instanceof Error) {
    errorMessage = e.message
  } else {
    errorMessage = typeof e === "string" ? e : "Unknown error occured"
  }
  switch (errorMessage) {
    case "AUTH_DUPLICATE_KEY_ID":
    case "AUTH_INVALID_USER_ID":
      return {
        error: { email: "Account with email already exists" },
        errorMessage: "Account with email already exists",
        status: 400,
      }
    case "AUTH_INVALID_PASSWORD":
      return {
        error: { password: "Invalid password" },
        errorMessage: "Invalid password",
        status: 400,
      }
    case "AUTH_INVALID_KEY_ID":
      return {
        error: { email: "User does not exist" },
        errorMessage: "User does not exist",
        status: 400,
      }
    case "EXPIRED_TOKEN":
      return {
        error: { "": "Token has expired" },
        errorMessage: "Token has expired",
        status: 401,
      }
    case "INVALID_TOKEN":
      return {
        error: { "": "Invalid token" },
        errorMessage: "Invalid token",
        status: 401,
      }
    default:
      return {
        error: { "": errorMessage },
        errorMessage: errorMessage,
        status: 500,
      }
  }
}

export function stripPasswordFromSubmission(submission: Submission) {
  return {
    ...submission,
    payload: { email: submission.payload.email },
    value: { email: submission.payload.email },
  }
}

export function cnMerge(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
