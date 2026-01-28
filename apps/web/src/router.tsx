import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { LoginPage } from "./views/LoginPage";
import { AdminPage } from "./views/AdminPage";
import { OperatorPage } from "./views/OperatorPage";
import { PublicQueuePage } from "./views/PublicQueuePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <PublicQueuePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "operador", element: <OperatorPage /> },
      { path: "fila/:queueId", element: <PublicQueuePage /> }
    ]
  }
]);

