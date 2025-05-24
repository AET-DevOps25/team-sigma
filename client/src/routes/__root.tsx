import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

export const Route = createRootRoute({
  component: () => (
    <>
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <nav className="flex gap-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 [&.active]:font-bold [&.active]:text-blue-600"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-gray-900 [&.active]:font-bold [&.active]:text-blue-600"
              >
                About
              </Link>
              <Link
                to="/protected"
                className="text-gray-600 hover:text-gray-900 [&.active]:font-bold [&.active]:text-blue-600"
              >
                Protected
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <SignedOut>
                <div className="flex gap-2">
                  <SignInButton>
                    <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  ),
});
