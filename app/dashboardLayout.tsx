import {
  Link,
  Outlet,
  useLocation,
} from "react-router";

import { getSession } from './sessions.server';
import type { Route } from './+types/dashboardLayout';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  return { admin: session.get('admin') ?? false }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const location = useLocation()
  const admin = loaderData?.admin ?? false
  return (
    <>
      <header className="flex p-5 justify-between">
        <Link to="/dashboard">🥚 Egg Bank - dashboard</Link>
        <div className="flex flex-row justify-around gap-[2rem]">
          { location.pathname !== '/dashboard' && !admin && <Link to="/dashboard">Back to dashboard</Link>}
          { location.pathname === '/admin' && admin && <Link to="/dashboard">Back to dashboard</Link>}
          { location.pathname !== '/admin' && admin && <Link to="/admin">To admin dashboard</Link>}
          <Link to="/logout">Logout</Link>
        </div>
      </header>
      <main className="w-3/5 mx-auto">
        <Outlet />
      </main>
    </>
  );
}
