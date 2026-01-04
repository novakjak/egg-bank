import { redirect } from 'react-router';

import { getSession } from '../sessions.server';
import { User, PaymentRaw, AccountRaw } from '../database.server'

import type { Route } from './+types/export';

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  if (!session.has('uid') || !session.has('admin')) {
    return redirect('/');
  }
  if (!session.get('admin')) {
    return redirect('/dashboard');
  }
  const formData = await request.formData()
  const table = formData.get('table');
  if (!table) {
    return;
  }
  try {
    switch (table) {
      case 'users':
        const users = await User.readAll();
        return { tableName: 'users', tableData: JSON.stringify(users) };
      case 'account':
        const accounts = await AccountRaw.readRaw();
        return { tableName: 'account', tableData: JSON.stringify(accounts) };
      case 'payment':
        const payments = await PaymentRaw.readRaw();
        return { tableName: 'payment', tableData: JSON.stringify(payments) };
    }
  } catch (e: any) {
    return { error: true, message: e.toString() };
  }
}

export async function clientAction({ request, serverAction }: Route.ClientActionArgs) {
  const actionData = await serverAction();
  if (!actionData) {
    return { error: true, message: "Server did not respond with usable data" }
  }
  if ('error' in actionData) {
    return actionData;
  }
  const {tableName, tableData} = actionData;
  const url = URL.createObjectURL(new Blob([tableData], { type: "application/json" }));
  const anchor = document.createElement('a')
  anchor.download = tableName + '.json'
  anchor.href = url
  anchor.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 1000);
  anchor.click();
  return {}
}

