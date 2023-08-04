import { json } from "@remix-run/cloudflare"
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/cloudflare"
import { Link, useLoaderData } from "@remix-run/react"
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBellCheck,
  IconCornerRightDown,
  IconFilter,
  IconLayoutGrid,
} from "@tabler/icons-react"
import HouseIllustration from "@/assets/house_illustration.svg"
import Container from "@/components/Container"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/Button"

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ]
}

export const loader = async ({ request, context }: LoaderArgs) => {
  const authRequest = context.auth.handleRequest(request)
  const session = await authRequest.validate()
  return json({ isDev: context.is_dev, user: session?.user ?? null })
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <div>
      <Navbar user={user} />
      <HeroSection />
      {/* <Container>
        <h1 className="text-center text-2xl font-bold">
          Browse the latest listings
        </h1>
      </Container> */}
      <AboutSection />
      <GetStartedSection />
      <Footer />
    </div>
  )
}

const HeroSection = () => {
  return (
    <Container className="grid grid-cols-2 pb-36 pt-20">
      <div className="pt-8">
        <h1 className="text-6xl font-extrabold leading-tight">
          Find the{" "}
          <span
            className="bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent"
            style={{ WebkitBackgroundClip: "text" }}
          >
            perfect
          </span>{" "}
          place to live at UMW
        </h1>
        <p className="mt-3 text-xl text-gray-500">
          Our mission is to help you get connected with the home of your dreams
          for the upcoming school year
        </p>
        <Button variant="primary" className="mr-4 mt-6" asChild>
          <Link to="/listings">
            Start browsing{" "}
            <span className="ml-1.5 text-sky-200">
              <IconArrowUpRight size={18} />
            </span>
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="#about">
            Learn more
            <span className="ml-1.5 text-gray-500">
              <IconCornerRightDown size={18} />
            </span>
          </a>
        </Button>
      </div>
      <div className="flex justify-center">
        <img
          src={HouseIllustration}
          alt="House Illustration"
          width={420}
          height={343}
          draggable={false}
        />
      </div>
    </Container>
  )
}

const AboutSection = () => {
  return (
    <Container id="about" className="py-20">
      <h1 className="text-center text-2xl font-bold">Why use UMW Cribs?</h1>
      <div className="mt-12 grid grid-cols-3 gap-6">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <span className="text-blue-500">
              <IconLayoutGrid size={32} />
            </span>
          </div>
          <h2 className="mt-4 text-xl font-bold">All listings in one place</h2>
          <p className="mt-2 text-center text-gray-500">
            We aggregate listings from 10+ sites and put them all in one place
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <span className="text-blue-500">
              <IconBellCheck size={32} />
            </span>
          </div>
          <h2 className="mt-4 text-xl font-bold">Stay in the loop</h2>
          <p className="mt-2 text-center text-gray-500">
            Get instantly notified about new listings and updates
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <span className="text-blue-500">
              <IconFilter size={32} />
            </span>
          </div>
          <h2 className="mt-4 text-xl font-bold">Advanced Filters</h2>
          <p className="mt-2 text-center text-gray-500">
            Filter listings by price, distance from school, and more
          </p>
        </div>
      </div>
    </Container>
  )
}

const GetStartedSection = () => {
  return (
    <Container
      sectionClassName="border-t border-b border-gray-200 bg-gray-50"
      className="py-16"
    >
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold">Get started with UMW Cribs</h1>
        <p className="mt-2 max-w-xl text-center text-gray-700">
          You're one step closer to finding the crib of your dreams. Use the
          buttons below to browse listings or create an account.
        </p>
        <div className="mt-5 flex">
          <Button variant="primary" className="mr-4" asChild>
            <Link to="/listings">
              Start browsing{" "}
              <span className="ml-1.5 text-sky-200">
                <IconArrowUpRight size={18} />
              </span>
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/signup">
              Sign up{" "}
              <span className="ml-1.5 text-gray-500">
                <IconArrowRight size={18} />
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  )
}
