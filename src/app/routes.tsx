import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { Landing } from "./pages/landing";
import { Home } from "./pages/home";
import { Visa } from "./pages/visa";
import { Remit } from "./pages/remit";
import { Housing } from "./pages/housing";
import { Education } from "./pages/education";
import { Profile } from "./pages/profile";
import { Paywall } from "./pages/paywall";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { path: "home", Component: Home },
      { path: "visa", Component: Visa },
      { path: "remit", Component: Remit },
      { path: "housing", Component: Housing },
      { path: "education", Component: Education },
      { path: "profile", Component: Profile },
      { path: "paywall", Component: Paywall },
    ],
  },
]);