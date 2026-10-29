Feature: Tags

  @AT-08 @SR-M-06
  Scenario: Tag courses and filter by tags
    Given I am logged in as "carol"
    And I open the courses page
    And I add the course "A"
    And I add the course "B"
    And I add the course "C"
    When I create the tags "Semester 1, ML"
    And I tag the course "A" with "Semester 1"
    And I tag the course "B" with "Semester 1, ML"
    And I tag the course "C" with "ML"
    Then the tags are listed as "ML, Semester 1"
    And the course "B" shows the tags "ML, Semester 1"
    When I filter the courses by the tags "Semester 1"
    Then I see the courses "A, B"
    When I remove the course filter
    And I filter the courses by the tags "ML"
    Then I see the courses "B, C"
    When I filter the courses by the tags "Semester 1"
    Then I see the courses "A, B, C"
