"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-midnight">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#2de5b9",
          },
        }}
      />
    </div>
  );
}
