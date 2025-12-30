import {
  Link,
  Outlet,
} from "react-router";

export default function Layout() {
  return (
    <>
      <header className="flex p-5 justify-between">
        <Link to="/">🥚 Egg Bank</Link>
        <div className="flex justify-around ">
          <Link className="mx-3" to="/login">Login</Link>
          <Link className="mx-3" to="/register">Register</Link>
        </div>
      </header>
      <main className="w-3/5 mx-auto">
        <Outlet />
      </main>
    </>
  );
}
