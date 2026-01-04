#set page(paper: "a4")

#show "test_number": [t001];
#show "test_number": upper;
#show "test_name": [Deployment];
#show "test_description": [Create a new deployment of web app and database];
#show "test_prerequisite": [];
#show "test_prerequisite": upper;
#show "test_creator": [Jakub Novák];
#show "tests_requirements": [1, 2, 3, 5, 7, 8, 9];

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
+ Connect to Microsoft SQL Server using SQL Server Management Studio.
+ Start the SQL Server Agent service if it is not running.
  - See https://database.guide/enable-sql-server-agent-via-ssms/ for a guide.
+ Create a new query.
+ Paste script within `database.sql` into the newly created query.
+ Confirm that the table definitions in the query contain colums with types `decimal`, `bit`, `varchar`, `datetime`
  and that some columns have a check constraint in the form of `check(<column> in ('<str1>', '<str2>', ...))`.
+ Execute query.
+ Reload `Databases` in _Object Explorer_.
+ Confirm that a database named `egg_bank` was created.
+ Confirm that the databae contains tables `users`, `account`, `payment`, `log` and `log_msg_type`.
+ Install dependencies with `npm install`.
+ Update configuration options in the `.env` file in project root directory.
  - See _README.md_ for configuration options.
+ Run the server with `npm run dev`.
+ Change configuration to something incorrect and try to restart server.
  - Server can be stopped by pressing CTRL-C.
+ Confirm that server does not start and prints an error message.
+ Open Web UI in a browser at the address `http://localhost:5173`.
+ Open _Login_ page.
+ Log in with name `admin` and password `Hunter12`.
+ Click on _Import data_ button.
+ For the first file input select `users.json` from the `export/` directory.
+ For the second file input select `account.json` from the `export/` directory.
+ For the third file input select `payment.json` from the `export/` directory.
+ Click on _Import_.

= Confirmation of expected results
+ Click on button labeled _Back to dashboard_.
+ Confirm that log section contains messages of user creation and opening of accounts.
+ Click on button labeled _Logout_.
+ Click on button labeled _Login_.
+ Enter name `karel` and password `karel`.
+ Confirm that user _karel_ has two accounts opened one of type _basic_ and the other of type _savings_.
  - Under account name there should be written either `basic` or `savings`.
+ Confirm that in both accounts there are some eggs stored.
  - Under account type there should be a number greater than 0 with an egg (🥚) after.
