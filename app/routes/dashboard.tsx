import { redirect } from "react-router";
import { getSession } from '../sessions.server.ts';

export async function loader({ request }) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  if (!session.has('uid')) {
    return redirect('/');
  }
  const uid = session.get('uid');
}

export default function Dashboard() {
  return ( <h1>hello</h1> )
}
