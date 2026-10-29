Feature: Authentication

  @AT-01 @SR-M-09
  Scenario: Register, log out, log in again
    Given I open the register page
    When I register as "new.user@example.com" with the password "password123"
    Then I see the main page
    When I log out
    And I open the courses page
    Then I am on the login page
    When I log in as "new.user@example.com" with the password "wrong-password"
    Then I see an error
    When I log in as "new.user@example.com" with the password "password123"
    Then I see the main page
