/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("@/lib/auth.server").Authenticator
  type DatabaseUserAttributes = {
    providerId: string
    email: string
    firstName: string
    lastName: string
    emailVerifiedAt?: string
    createdAt?: string
    avatar?: string
  } // formerly `UserAttributes`
  type DatabaseSessionAttributes = {} // new
}
