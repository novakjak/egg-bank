#set page(paper: "a4")

#show "test_number": [t003];
#show "test_number": upper;
#show "test_name": [Account creation];
#show "test_description": [A user will open an account to store their eggs];
#show "test_prerequisite": [t002];
#show "test_prerequisite": upper;
#show "test_creator": [Jakub Novák];
#show "tests_requirements": [9];

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
  datetime.today().display()
)

= Steps
+ Log in as the user created in test _T002_.
+ Click on _Open account_.
+ Enter account name.
+ Select type _Basic_.
+ Click on _Register_.
+ Click on _Open account_.
+ Leave account name blank.
+ Select type _Basic_.
+ Click on _Register_.
+ On the dashboard click on the account created first.
+ Click on _New payment_.
+ Enter destination account in the form of `<name>#2` where `<name>` is the name of the user you have created.
  - For example if the user is named `Daniel` then you would enter `Daniel#2`.
+ Enter amount of funds greater that zero and less that the balance held in the account.
+ Click on _Transfer_.

= Confirmation of expected results
+ On the dashboard click on the account created first.
+ It should have the name you have specified.
+ It should show two payments.
  - The first is incoming from account `Egg Bank#1` with 50 eggs shown in green.
  - The second outgoing to the account created second with amount that you have chosen.
+ On the dashboard click on the account created second.
+ It should be named _Basic account_.
+ It should have only one incoming payment from the first account with the same amount.
+ On the dashboard it should show that your total funds are 50.
