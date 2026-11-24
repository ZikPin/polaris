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
    When I rename the course "Algorithms" to "Algorithms 1" and cancel
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
    Then the course has no tables

  @AT-21 @SR-S-10
  Scenario: Add a course with all its fields
    Given I am logged in as "alice"
    When I open the courses page
    Then the add card is collapsed
    When I expand the add card
    Then the add card shows the tags, the table types, the description, the color and the hide option
    When I fill the add card with "Operating Systems", the tag "Semester 1", the description "Processes and threads", the color "sage" and the hide option
    And I collapse the add card
    And I expand the add card
    Then the add card still has "Operating Systems", the tag "Semester 1", the description "Processes and threads", the color "sage" and the hide option
    When I click the add button of the add card
    Then the course "Operating Systems" shows the tags "Semester 1"
    And the card of "Operating Systems" shows the description "Processes and threads"
    And the card of "Operating Systems" has the color "sage"
    And the card of "Operating Systems" is marked as hidden
    And the menu does not list the course "Operating Systems"
    And the add card is expanded and empty
    When I reload the page
    Then the card of "Operating Systems" is marked as hidden
    And the menu does not list the course "Operating Systems"
    And the add card is collapsed
    When I add the course "Networks"
    Then the card of "Networks" shows no tags and has the color "clay"
    And the menu lists the course "Networks"
    When I add a course with a title of only spaces
    Then I see an error
    And the add card is collapsed
    And the title of the add card is still "   "
    And I see the courses "Algorithms, Linear Algebra, Databases, Machine Learning, Statistics, Operating Systems, Networks"
