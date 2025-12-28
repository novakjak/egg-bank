import {
  Link,
  Outlet,
} from "react-router";

export default function Layout() {
  return (
    <>
      <header className="flex p-5 justify-between">
        <Link to="/"><h1>🥚 Egg bank - dashboard</h1></Link>
        <div className="flex justify-around ">
          <Link to="/logout">Logout</Link>
        </div>
      </header>
      <main className="w-3/5 mx-auto">
        <Outlet />
      </main>
    </>
  );
}
