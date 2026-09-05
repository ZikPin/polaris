# polaris
Study planner

# Folder structure
```
study-planner/
│
├── docs/                            # V-model LEFT side
│   ├── VISION.md
│   ├── STAKEHOLDER_REQUIREMENTS.md
│   ├── SYSTEM_REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   └── MODULE_DESIGN.md
│
├── tests/                           # V-model RIGHT side
│   ├── plans/                       # Test plans (written alongside docs)
│   │   ├── acceptance-test-plan.md
│   │   ├── system-test-plan.md
│   │   ├── integration-test-plan.md
│   │   └── unit-test-plan.md
│   ├── acceptance/                  # e2e — Playwright
│   ├── system/                      # API-level full-flow tests
│   ├── integration/                 # Route + DB round-trips
│   └── unit/
│       ├── backend/                 # mirrors backend/app/
│       └── frontend/                # mirrors frontend/src/app/
│
├── backend/                         # Flask — pure source
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── migrations/
│   ├── config.py
│   ├── requirements.txt
│   └── run.py
│
├── frontend/                        # Angular — pure source
│   └── src/app/
│       ├── core/                    # services, interceptors
│       ├── shared/                  # reusable components
│       ├── models/                  # TS interfaces
│       └── features/
│           ├── semesters/
│           ├── courses/
│           ├── lectures/
│           └── assignments/
│
├── docker-compose.yml
├── .env.example
└── README.md
```