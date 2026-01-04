import { Link, useFetcher, redirect } from 'react-router';
import { ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/solid'

import { Log } from '../database.server';
import { getSession } from '../sessions.server';
import { timeFormat } from '../util';
import Error from '../components/Error';

import type { Route } from './+types/adminDashboard';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  if (!session.has('uid') || !session.has('admin')) {
    return redirect('/');
  }
  if (!session.get('admin')) {
    return redirect('/dashboard');
  }
  
  try {
    const log_msgs = await Log.readAll();
    return { log_msgs };
  } catch (e: any) {
    return { error: true, message: e.toString() };
  }
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps ) {
  const fetcher = useFetcher();
  const log_msgs = loaderData.log_msgs!.toSorted((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const runExport = (table: string) => fetcher.submit({ table }, { method: "POST", action: "/export" });

  return (
    <>
      <Error error={loaderData?.error} message={loaderData?.message} />
      <Error error={fetcher.data?.error} message={fetcher.data?.message} />
      <hr data-text="Export" />
      <div className="flex flex-row justify-around my-[1rem] gap-[1rem]">
        <button className="iconbutton" onClick={() => runExport('users')}><ArrowRightStartOnRectangleIcon className="size-6 inline"/>Export user data</button>
        <button className="iconbutton" onClick={() => runExport('account')}><ArrowRightStartOnRectangleIcon className="size-6 inline"/>Export account data</button>
        <button className="iconbutton" onClick={() => runExport('payment')}><ArrowRightStartOnRectangleIcon className="size-6 inline"/>Export payment data</button>
      </div>
      <hr data-text="Import" />
      <div className="flex flex-row justify-around my-[1rem] gap-[1rem]">
        <Link to="/import" className="iconbutton"><ArrowRightEndOnRectangleIcon className="size-6 inline" />Import data</Link>
      </div>
      <hr data-text="Log" />
      <div>
        <div className="logHeader">
          <p>Timestamp</p>
          <p>Message</p>
          <p>Account</p>
          <p>User</p>
        </div>
        {log_msgs.map(msg => {
          const user = typeof msg.user === 'number' ? msg.user : msg.user?.name;
          const account = typeof msg.account === 'number' ? msg.account : msg.account?.name;
          return (
            <div className="log" key={msg.id ?? 0}>
              <p>{timeFormat.format(msg.timestamp)}</p>
              <p>{msg.message}</p>
              <p>{account}</p>
              <p>{user}</p>
            </div>
          );
        }
        )}
      </div>
    </>
  );
}
