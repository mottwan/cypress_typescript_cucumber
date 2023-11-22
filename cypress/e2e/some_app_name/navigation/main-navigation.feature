@ui # used to trigger UI global hooks
Feature: Patient Portal Main Navigation

  Rule: Happy paths
    Scenario Outline: Navigate through Medical Information <navigationItem> page
      Given I'm redirected on "home" page
      When I expand "<navigationItem>" of "Medical Information" from "main" menu
      Then I am redirected to "<pageUrl>" page
      Examples:
        | navigationItem     | pageUrl                    |
        | Medical Conditions | /app/medical/conditions    |
        | Medications        | /app/medical/medication    |
        | Allergies          | /app/medical/allergies     |
        | Pharmacies         | /app/medical/pharmacies    |
        | Surgery History    | /app/medical/surgeries     |
        | Social History     | /app/medical/socialHistory |
        | Family History     | /app/medical/family        |

    Scenario Outline: Navigate through Billing & Payments <navigationItem> page
      Given I'm redirected on "home" page
      When I expand "<navigationItem>" of "Billing & Payments" from "main" menu
      Then I am redirected to "<pageUrl>" page
      Examples:
        | navigationItem         | pageUrl                  |
        | View Current Statement | /billing/statement       |
        | View Previous Payments | /billing/payment/history |
        | Make a Payment         | /billing/payment         |

    Scenario Outline: Navigate through Personal Information <navigationItem> page
      Given I'm redirected on "home" page
      When I expand "<navigationItem>" of "Personal Information" from "main" menu
      Then I am redirected to "<pageUrl>" page
      Examples:
        | navigationItem | pageUrl               |
        | Profile        | /app/personal/profile |
        | Insurance      | /profile/insurance    |

    Scenario Outline: Navigate through Appointments <navigationItem> page
      Given I'm redirected on "home" page
      When I expand "<navigationItem>" of "Appointments" from "main" menu
      Then I am redirected to "<pageUrl>" page
      Examples:
        | navigationItem        | pageUrl                    |
        | Upcoming Appointments | /app/appointments/upcoming |
        | Appointment History   | /app/appointments/history  |