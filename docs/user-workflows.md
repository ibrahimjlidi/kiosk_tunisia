# User workflows

These diagrams map the current application actions by role. They use Mermaid flowcharts so the nodes and connections render in GitHub and in Markdown previews that support Mermaid.

Playwright smoke tests cover sign-in/out, role-based route access, denied routes, safe shift and POS interactions, role-specific purchase/expense controls, and opening/cancelling Kif-return, user, station, and daily-close screens. The suite is in [workflows.spec.ts](../server/e2e/workflows.spec.ts); run it using `npm --prefix server run test:e2e`. It uses demo accounts and never submits a data-changing form or finalizes a shift/day.

## Admin

Admin can manage the full station setup, people, operations, finance, and application settings.

```mermaid
%%{init: {"theme":"dark","flowchart":{"curve":"basis"}}}%%
flowchart LR
    A([Login]) --> B{Credentials valid?}
    B -- No --> A
    B -- Yes --> C[Dashboard]
    C --> D{Choose work area}

    D --> E[Stations, pumps, tanks<br/>and products]
    E --> E1[Create or update station setup]
    E1 --> O

    D --> F[Users and teams]
    F --> F1[Create users<br/>assign roles and status]
    F1 --> F2[Create and maintain teams]
    F2 --> O

    D --> G[Operations]
    G --> G1[Open shift<br/>morning / afternoon / night]
    G1 --> G2[Record pump readings,<br/>sales and payments]
    G2 --> G3[Reconcile and close shift]
    G3 --> O
    G --> G4[POS: sell fuel or shop products]
    G4 --> G5[Choose payment and<br/>complete sale]
    G5 --> O
    G --> G6[Record a service sale]
    G6 --> O

    D --> H[Purchases, suppliers,<br/>expenses and customers]
    H --> H1[Manage purchase records<br/>and purchase orders]
    H1 --> O
    H --> H2[Record expenses]
    H2 --> O
    H --> H3[Manage suppliers<br/>and customer credit]
    H3 --> O
    H --> H4[Review tank gauging<br/>and Kif returns]
    H4 --> O

    O[Review sales, analytics,<br/>audit and credit reports]
    O --> P{Day reconciled?}
    P -- No: investigate --> G
    P -- Yes --> Q[Finalize daily close]
    Q --> R[Review audit logs<br/>and manage settings]
    R --> S([Log out])

    classDef start fill:#174d3c,stroke:#39b982,color:#fff
    classDef action fill:#202d3b,stroke:#52677d,color:#fff
    classDef decision fill:#634a1c,stroke:#e5ad43,color:#fff
    classDef finish fill:#174d3c,stroke:#39b982,color:#fff
    class A,S start
    class B,D,P decision
    class C,E,E1,F,F1,F2,G,G1,G2,G3,G4,G5,G6,H,H1,H2,H3,H4,O,Q,R action
```

## Manager

Manager follows the station operating and review workflow, including user and supplier management. Settings are read-only for this role.

```mermaid
%%{init: {"theme":"dark","flowchart":{"curve":"basis"}}}%%
flowchart LR
    A([Login]) --> B{Credentials valid?}
    B -- No --> A
    B -- Yes --> C[Dashboard]
    C --> D{Choose task}

    D --> E[Manage station setup<br/>pumps, tanks and products]
    E --> O
    D --> F[Manage users, roles<br/>and teams]
    F --> O

    D --> G[Open and run a shift]
    G --> G1[Enter pump readings<br/>and payment totals]
    G1 --> G2{Balanced?}
    G2 -- No --> G1
    G2 -- Yes --> G3[Close and lock shift]
    G3 --> O

    D --> H[POS and services]
    H --> H1[Record sales<br/>and payment method]
    H1 --> O

    D --> I[Purchases, purchase orders,<br/>expenses, suppliers, customers]
    I --> O
    D --> J[Tank gauging and<br/>Kif returns]
    J --> O

    O[Review sales, analytics,<br/>audit and credit aging]
    O --> K{All shifts closed<br/>and reconciled?}
    K -- No --> G
    K -- Yes --> L[Review summary and<br/>finalize daily close]
    L --> M[Review audit logs<br/>and view settings]
    M --> N([Log out])

    classDef start fill:#174d3c,stroke:#39b982,color:#fff
    classDef action fill:#202d3b,stroke:#52677d,color:#fff
    classDef decision fill:#634a1c,stroke:#e5ad43,color:#fff
    classDef finish fill:#174d3c,stroke:#39b982,color:#fff
    class A,N start
    class B,D,G2,K decision
    class C,E,F,G,G1,G3,H,H1,I,J,O,L,M action
```

## Supervisor

Supervisor focuses on operational oversight, shift reconciliation, daily close, and operational reports.

```mermaid
%%{init: {"theme":"dark","flowchart":{"curve":"basis"}}}%%
flowchart LR
    A([Login]) --> B{Credentials valid?}
    B -- No --> A
    B -- Yes --> C[Dashboard]
    C --> D{Choose task}

    D --> E[Review station, pumps,<br/>tanks and products]
    E --> O
    D --> F[Open or monitor shifts]
    F --> F1[Update readings,<br/>record sales and payments]
    F1 --> F2{Balanced?}
    F2 -- No --> F1
    F2 -- Yes --> F3[Close and lock shift]
    F3 --> O

    D --> G[POS and services]
    G --> G1[Record sale<br/>and payment method]
    G1 --> O

    D --> H[Review purchases,<br/>expenses and suppliers]
    H --> O
    D --> I[Review teams and settings]
    I --> O
    D --> J[Manage Kif returns<br/>and tank gauging]
    J --> O

    O[Sales, analytics,<br/>audit summary and credit aging]
    O --> K{All shifts closed<br/>and totals reconciled?}
    K -- No --> F
    K -- Yes --> L[Review daily summary<br/>and finalize close]
    L --> M([Log out])

    classDef start fill:#174d3c,stroke:#39b982,color:#fff
    classDef action fill:#202d3b,stroke:#52677d,color:#fff
    classDef decision fill:#634a1c,stroke:#e5ad43,color:#fff
    classDef finish fill:#174d3c,stroke:#39b982,color:#fff
    class A,M start
    class B,D,F2,K decision
    class C,E,F,F1,F3,G,G1,H,I,J,O,L action
```

## Operator

Operators can consult operational data and record POS/service sales. Team leaders can open shifts for their own teams; every Operator sees only shifts where they are explicitly listed as an assigned employee and can update readings and payments while an assigned shift is open. Shift closure remains restricted to Admin, Manager, and Supervisor. See the [Operator manual test checklist](./operator-manual-test-checklist.md) for remaining limitations.

```mermaid
%%{init: {"theme":"dark","flowchart":{"curve":"basis"}}}%%
flowchart LR
    A([Login]) --> B{Credentials valid?}
    B -- No --> A
    B -- Yes --> C[Dashboard]
    C --> D[Review station,<br/>equipment and products]
    D --> E{Choose operation}

    E --> F[View shifts and details]
    F --> F1[Update readings and payments<br/>on assigned open shifts]
    F1 --> H([Log out])
    F --> F2{Team leader?}
    F2 -- Yes --> F3[Select own team<br/>and open a shift]
    F2 -- No --> F4[View/update assigned shifts only]
    F3 --> H
    F4 --> H
    F -. "Shift close is restricted" .-> Y[Admin / Manager / Supervisor]

    E --> G[POS or Services]
    G --> G1[Select items or service<br/>and payment method]
    G1 --> G2[Complete sale]
    G2 --> H

    E --> I[View purchases<br/>and expenses]
    I --> H

    E -. "Reports link is shown,<br/>but route is restricted" .-> J[Access denied]
    J --> C

    classDef start fill:#174d3c,stroke:#39b982,color:#fff
    classDef action fill:#202d3b,stroke:#52677d,color:#fff
    classDef blocked fill:#633737,stroke:#c65a5a,color:#fff
    classDef decision fill:#634a1c,stroke:#e5ad43,color:#fff
    classDef finish fill:#174d3c,stroke:#39b982,color:#fff
    class A,H start
    class B,E decision
    class C,D,F,F1,G,G1,G2,I action
    class J blocked
    class Y blocked
```

## Access notes

- **Reports:** the Operator navigation currently shows a Reports link, but report routes only allow Admin, Manager, and Supervisor.
- **Customers:** customer pages are restricted to Admin and Manager, even though Supervisor has a customer-read permission in the role map.
- **Teams:** Supervisor can view teams but cannot create, update, or delete them. The UI hides team write controls for that role.
- **Settings:** Admin can manage settings. Manager and Supervisor have read permission only.
- **Purchase Orders:** available to Admin and Manager; separate from the Purchases page.
- **Tank Gauging:** available to Admin, Manager, and Supervisor.
- **Purchases and Expenses:** all four roles can view these records; only Admin and Manager can create purchases or manage expenses.
- **POS versus shift sales:** POS checkout is a separate workflow. To associate a fuel sale with a pump and shift, use **Record Sale** from the shift detail page.
- **Shift close:** closing locks that shift and rolls pump indexes forward. Complete and save readings/payments before closing.
- **Operator shift access:** Operators only see shifts where their user is explicitly listed in the shift's employees. Opening a shift as leader automatically lists the leader and all team members as assigned employees. Other team members cannot open shifts. Assigned members may update readings and payments on open shifts. Closure remains restricted to Admin, Manager, and Supervisor.
