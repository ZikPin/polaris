Feature: Calendar

  @AT-14 @SR-C-01 @SR-C-02
  Scenario: Plan a lecture and an assignment on a day
    Given I am logged in as "alice"
    And I open the courses page
    When I open the calendar
    And I select a day without entries
    And I add "Chapter 1, lecture" of "Algorithms" to the selected day
    And I add "Sheet 1, assignment" of "Algorithms" to the selected day
    Then the selected day lists the entry "Algorithms: Chapter 1, lecture"
    And the selected day lists the entry "Algorithms: Sheet 1, assignment"
    When I remove "Chapter 1, lecture" from the selected day
    And I remove "Sheet 1, assignment" from the selected day
    Then the selected day is empty
