Feature: Phone layout

  @AT-17 @SR-S-05
  Scenario: The burger menu holds the navigation
    Given I am logged in as "alice"
    And I use a phone 390 pixels wide
    When I open the courses page
    Then the header shows only the brand, the tags button and the burger button
    When I open the menu
    Then the menu opens below the header and lists "Courses, Dashboard, Calendar" and the course "Algorithms"
    And the last entry of the menu is "Log out"
    When I choose "Calendar" in the menu
    Then I see the calendar
    And the menu is closed
    When I open the menu
    And I log out
    Then I am on the login page

  @AT-18 @SR-S-05
  Scenario Outline: The pages are one column on a phone
    Given I am logged in as "alice"
    And I use a phone <width> pixels wide
    When I open the courses page
    Then the filters are directly under the title
    And the courses are shown one per row
    When I open the course "Algorithms"
    Then the back button is directly under the title
    And the lecture table is above the assignment table
    When I open the dashboard
    Then the filters are directly under the title
    And the dashboard cards of "Algorithms" are shown one per row
    When I open the calendar
    Then the calendar grid is above the list of the day
    And the page does not scroll sideways

    Examples:
      | width |
      | 390   |
      | 360   |

  @AT-18 @SR-S-05
  Scenario: A wide window keeps the desktop layout
    Given I am logged in as "alice"
    When I open the courses page
    Then the header shows the Log out button and no burger button
    And the first 4 courses share a row
