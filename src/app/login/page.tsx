"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useRef, useState } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const errorParams = searchParams.has("error");
  const callbackParams =
    searchParams.get("callbackUrl") ?? undefined;
  const email = useRef("");
  const password = useRef("");

  const [error, setError] = useState(errorParams);

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email: email.current,
      password: password.current,
      redirect: true,
      callbackUrl: callbackParams,
    });
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-slate-50 to-slate-200 p-2 text-center text-slate-600 mb-2">
        Login Form
      </div>
      {error && (
        <p className="bg-red-100 text-red-600 text-center p-2 mb-2">
          Authntication Failed
        </p>
      )}
      <form onSubmit={onSubmit}>
        <div className="flex flex-col items-center justify-center">
          <Input
            name="email"
            onChange={(e) =>
              (email.current = e.target.value)
            }
            className="w-56 mb-2"
            placeholder="email"
            autoComplete={"off"}
          />
          <Input
            name="password"
            onChange={(e) =>
              (password.current = e.target.value)
            }
            className="w-56 mb-2"
            placeholder="password"
            autoComplete={"off"}
            type={"password"}
          />
          <div className="flex items-center justify-center mt-2 gap-2">
            <Button type="submit" className="w-25">
              Login
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Page;
