#set page(paper: "a4")

#show "test_number": [t002];
#show "test_number": upper;
#show "test_name": [User creation];
#show "test_description": [Create a user];
#show "test_prerequisite": [t001];
#show "test_prerequisite": upper;
#show "test_creator": [Jakub Novák];
#show "tests_requirements": [4, 9];

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
+ Open main page at `http://localhost:5173` in a web browser.
+ Click on _Register_.
+ Try to create a user with *incorrect* name.
  - *Incorrect *means that the name contains anything other than letters (without accents), numbers and underscores (\_)
    and is 50 characters or longer.
  - *Incorrect* also means a user whose name is already taken, those being `admin`, `Egg Bank` and `karel`.
+ Confirm that upon trying to register a user with an *incorrect* name an error message is shown.
+ Enter a *correct* name and password of your choosing.
  - Note that users with name `admin`, `Egg Bank` and `karel` already exist
    and therefore cannot be chosen.
+ Note down your login credentials for further use.
+ Confirm that you have been redirected to the dashboard.
+ Click on _Logout_.
+ Confirm that you have been logged out and redirected to the main page.
+ Click on _Login_ on the main page.
+ Enter your credentials.
+ Confirm that you have been logged in and shown the same dashboard.
+ Log out again.
+ Log in as user `admin` with password `Hunter12`.
+ Confirm that there is a message in the log saying that a user was created with
  the name that you have specified.
+ Log out again.
+ Click on _Register_ on the main page.
+ Try to create a new account with the same name as your successully created user.
+ Confirm that the an error message is shown.
