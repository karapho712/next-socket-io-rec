"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React, { ReactNode, useState } from "react";

export const TanstackQueryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [client] = useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
};
