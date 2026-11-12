import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import App from "@/App"
import { ConfirmProvider } from "@/components/common/ConfirmDialog"
import "@/styles.css"

import { queryClient } from "@/queryClient"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <App />
        <Toaster richColors position="top-right" closeButton />
      </ConfirmProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
