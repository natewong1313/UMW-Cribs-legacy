import { Link } from "@remix-run/react"
import HouseLogo from "@/assets/house_logo.png"
import Container from "./Container"
import { Button } from "./ui/Button"

export default function Footer() {
  return (
    <Container sectionClassName="bg-white " className="py-16">
      <div className="grid-cols-12 gap-8 space-y-8 lg:grid">
        <div className="col-span-3 mr-8 flex flex-col">
          <div className="flex items-center">
            <img
              src={HouseLogo}
              alt="UMW Cribs Logo"
              className="mr-3"
              width={56}
              height={56}
            />
            <h1 className="text-xl font-bold">UMW Cribs</h1>
          </div>
          <p className="mt-3">
            We're on a journey to make finding housing for students easier than
            ever before.
          </p>
          <Button variant="outline" className="mt-4 w-fit" asChild>
            <Link to="/signup">Contact us</Link>
          </Button>
        </div>
        <div className="col-span-2 flex flex-col">
          <h1 className="font-bold">Resources</h1>
          <ul className="mt-2 space-y-1.5">
            <LinkComponent title="Listings" href="/listings" />
            <LinkComponent title="Status" href="/listings" />
            <LinkComponent title="Listings" href="/listings" />
          </ul>
        </div>
        <div className="col-span-2 flex flex-col">
          <h1 className="font-bold">Legal</h1>
          <ul className="mt-2 space-y-1.5">
            <LinkComponent title="Privacy Policy" href="/listings" />
            <LinkComponent title="Terms of Service" href="/listings" />
            <LinkComponent title="Listings" href="/listings" />
          </ul>
        </div>
        <div className="col-span-5 flex flex-col">
          <h1 className="font-bold">Notice</h1>
          <p className="mt-2 text-sm text-gray-700">
            This web site is not endorsed by, directly affiliated with,
            maintained, authorized, or sponsored by the University of Mary
            Washington. All product and company names are the registered
            trademarks of their original owners. The use of any trade name or
            trademark is for identification and reference purposes only and does
            not imply any association with the trademark holder of their product
            brand.
          </p>
        </div>
      </div>
    </Container>
  )
}

type LinkComponentProps = {
  title: string
  href: string
}
const LinkComponent = ({ title, href }: LinkComponentProps) => {
  return (
    <li>
      <Link to={href} className="font-medium text-gray-600 hover:text-black">
        {title}
      </Link>
    </li>
  )
}
