import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <>
      <SignedOut>
        <RedirectToLogin />
      </SignedOut>
      <SignedIn>
        <Outlet />
      </SignedIn>
    </>
  );
}

function RedirectToLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/login" });
  }, [navigate]);

  return null;
}
