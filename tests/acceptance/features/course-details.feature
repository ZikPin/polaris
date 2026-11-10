Feature: Course description and color

  @AT-15 @SR-S-04
  Scenario: Describe a course
    Given I am logged in as "carol"
    And I open the courses page
    And I add the course "Algorithms"
    And I add the course "Databases"
    And I create the tags "Semester 1"
    When I edit the course "Algorithms" to the tag "Semester 1", a description of 200 characters and the color "sage"
    And I reload the page
    Then the card of "Algorithms" shows the tag "Semester 1" and the first 150 characters of the description with an ellipsis
    And the card of "Algorithms" has the color "sage"
    And the card of "Databases" shows no description and has the color "clay"
    When I click the card of "Algorithms"
    Then the course page shows the tag "Semester 1" and the whole description

  @AT-16 @SR-S-04
  Scenario: The color of a course is used everywhere the course is shown
    Given I am logged in as "carol"
    And I have the course "Algorithms" in the color "sage" with a lecture and an assignment
    And I have the course "Databases" in the color "blue" with a lecture and an assignment
    And all the lectures and assignments are planned for today
    When I open the courses page
    Then the card of "Algorithms" has the color "sage"
    And the card of "Databases" has the color "blue"
    And the navigation dot of "Algorithms" has the color "sage"
    And the navigation dot of "Databases" has the color "blue"
    When I open the dashboard
    Then the dashboard cards of "Algorithms" have the color "sage"
    And the dashboard cards of "Databases" have the color "blue"
    When I open the calendar
    Then the calendar entries of "Algorithms" have the color "sage"
    And the calendar entries of "Databases" have the color "blue"
    When I open the course "Algorithms"
    Then the table headers have the color "sage"

  @AT-20 @SR-S-07
  Scenario: Hide a course from the menu
    Given I am logged in as "carol"
    And I have the course "Algorithms" in the color "sage" with a lecture and an assignment
    And I have the course "Databases" in the color "blue" with a lecture and an assignment
    And all the lectures and assignments are planned for today
    When I open the courses page
    And I hide the course "Algorithms" from the menu
    Then the menu does not list the course "Algorithms"
    And the menu lists the course "Databases"
    And the card of "Algorithms" is marked as hidden
    When I reload the page
    Then the menu does not list the course "Algorithms"
    When I click the card of "Algorithms"
    Then I see the course page of "Algorithms"
    When I open the dashboard
    Then the dashboard shows the courses "Algorithms, Databases"
    When I open the calendar
    Then the calendar shows an entry of "Algorithms"
    When I open the courses page
    And I show the course "Algorithms" in the menu again
    Then the menu lists the course "Algorithms"
