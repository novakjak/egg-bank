#set page(paper: "a4")

#show "test_number": [];
#show "test_number": upper;
#show "test_name": [];
#show "test_description": [];
#show "test_prerequisite": [];
#show "test_prerequisite": upper;
#show "test_creator": [Jakub Novák];
#show "tests_requirements": [];

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
+ step 1
+ step 2
+ step 2

= Confirmation of expected results
