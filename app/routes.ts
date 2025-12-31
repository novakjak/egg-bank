import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("basicLayout.tsx", [
    index("routes/home.tsx"),
    route("/register", "routes/register.tsx"),
    route("/login", "routes/login.tsx"),
    route("/logout", "routes/logout.tsx"),
  ]),
  layout("dashboardLayout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("dashboard/account/:aid", "routes/account.tsx"),
    route("admin", "routes/adminDashboard.tsx"),
  ]),
] satisfies RouteConfig;
