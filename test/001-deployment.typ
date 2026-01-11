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
+ Update configuration options in the `.env` file in project root directory.
  - See _README.md_ for configuration options.
  - Set server to `tcp:193.85.203.188`.
  - Set user to `novak17`.
  - Set password to `databaze`.
  - Set database to `novak17`.
  - Set port to `1433`.
  - Set TrustServerCertificate to `yes`.
  - Set encryption to `no`.
+ Install dependencies by executing `npm install` in a console in the project directory.
+ Run the server by executing `npm run dev` in a console in the project directory.
+ Confirm that the server started successfully by opening the address `http://localhost:5173`
  in a web browser.
+ Stop the server by pressing CTRL-C in the console window.
+ Change configuration in `.env` to something incorrect and try to restart server.
+ Confirm that server does not start and prints an error message to the command line.
+ Change configuration back to the correct settings.
+ Open Web UI in a browser at the address `http://localhost:5173`.
+ Open _Login_ page.
+ Log in with name `admin` and password `Hunter12`.
+ Click on _Import data_ button.
+ For the first file input select `users.json` from the `export/` directory.
+ For the second file input select `account.json` from the `export/` directory.
+ For the third file input select `payment.json` from the `export/` directory.
+ Click on _Import_.
+ Click on button labeled _Back to dashboard_.
+ Confirm that log section contains messages of user creation and opening of accounts.
+ Click on button labeled _Logout_.
+ Click on button labeled _Login_.
+ Enter name `karel` and password `karel`.
+ Confirm that user _karel_ has two accounts opened one of type _basic_ and the other of type _savings_.
  - Under account name there should be written either `basic` or `savings`.
+ Confirm that in both accounts there are some eggs stored.
  - Under account type there should be a number greater than 0 with an egg (🥚) after.
