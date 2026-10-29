Feature: Courses

  @AT-02 @SR-M-09
  Scenario: Users only see their own courses
    Given I note the address of the course "Algorithms" of "alice"
    And I am logged in as "bob"
    When I open the courses page
    Then I see the courses "Biology, Chemistry"
    When I open the noted address
    Then I am sent back to the courses page and see nothing of "Algorithms"

  @AT-03 @SR-M-01
  Scenario: Add, rename and delete a course
    Given I am logged in as "carol"
    When I open the courses page
    And I add the course "Algorithms"
    Then I see the courses "Algorithms"
    When I rename the course "Algorithms" to "Algorithms 1"
    Then I see the courses "Algorithms 1"
    When I delete the course "Algorithms 1" and dismiss the confirmation
    Then I see the courses "Algorithms 1"
    When I delete the course "Algorithms 1" and accept the confirmation
    Then I see no courses
    When I reload the page
    Then I see no courses
    When I add the course "Algorithms 1"
    And I open the course "Algorithms 1"
    Then the lectures table has no rows
    And the assignments table has no rows
