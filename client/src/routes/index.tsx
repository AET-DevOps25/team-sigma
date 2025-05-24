import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCounterStore } from "../stores";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: hello, isLoading } = useQuery({
    queryKey: ["hello"],
    queryFn: async () => {
      const response = await fetch("/api/hello");
      return response.text();
    },
  });

  const { count, increase, decrease, reset } = useCounterStore();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">
        React Counter App with Clerk Auth
      </h1>

      {/* Authentication Status */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Authentication Status
        </h2>
        <SignedOut>
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  You are signed out
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please sign in to access personalized features.</p>
                </div>
              </div>
            </div>
          </div>
        </SignedOut>
        <SignedIn>
          <UserInfo />
        </SignedIn>
      </div>

      {/* Display the message from API */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Message from Server:
        </h2>
        <p className="text-lg text-gray-600">
          {isLoading ? "Loading..." : hello}
        </p>
      </div>

      {/* Counter section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Counter: {count}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={decrease}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Decrease
          </button>
          <button
            onClick={increase}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Increase
          </button>
          <button
            onClick={reset}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function UserInfo() {
  const { user } = useUser();

  return (
    <div className="rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Welcome back,{" "}
            {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>You are successfully authenticated with Clerk.</p>
            {user?.emailAddresses[0]?.emailAddress && (
              <p className="mt-1">
                Email: {user.emailAddresses[0].emailAddress}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
