import { createFileRoute } from "@tanstack/react-router";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/clerk-react";

export const Route = createFileRoute("/protected")({
  component: ProtectedPage,
});

function ProtectedPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Protected Page</h1>
            <p className="mt-2 text-lg text-gray-600">
              This page is only accessible to authenticated users.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Your Profile Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">User ID:</span>
                <span className="ml-2 text-gray-600">{user?.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-600">
                  {user?.emailAddresses[0]?.emailAddress}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">First Name:</span>
                <span className="ml-2 text-gray-600">
                  {user?.firstName || "Not provided"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Name:</span>
                <span className="ml-2 text-gray-600">
                  {user?.lastName || "Not provided"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="ml-2 text-gray-600">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-blue-800">
              🎉 Authentication Success!
            </h3>
            <p className="text-blue-700">
              You are successfully authenticated and can access this protected
              content. Try signing out and navigating back to this page to see
              the redirect in action.
            </p>
          </div>
        </div>
      </SignedIn>
    </>
  );
}
