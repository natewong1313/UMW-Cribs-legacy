import { Popover, Transition } from "@headlessui/react"
import { Link } from "@remix-run/react"
import { IconBookmark, IconSearch } from "@tabler/icons-react"
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
            <div className="flex items-center space-x-5 text-gray-500">
              <Link
                to="/user/saved"
                className="flex items-center font-medium transition-all hover:opacity-70"
              >
                <span className="mr-1.5 text-gray-600">
                  <IconBookmark size={20} />
                </span>
                Saved Homes
              </Link>
              {/* <Link
                to="/likes"
                className="flex items-center font-medium hover:opacity-70"
              >
                <span className="mr-1.5 text-gray-700">
                  <IconSearch size={20} />
                </span>
                Search
              </Link> */}
              <div className="h-5 w-px bg-zinc-900/20" />
              <Link
                to="/settings"
                className="flex items-center justify-center rounded-full bg-blue-100 p-2.5 transition-colors hover:bg-blue-200/80 "
              >
                <span className="font-semibold text-blue-500">
                  <p>{user.firstName[0] + user.lastName[0]}</p>
                </span>
              </Link>
            </div>
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
    </>
  )
}
