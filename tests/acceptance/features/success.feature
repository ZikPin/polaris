Feature: Success criteria of the vision

  @AT-V-04
  Scenario: A course view only shows its own lectures and assignments
    Given I am logged in as "carol"
    And I open the courses page
    And I add the course "Course A"
    And I add the course "Course B"
    When I open the course "Course A"
    And I add the row "A lecture" to the lectures table
    And I add the row "A sheet" to the assignments table
    And I open the course "Course B"
    And I add the row "B lecture" to the lectures table
    And I add the row "B sheet" to the assignments table
    And I open the course "Course A"
    Then the lectures table lists the rows "A lecture"
    And the assignments table lists the rows "A sheet"
    When I open the course "Course B"
    Then the lectures table lists the rows "B lecture"
    And the assignments table lists the rows "B sheet"

  @AT-V-05
  Scenario: The dashboard answers the questions of the vision
    Given I am logged in as "alice"
    And I open the courses page
    When I open the dashboard
    Then the dashboard shows "Solved" as "1 checked, 2 unchecked" for the assignments of "Algorithms"
    And the dashboard shows "Points (sum)" as "23" for the assignments of "Algorithms"
    And the dashboard shows "Grade (average)" as "2" for the assignments of "Linear Algebra"
    And the dashboard shows "Watched" as "3 checked, 1 unchecked" for the lectures of "Algorithms"
    And the dashboard shows "Notes" as "1 checked, 3 unchecked" for the lectures of "Algorithms"
    And the not-done list for the lectures of "Algorithms" is "Chapter 2, Chapter 3, Chapter 4"

  @AT-V-06 @REQ-NF-03
  Scenario: Every main interaction gives visible feedback within 500 ms
    Given I am logged in as "alice"
    And I open the courses page
    # The first visit of a page loads its code, so both pages are visited once before the clock starts.
    And I open the dashboard
    And I open the course "Algorithms"
    Then adding the row "Quick" to the lectures table gives feedback within 500 ms
    And renaming the row "Quick" to "Quicker" in the lectures table gives feedback within 500 ms
    And checking the box "Watched" of the row "Quicker" in the lectures table gives feedback within 500 ms
    And deleting the row "Quicker" from the lectures table gives feedback within 500 ms
    And opening the dashboard gives feedback within 500 ms
