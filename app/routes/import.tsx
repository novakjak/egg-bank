import { redirect } from 'react-router';

import { getSession } from '../sessions.server';
import { Db, User, AccountRaw, PaymentRaw } from '../database.server';
import ErrorBanner from '../components/Error';
import SuccessBanner from '../components/Success';

import type { Route } from './+types/import';

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

  const formData = await request.formData();

  let users;
  try {
    const data = formData.get('users')
    if (!(data instanceof Blob)) {
      throw new Error("Users file was not submitted to form");
    }
    const usersRaw = JSON.parse(await data.text());
    if (!Array.isArray(usersRaw)) {
      throw new Error("Parsed object is not an array");
    }
    users = usersRaw.map(u => User.fromExported(u));
  } catch (e) {
    console.log(e)
    return { error: true, message: "Could not parse users" };
  }
  let accounts;
  try {
    const data = formData.get('account');
    if (!(data instanceof Blob)) {
      throw new Error("Account file was not submitted to form");
    }
    const accountsRaw = JSON.parse(await data.text());
    if (!Array.isArray(accountsRaw)) {
      throw new Error("Parsed object is not an array");
    }
    accounts = accountsRaw.map(a => AccountRaw.fromExported(a));
  } catch (e) {
    console.log(e)
    return { error: true, message: "Could not parse accounts" };
  }
  let payments;
  try {
    const data = formData.get('payment');
    if (!(data instanceof Blob)) {
      throw new Error("Payment file was not submitted to form");
    }
    const paymentsRaw = JSON.parse(await data.text());
    if (!Array.isArray(paymentsRaw)) {
      throw new Error("Parsed object is not an array");
    }
    payments = paymentsRaw.map(p => PaymentRaw.fromExported(p));
  } catch (e) {
    console.log(e)
    return { error: true, message: "Could not parse payments" };
  }

  let transaction;
  try {
    transaction = await Db.createTransaction();
  } catch (e) {
    return { error: true, message: "could not create transaction" };
  }
  
  try {
    await PaymentRaw.truncate(transaction);
    await AccountRaw.truncate(transaction);
    await User.truncate(transaction);
  } catch (e) {
    await transaction.rollback();
    console.log(e);
    return { error: true, message: "Could not truncate tables" };
  }
  try {
    for (const user of users) {
      if (!user) {
        continue;
      }
      console.log(user);
      await user.insertRaw(transaction);
    }
    for (const account of accounts) {
      if (!account) {
        continue;
      }
      await account.insertRaw(transaction);
    }
    for (const payment of payments) {
      if (!payment) {
        continue;
      }
      await payment.insertRaw(transaction);
    }
  } catch (e) {
    await transaction.rollback();
    console.log(e);
    return { error: true, message: "Could not import data into tables" };
  }

  try {
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    return { error: true, message: "There was an error commiting the data to the database" };
  }
  return { success: true, message: "Data imported successfully" };
}

export default function Import({ actionData }: Route.ComponentProps) {
  return (
    <>
      <SuccessBanner success={actionData?.success} message={actionData?.message} />
      <ErrorBanner error={actionData?.error} message={actionData?.message} />
      <form method="POST" encType="multipart/form-data">
        <label htmlFor="users">Select users file:</label>
        <input type="file" accept=".json,application/json" name="users" id="users" required />
        <label htmlFor="account">Select account file:</label>
        <input type="file" accept=".json,application/json" name="account" id="account" required />
        <label htmlFor="payment">Select payment file:</label>
        <input type="file" accept=".json,application/json" name="payment" id="payment" required />
        <button type="submit">Import</button>
      </form>
    </>
  )
}
