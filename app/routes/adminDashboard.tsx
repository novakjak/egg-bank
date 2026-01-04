import { Link, useFetcher, redirect } from 'react-router';
import { ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/solid'

import { Log, User, AccountRaw, PaymentRaw, UserWithTotalBalance, UserWithoutAccounts } from '../database.server';
import { getSession } from '../sessions.server';
import { timeFormat, formatNumber } from '../util';
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

    const users_with_balance = await UserWithTotalBalance.readAll() ?? [];
    const wealthiest = users_with_balance.toSorted((a, b) => b.total_balance - a.total_balance)[0];
    const users = await User.readAll();
    const total_users = users.length;
    const accounts = await AccountRaw.readRaw();
    const total_accounts = accounts.length;
    const total_balance = accounts.map(a => a.balance).reduce((a, b) => a + b, 0);
    const users_without_accounts = await UserWithoutAccounts.readAll();
    const payments = await PaymentRaw.readRaw();
    const total_payments = payments.length;
    const total_balance_transacted = payments.map(p => p.amount).reduce((a, b) => a + b, 0);

    return {
      log_msgs,
      statistics: {
        wealthiest,
        total_users,
        total_accounts,
        total_balance,
        users_without_accounts,
        total_payments,
        total_balance_transacted,
      },
    };
  } catch (e: any) {
    return { error: true, message: e.toString() };
  }
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps ) {
  const fetcher = useFetcher();
  const log_msgs = (loaderData.log_msgs ?? []).toSorted((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const runExport = (table: string) => fetcher.submit({ table }, { method: "POST", action: "/export" });
  const stats = loaderData.statistics ?? {};

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
      <hr data-text="Statistics" />
      <div className="my-3">
        {stats.wealthiest ? <p>Wealthies user: {stats.wealthiest.name} (<span className="egg">{formatNumber(stats.wealthiest.total_balance)}</span>)</p> : null }
        {stats.total_users ? <p>Total user count: {stats.total_users}</p> : null }
        {stats.total_accounts ? <p>Total account count: {stats.total_accounts}</p> : null }
        {stats.total_balance ? <p className="egg">Total balance: {formatNumber(stats.total_balance)}</p> : null }
        {stats.users_without_account ? <p>Number of users without an account: {stats.users_without_account.length}</p> : null }
        {stats.total_payments ? <p>Total payment count: {stats.total_payments}</p> : null }
        {stats.total_balance_transacted ? <p>Total balance transacted: <span className="egg">{formatNumber(stats.total_balance_transacted)}</span></p> : null }
      </div>
      <hr data-text="Log" />
      <div className="my-3">
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
