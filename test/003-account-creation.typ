#set page(paper: "a4")

#show "test_number": [t003];
#show "test_number": upper;
#show "test_name": [Account creation];
#show "test_description": [A user will open an account to store their eggs];
#show "test_prerequisite": [t002, t001];
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
+ Open main page at `http://localhost:5173` in a web browser.
+ Log in as the user created in test _T002_.
+ Click on _Open account_.
+ Enter account name.
+ Select type _Basic_.
+ Click on _Register_.
+ Confirm that a widget was added to the dashboard.
+ Confirm that the widget contains the name you have entered.
+ Confirm that the widget contains the word _basic_.
+ Click on _Open account_.
+ Leave account name blank.
+ Select type _Basic_.
+ Click on _Register_.
+ Confirm that a new widget was added to the dashboard.
+ Confirm that the widget contains the name _Basic account_.
+ Confirm that the widget contains the word _basic_ on the second line.
+ On the dashboard click on the account created first.
+ Confirm that the an incoming payment is shown with a green background.
+ Confirm that the payment has an amount of 50 eggs.
+ Confirm that the payment contains the message: "A gift for first time Egg Bank users".
+ Confirm that the payment was sent from the account _EggBank\#1_.
+ Click on _New payment_.
+ Enter destination account in the form of `<name>#2` where `<name>` is the name of the user you have created.
  - For example if the user is named `Daniel` then you would enter `Daniel#2`.
+ Enter amount of funds greater that zero and less that the balance held in the account.
+ Click on _Transfer_.
+ Confirm that _Balance_ decreased.
+ Confirm that a new outgoing payment of the amount you specified is
  displayed with red background with no message.
+ Click on _Back to dashboard_.
+ Click on the account created second.
+ It should show one incoming payment from the first account with the same amount.
+ Click on _Back to dashboard_.
+ It should show that your total funds is 50 eggs.
