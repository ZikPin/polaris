Feature: Tables of a course

  Background:
    Given I am logged in as "carol"
    And I open the courses page
    And I add the course "Algorithms"
    And I open the course "Algorithms"

  @AT-04 @SR-M-02
  Scenario: Add, rename and delete lectures and assignments
    When I add the row "Intro" to the lectures table
    And I add the row "Sheet 1" to the assignments table
    Then the lectures table lists the rows "Intro"
    And the assignments table lists the rows "Sheet 1"
    When I rename the row "Intro" to "Introduction" in the lectures table
    And I rename the row "Sheet 1" to "Sheet A" in the assignments table
    And I reload the page
    Then the lectures table lists the rows "Introduction"
    And the assignments table lists the rows "Sheet A"
    When I delete the row "Introduction" from the lectures table
    And I delete the row "Sheet A" from the assignments table
    And I reload the page
    Then the lectures table has no rows
    And the assignments table has no rows

  @AT-05 @SR-M-03 @SR-M-04
  Scenario: A checkbox column is added to every row
    When I add the row "L1" to the lectures table
    And I add the row "L2" to the lectures table
    And I add the checkbox column "Watched" to the lectures table
    And I add the row "L3" to the lectures table
    Then the lectures table has the column "Watched"
    And every box "Watched" in the lectures table is unchecked
    And the lectures table lists the rows "L1, L2, L3"
    And the assignments table has no column "Watched"

  @AT-06 @SR-M-03
  Scenario: A checkbox column is deleted
    When I add the row "L1" to the lectures table
    And I add the row "L2" to the lectures table
    And I add the checkbox column "Watched" to the lectures table
    And I delete the column "Watched" from the lectures table
    Then the lectures table has no column "Watched"
    And the lectures table lists the rows "L1, L2"

  @AT-07 @SR-M-05
  Scenario: A checked box is kept
    When I add the row "L1" to the lectures table
    And I add the checkbox column "Watched" to the lectures table
    And I check the box "Watched" of the row "L1" in the lectures table
    And I reload the page
    Then the box "Watched" of the row "L1" in the lectures table is checked
    When I uncheck the box "Watched" of the row "L1" in the lectures table
    And I reload the page
    Then the box "Watched" of the row "L1" in the lectures table is unchecked

  @AT-11 @SR-S-01
  Scenario: Number column with values
    When I add the row "Sheet 1" to the assignments table
    And I add the row "Sheet 2" to the assignments table
    And I add the row "Sheet 3" to the assignments table
    And I add the row "Sheet 4" to the assignments table
    And I add the number column "Grade" to the assignments table
    And I enter "1" in the column "Grade" of the row "Sheet 1" in the assignments table
    And I enter "2" in the column "Grade" of the row "Sheet 2" in the assignments table
    And I enter "3" in the column "Grade" of the row "Sheet 3" in the assignments table
    And I enter "5" in the column "Grade" of the row "Sheet 3" in the assignments table
    And I reload the page
    Then the column "Grade" of the row "Sheet 1" in the assignments table shows "1"
    And the column "Grade" of the row "Sheet 2" in the assignments table shows "2"
    And the column "Grade" of the row "Sheet 3" in the assignments table shows "5"
    When I enter "abc" in the column "Grade" of the row "Sheet 4" in the assignments table
    Then the column "Grade" of the row "Sheet 4" in the assignments table shows ""
    When I delete the column "Grade" from the assignments table
    Then the assignments table has no column "Grade"
