import { Link } from "@remix-run/react"
import type { GlobalDatabaseUserAttributes } from "lucia"
import HouseLogo from "@/assets/house_logo.png"
import Container from "./Container"
import { Button } from "./ui/Button"

type Props = {
  user: GlobalDatabaseUserAttributes | null
}

export default function Navbar({ user }: Props) {
  return (
    <>
      <div className=" z-50 w-full bg-white/80 backdrop-blur">
        <Container className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-90">
            <img
              src={HouseLogo}
              alt="UMW Cribs Logo"
              className="mr-3"
              width={48}
              height={48}
            />
            <h1 className="text-xl font-bold">UMW Cribs</h1>
          </Link>
          {user ? (
            <div className="flex items-center justify-center rounded-full bg-blue-100 p-2.5">
              <span className="font-semibold text-blue-500">
                <p>{user.firstName[0] + user.lastName[0]}</p>
              </span>
            </div> // TODO: Add user profile picture
          ) : (
            <div className="flex items-center">
              <Button
                variant="invisible"
                className="mr-2"
                asChild
                type="button"
              >
                <Link to="/signin">Sign in</Link>
              </Button>
              <Button variant="secondary" asChild type="button">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </Container>
      </div>
      {/* <div className="h-20"></div> */}
    </>
  )
}
