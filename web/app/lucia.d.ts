/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("@/lib/auth.server").Authenticator
  type DatabaseUserAttributes = {
    email: string
    firstName: string
    lastName: string
    emailVerifiedAt?: string
    createdAt?: string
    avatar?: string
  } // formerly `UserAttributes`
  type DatabaseSessionAttributes = {} // new
}
