Feature: Table types

  @AT-22 @SR-S-11
  Scenario: Manage the table types
    Given I am logged in as "alice"
    And I open the courses page
    When I open the tables dialog
    Then the tables dialog warns that deleting a table type deletes its data
    When I add the table types "Labs, Exams"
    Then the table types are listed as "Assignments, Exams, Labs, Lectures"
    When I add the table types "Labs"
    Then I see an error
    When I rename the table type "Exams" to "Quizzes"
    Then the table types are listed as "Assignments, Labs, Lectures, Quizzes"
    When I delete the table type "Lectures" and dismiss the confirmation
    Then the table types are listed as "Assignments, Labs, Lectures, Quizzes"
    When I delete the table type "Lectures" and accept the confirmation
    Then the table types are listed as "Assignments, Labs, Quizzes"
    When I close the tables dialog
    And I open the dashboard
    Then every course on the dashboard has only the tables "Assignments"
    When I open the course "Algorithms"
    Then the course shows the tables "Assignments"
    And the assignments table lists the rows "Sheet 1, Sheet 2, Sheet 3"
    When I reload the page
    Then the course shows the tables "Assignments"

  @AT-23 @SR-S-11
  Scenario: Choose the tables of a course
    Given I am logged in as "carol"
    And I open the courses page
    When I open the tables dialog
    And I add the table types "Labs"
    And I close the tables dialog
    And I add the course "Physics"
    And I open the course "Physics"
    Then the course has no tables
    When I open the dashboard
    Then the dashboard notes that "Physics" has no tables
    When I open the courses page
    And I set the tables of the course "Physics" to "Labs, Assignments"
    And I open the course "Physics"
    Then the course shows the tables "Assignments, Labs"
    When I add the row "Lab 1" to the Labs table
    And I add the checkbox column "Done" to the Labs table
    And I check the box "Done" of the row "Lab 1" in the Labs table
    And I add the row "Sheet 1" to the assignments table
    And I open the dashboard
    Then the dashboard shows the tables "Assignments, Labs" for "Physics"
    And the dashboard shows "Done" as "1 checked, 0 unchecked" for the Labs of "Physics"
    When I open the calendar
    And I select a day without entries
    And I add "Lab 1, Labs" of "Physics" to the selected day
    And I add "Sheet 1, Assignments" of "Physics" to the selected day
    Then the selected day lists the entries "Physics: Sheet 1, Assignments; Physics: Lab 1, Labs"
    When I open the courses page
    And I untick the table "Labs" of the course "Physics" after seeing the warning
    And I open the course "Physics"
    Then the course shows the tables "Assignments"
    And the assignments table lists the rows "Sheet 1"
    When I open the dashboard
    Then the dashboard shows the tables "Assignments" for "Physics"
    When I open the calendar
    Then the calendar shows the entry "Sheet 1" but not "Lab 1"
