#set page(paper: "a4")

#show "test_number": [T004];
#show "test_number": upper;
#show "test_name": [Updating statistics report];
#show "test_description": [Upon updating state in the database a statistics
                          report on the admin dashboard should get updated];
#show "test_prerequisite": [T003, T002, T001];
#show "test_prerequisite": upper;
#show "test_creator": [Jakub Novák];
#show "tests_requirements": [6];

= Test case test_number

#table(
  columns: (1fr, 1fr, 1fr, 1fr),
  inset: 10pt,
  [Test number],
  [test_number],
  [Test name],
  [test_name],
  [Description],
  table.cell(colspan: 3)[test_description],
  [Prerequisite tests],
  [test_prerequisite],
  [Test creator],
  [test_creator],
  [Tests requirements from assignment],
  [tests_requirements],
  [Test creation date],
  datetime.today().display(),
)

= Steps
+ Log in as user `admin` with password `Hunter12`.
+ Note down the information in the _Statistics_ section.
+ Log out.
+ Create a new user.
+ Log out of new user.
+ Log back in as `admin`.
+ Notice that _Total user count_ has increased.
+ Log out of admin account.
+ Log back in as your created user.
+ Open several new accounts.
+ Log out of your user.
+ Log back in as admin.
+ Notice that `Total account count` has increased.
+ Notice that `Total balance` has increased due to your user receiving a bonus
  for opening their first account.
+ Log out of admin account.
+ Log back in as your created user.
+ Create a new transaction.
+ Log out of your user.
+ Log back in as admin.
+ Notice that `Total payment count` has increased.
+ Notice that `Total balance transferred` has increased.
  - Note that depending on how long the testing will take `Total balance transsfered`
    can increase by a higher value that the one you have specified during the transaction.
    That is due to interest being paid out.
+ Notice that unless interest was paid out `Total balance` did not change.
  - You can check wether any interest was paid out in the log. (There should be a message saying _added interest_.)
