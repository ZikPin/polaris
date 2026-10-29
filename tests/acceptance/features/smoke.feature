Feature: Test setup

  # These two scenarios only prove the setup: the second one fails if the database is not restored between tests.
  @smoke
  Scenario: Carol adds a course
    Given I am logged in as "carol"
    When I open the courses page
    And I add the course "Temporary"
    Then I see the courses "Temporary"

  @smoke
  Scenario: The database is restored, carol has no courses again
    Given I am logged in as "carol"
    When I open the courses page
    Then I see no courses

  @smoke
  Scenario: Alice has the seeded courses
    Given I am logged in as "alice"
    When I open the courses page
    Then I see the courses "Algorithms, Linear Algebra, Databases, Machine Learning, Statistics"
