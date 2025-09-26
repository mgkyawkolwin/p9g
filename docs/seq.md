sequenceDiagram
    participant MB as Main
    participant DB as Develop
    participant PR as Pull Request
    participant FB as Feature Branchs
    participant PB as Patch Branchs

    Note over MB, DB: Version 1.0.0 Release
    MB->>DB: Create Develop Branch
    activate DB
    MB->>PB: Create Patch Branch
    activate PB
    PB->>PB: Commit Changes To The Branch 
    PB->>PR: Create Pull Request
    deactivate PB
    PR->>DB: Merge to develop
    PR->>MB: Merge to main
    deactivate DB
    Note over MB,DB: Version 1.0.1 Patch Release

    MB->>DB: Create Develop Branch
    activate DB
    MB->>FB: Create Feature A Branch
    activate FB
    FB->>FB: Commit Changes To The Branch
    FB->>PR: Create Pull Request
    deactivate FB
    PR->>DB: Merge to devlop
    DB->>MB: Merge to main
    deactivate DB

    Note over MB,DB: Version 1.1.1 Minor Release

    MB->>DB: Create Develop Branch
    activate DB
    MB->>FB: Create Feature C Branch
    activate FB
    FB->>FB: Commit Changes To The Branch
    FB->>PR: Create Pull Request
    deactivate FB
    PR->>DB: Merge to devlop

    MB->>FB: Create Feature D Branch
    activate FB
    FB->>FB: Commit Changes To The Branch
    FB->>PR: Create Pull Request
    deactivate FB
    PR->>DB: Merge to devlop

    DB->>MB: Merge to main
    deactivate DB

    Note over MB,DB: Version 2.0.0 Major Release

