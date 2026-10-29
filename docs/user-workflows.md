# User workflows — roles, actions, and explanations

These diagrams present the application workflows as connected action nodes: sign in, choose a task, provide the required information, and follow the result to the next step. Each diagram describes the current application, not every requirement in the station business brief.

## How to read the diagrams

- **Rounded nodes** are entry or exit points.
- **Rectangular nodes** are pages or actions.
- **Diamond nodes** are decisions or validation checks.
- **Red nodes and dotted connections** represent restricted or unavailable actions.
- A path returning to a previous node means the user should correct the data or continue working before proceeding.

The Playwright workflow suite checks role-based page access, logout, and safe interactions that do not submit or finalize transactions. See [workflows.spec.ts](../server/e2e/workflows.spec.ts) and run it with `npm --prefix server run test:e2e`. Operator-specific API/UI scenarios are in [operator-actions.spec.ts](../server/e2e/operator-actions.spec.ts); the manual Operator checklist is [operator-manual-test-checklist.md](./operator-manual-test-checklist.md).

## Admin — configure, operate, and close the station day

Admin has access to station configuration, user and team management, operational transactions, reporting, daily close, audit logs, and settings.

```mermaid
%%{init: {"theme":"dark","flowchart":{"curve":"basis","nodeSpacing":36,"rankSpacing":48}}}%%
flowchart LR
    A([Login]) --> B{Credentials valid?}
    B -- No --> A
    B -- Yes --> C[Dashboard]
    C --> D{Choose workflow}

    D --> S[Station setup]
    S --> S1[Manage stations, pumps,<br/>tanks and fuel products]
    S1 --> D

    D --> U[People and teams]
    U --> U1[Create users and assign roles]
    U1 --> U2[Create teams, choose station<br/>and leader, assign members]
    U2 --> D

    D --> O[Shift operations]
    O --> O1[Open shift and assign team]
    O1 --> O2[Enter closing indexes<br/>and review calculated sales]
    O2 --> O3[Enter payment totals]
    O3 --> O4{Reconciled?}
    O4 -- No: review difference --> O2
    O4 -- Yes --> O5[Close shift and roll indexes forward]
    O5 --> D

    D --> T[Other sales]
    T --> T1[POS: sell products]
    T --> T2[Services: record service sale]
    T1 --> D
    T2 --> D

    D --> F[Purchases and finance]
    F --> F1[Manage purchases, suppliers<br/>and purchase orders]
    F --> F2[Record and review expenses]
    F --> F3[Manage customers and credit]
    F --> F4[Review tank gauging<br/>and Kif returns]
    F1 --> D
    F2 --> D
    F3 --> D
    F4 --> D

    D --> R[Reports and daily close]
    R --> R1[Review sales, analytics,<br/>audit and credit reports]
    R1 --> R2{Ready to close day?}
    R2 -- No: investigate --> O
    R2 -- Yes --> R3[Review and finalize daily close]
    R3 --> R4[Review audit logs<br/>and update settings]
    R4 --> E([Logout])
    D -.-> E

    classDef start fill:#174d3c,stroke:#39b982,color:#fff
    classDef action fill:#202d3b,stroke:#52677d,color:#fff
    classDef decision fill:#634a1c,stroke:#e5ad43,color:#fff
    classDef finish fill:#174d3c,stroke:#39b982,color:#fff
    class A,E start
    class B,D,O4,R2 decision
    class C,S,S1,U,U1,U2,O,O1,O2,O3,O5,T,T1,T2,F,F1,F2,F3,F4,R,R1,R3,R4 action
```

### Admin workflow explanation

1. **Sign in and dashboard:** authenticate with the Admin account and use the dashboard to choose an operational area.
2. **Prepare the station:** configure the station and its pumps, tanks, and products before opening shifts.
3. **Set up people:** create user accounts with the appropriate roles, then create teams and assign each team its station, leader, and members.
4. **Run a shift:** open the shift for a station and team, enter pump closing indexes, check calculated volumes and values, enter collected payments, reconcile any difference, and close the shift. Closing rolls the indexes forward.
5. **Record non-shift sales:** use POS for product sales and Services for service transactions. These are separate flows from a pump reading.
6. **Manage finance and stock records:** maintain purchases, suppliers, purchase orders, expenses, customers/credit, tank gauging, and Kif returns.
7. **Review and close the day:** examine the reports and outstanding differences before completing daily close. Finish with audit logs or settings as needed.

## Manager — manage station operations and review performance

Manager can configure station equipment and products, manage teams, operate and close shifts, manage purchases and expenses, and use operational reports and daily close. User administration is not included in this role's workflow.

```mermaid
%%{init: {"theme":"dark","flowchart":{"curve":"basis","nodeSpacing":36,"rankSpacing":48}}}%%
flowchart LR
    A([Login]) --> B{Credentials valid?}
    B -- No --> A
    B -- Yes --> C[Dashboard]
    C --> D{Choose task}

    D --> S[Station configuration]
    S --> S1[Update pumps, tanks<br/>and products]
    S1 --> D

    D --> U[Team management]
    U --> U1[Create teams and assign<br/>station, leader and members]
    U1 --> D

    D --> O[Shift management]
    O --> O1[Open shift for a team]
    O1 --> O2[Enter readings<br/>and payment totals]
    O2 --> O3{Balanced?}
    O3 -- No: correct entries --> O2
    O3 -- Yes --> O4[Close shift]
    O4 --> D

    D --> V[POS and Services]
    V --> V1[Record transaction<br/>with payment method]
    V1 --> D

    D --> F[Purchases and finance]
    F --> F1[Purchases, orders,<br/>suppliers and expenses]
    F --> F2[Customers and credit]
    F --> F3[Tank gauging<br/>and Kif returns]
    F1 --> D
    F2 --> D
    F3 --> D

    D --> R[Reports and daily close]
    R --> R1[Review sales, analytics,<br/>audit and credit aging]
    R1 --> R2{Shifts ready<br/>for daily close?}
    R2 -- No --> O
    R2 -- Yes --> R3[Review daily summary<br/>and finalize close]
    R3 --> R4[View settings]
    R4 --> E([Logout])

    D -. "User administration unavailable" .-> X[Admin]
    D -. "Settings are read-only" .-> Y[No configuration changes]

    classDef start fill:#174d3c,stroke:#39b982,color:#fff
    classDef action fill:#202d3b,stroke:#52677d,color:#fff
    classDef decision fill:#634a1c,stroke:#e5ad43,color:#fff
    classDef blocked fill:#633737,stroke:#c65a5a,color:#fff
    classDef finish fill:#174d3c,stroke:#39b982,color:#fff
    class A,E start
    class B,D,O3,R2 decision
    class C,S,S1,U,U1,O,O1,O2,O4,V,V1,F,F1,F2,F3,R,R1,R3,R4 action
    class X,Y blocked
```

### Manager workflow explanation

1. **Configure station operations:** maintain equipment and products; create teams and assign their station, leader, and members.
2. **Operate shifts:** open a shift, update readings and payments, resolve reconciliation differences, then close the shift.
3. **Record sales:** use POS or Services for transactions outside the shift close workflow.
4. **Manage purchasing and station finance:** work with purchase records/orders, suppliers, expenses, customers, and credit. Review tank gauging and Kif-return records.
5. **Review the day:** use reports to identify incomplete shifts or mismatches before daily close.
6. **Know the limits:** user-management routes are not available to Manager; settings are view-only.

## Supervisor — run shifts and monitor station activity

Supervisor can operate and close shifts, record sales, review operational records and reports, complete daily close, and record Kif returns or tank gauging. Team and settings pages are view-only.

```mermaid
%%{init: {"theme":"dark","flowchart":{"curve":"basis","nodeSpacing":36,"rankSpacing":48}}}%%
flowchart LR
    A([Login]) --> B{Credentials valid?}
    B -- No --> A
    B -- Yes --> C[Dashboard]
    C --> D{Choose task}

    D --> S[Review station setup]
    S --> S1[View pumps, tanks<br/>and products]
    S1 --> D

    D --> O[Shift operations]
    O --> O1[Open or select shift]
    O1 --> O2[Enter readings,<br/>sales and payments]
    O2 --> O3{Balanced?}
    O3 -- No: investigate --> O2
    O3 -- Yes --> O4[Close shift]
    O4 --> D

    D --> V[POS and Services]
    V --> V1[Record sale<br/>and payment method]
    V1 --> D

    D --> F[Review records]
    F --> F1[View purchases, expenses,<br/>suppliers and teams]
    F --> F2[Create Kif-return record<br/>or tank gauging]
    F1 --> D
    F2 --> D

    D --> R[Reports and daily close]
    R --> R1[Review sales, analytics,<br/>audit and credit aging]
    R1 --> R2{Day ready<br/>to close?}
    R2 -- No --> O
    R2 -- Yes --> R3[Review summary<br/>and finalize daily close]
    R3 --> E([Logout])

    D -. "Manage team membership unavailable" .-> X[Admin / Manager]
    D -. "Settings are view-only" .-> Y[No configuration changes]

    classDef start fill:#174d3c,stroke:#39b982,color:#fff
    classDef action fill:#202d3b,stroke:#52677d,color:#fff
    classDef decision fill:#634a1c,stroke:#e5ad43,color:#fff
    classDef blocked fill:#633737,stroke:#c65a5a,color:#fff
    classDef finish fill:#174d3c,stroke:#39b982,color:#fff
    class A,E start
    class B,D,O3,R2 decision
    class C,S,S1,O,O1,O2,O4,V,V1,F,F1,F2,R,R1,R3 action
    class X,Y blocked
```

### Supervisor workflow explanation

1. **Review operational status:** inspect station equipment, products, purchases, expenses, suppliers, and team rosters.
2. **Run shifts:** open or select the relevant shift, record pump readings and payment totals, reconcile differences, and close it.
3. **Record transactions:** use POS or Services for their respective sales workflows.
4. **Record stock-control actions:** create Kif-return and tank-gauging records using the dedicated pages.
5. **Monitor and close the day:** use reports to review sales, credit, and audit information, then complete daily close when ready.
6. **Know the limits:** Supervisor can view teams but cannot edit team membership; settings are read-only. User administration, customers UI, and purchase orders are not available through the Supervisor pages.

## Operator — work on assigned shifts and record sales

The Operator workflow is narrower and shift assignment is enforced by the API. An Operator sees and can open the detail page only for shifts where their account appears in the shift's assigned employees. When an Operator who leads an active team opens a shift, the leader and all team members are assigned automatically. Team members cannot open shifts themselves.

```mermaid
%%{init: {"theme":"dark","flowchart":{"curve":"basis","nodeSpacing":36,"rankSpacing":48}}}%%
flowchart LR
    A([Login]) --> B{Credentials valid?}
    B -- No --> A
    B -- Yes --> C[Dashboard]
    C --> D{Choose operation}

    D --> O[Assigned shifts]
    O --> O1[View only shifts<br/>where you are assigned]
    O1 --> O2{Assigned to<br/>this shift?}
    O2 -- No --> X[Access denied]
    O2 -- Yes --> O3[Open shift details]
    O3 --> O4[Update readings<br/>and payments while open]
    O4 --> O5[Review calculated volume<br/>and balance]
    O5 --> O3

    O -. "Team leader only" .-> L{Lead an active team?}
    L -- Yes --> L1[Select your team<br/>and open a shift]
    L1 --> O3
    L -- No --> M[Continue with<br/>assigned shifts]
    M --> O1
    O3 -. "Shift close unavailable" .-> Y[Admin / Manager / Supervisor]

    D --> P[POS]
    P --> P1[Select product, quantity<br/>and payment method]
    P1 --> P2[Submit sale]
    P2 --> D

    D --> S[Services]
    S --> S1[Select service<br/>and record sale]
    S1 --> D

    D --> R[Read-only records]
    R --> R1[View station, equipment,<br/>products, purchases<br/>and expenses]
    R1 --> D

    D -. "Reports and management pages restricted" .-> Z[Access denied]
    Z --> C
    D --> E([Logout])

    classDef start fill:#174d3c,stroke:#39b982,color:#fff
    classDef action fill:#202d3b,stroke:#52677d,color:#fff
    classDef decision fill:#634a1c,stroke:#e5ad43,color:#fff
    classDef blocked fill:#633737,stroke:#c65a5a,color:#fff
    classDef finish fill:#174d3c,stroke:#39b982,color:#fff
    class A,E start
    class B,D,O2,L decision
    class C,O,O1,O3,O4,O5,L1,M,P,P1,P2,S,S1,R,R1 action
    class X,Y,Z blocked
```

### Operator workflow explanation

1. **Sign in:** after authentication, use the dashboard and the operational pages allowed to the Operator role.
2. **Work only on assigned shifts:** the shifts list is filtered to shifts that explicitly contain the Operator in `employees`. The same assignment check protects direct API access to shift details and updates.
3. **Open a shift as team leader:** an Operator who is the leader of an active team can choose that team and open a shift. The shift is created with the leader and team members in its employee assignment. A regular member cannot open one.
4. **Update an assigned shift:** while the shift is open, enter closing indexes and payment totals, then check the recalculated sales and balance. Shift closure is reserved for Admin, Manager, and Supervisor.
5. **Record sales separately:** POS is for product checkout; Services is for service sales. Shift-linked fuel sales are entered from a shift detail when available.
6. **Consult records:** station, equipment, products, purchases, and expenses are read-only for Operator.
7. **Respect restricted routes:** reports, daily close, Kif returns, tank-gauging page, customer management, team management, and user/settings management are not Operator pages.

## Role access summary

| Workflow area | Admin | Manager | Supervisor | Operator |
|---|---|---|---|---|
| Stations, pumps, tanks, products | Manage | Manage | View | View |
| Users | Manage | View | Restricted | Restricted |
| Teams | Manage | Manage | View | Own active led teams only for shift opening |
| Shifts | View, open, update, close, reopen | View, open, update, close | View, open, update, close | Assigned shifts only; team leader can open own team; update readings/payments |
| POS and Services | Record sales | Record sales | Record sales | Record sales |
| Purchases and expenses | Manage | Manage | View | View |
| Suppliers and purchase orders | Manage | Manage | Supplier view; purchase orders restricted | Restricted |
| Customers / credit | Manage | Manage | Customer API permission; UI page restricted | Restricted |
| Reports and daily close | Access | Access | Access | Restricted |
| Kif returns and tank gauging | Manage | Manage | Manage | Restricted |
| Settings and audit logs | Manage / view | View | Settings view; audit page restricted | Restricted |

### Important workflow distinctions

- **A team leader's role is configurable:** the team form selects a user as leader and does not restrict leaders to a specific role. The Operator-specific shift-opening rule applies only when the logged-in user has the Operator role; the user must lead the chosen team.
- **Shift membership means explicit assignment:** opening or leading a team does not grant blanket access to all shifts. A shift is visible to an Operator only when their user ID is included in that shift's `employees`.
- **Shift close versus daily close:** shift closure finalizes that shift and rolls pump indexes forward; daily close is a separate management/supervision workflow.
- **POS versus shift sale:** POS transactions are separate sales. Use the shift detail workflow when a sale must be linked to a pump and a shift.
- **Access is enforced on both sides:** hidden controls improve usability, while server routes and handlers enforce the actual role and shift-membership rules.
