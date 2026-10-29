Feature: Dashboard

  Background:
    Given I am logged in as "alice"
    And I open the courses page

  @AT-09 @SR-M-07
  Scenario: Checked and unchecked boxes are counted per table
    When I open the dashboard
    Then the dashboard shows "Watched" as "3 checked, 1 unchecked" for the lectures of "Algorithms"
    And the dashboard shows "Solved" as "1 checked, 2 unchecked" for the assignments of "Algorithms"
    And the dashboard has no "Solved" for the lectures of "Algorithms"

  @AT-10 @SR-M-08
  Scenario: Rows with an unchecked box are listed as not done
    When I open the dashboard
    Then the not-done list for the lectures of "Algorithms" is "Chapter 2, Chapter 3, Chapter 4"
    And the not-done list for the assignments of "Algorithms" is "Sheet 2, Sheet 3"
    When I open the course "Algorithms"
    And I check the box "Notes" of the row "Chapter 2" in the lectures table
    And I open the dashboard
    Then the not-done list for the lectures of "Algorithms" is "Chapter 3, Chapter 4"

  @AT-12 @SR-S-02
  Scenario: The dashboard is restricted to tags and courses
    When I open the dashboard
    And I show only the tag "Semester 2" on the dashboard
    Then the dashboard shows the courses "Databases, Machine Learning"
    When I remove the dashboard filters
    And I show only the course "Algorithms" on the dashboard
    Then the dashboard shows the courses "Algorithms"
    When I remove the dashboard filters
    Then the dashboard shows the courses "Algorithms, Linear Algebra, Databases, Machine Learning, Statistics"

  @AT-13 @SR-S-03
  Scenario: Choose the statistic of a number column
    When I open the dashboard
    Then the dashboard shows "Grade (average)" as "2" for the assignments of "Linear Algebra"
    When I open the course "Linear Algebra"
    And I set the statistic of the column "Grade" in the assignments table to "Sum"
    And I open the dashboard
    Then the dashboard shows "Grade (sum)" as "6" for the assignments of "Linear Algebra"
    When I reload the page
    Then the dashboard shows "Grade (sum)" as "6" for the assignments of "Linear Algebra"
