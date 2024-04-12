"use client";
import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";

export const Providers = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <SessionProvider
      refetchInterval={30}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
};
