# UnibenServices Architecture & Data Flow

```mermaid
%%{init: { 'theme': 'default', 'themeVariables': { 'fontSize': '28px', 'nodeTextSize': '28px', 'primaryColor': '#6366f1', 'primaryBorderColor': '#1e293b', 'primaryTextColor': '#1e293b', 'secondaryColor': '#f3f4f6', 'secondaryBorderColor': '#6366f1', 'secondaryTextColor': '#1e293b', 'tertiaryColor': '#fff', 'tertiaryBorderColor': '#6366f1', 'tertiaryTextColor': '#1e293b', 'edgeLabelBackground':'#fff', 'clusterBkg':'#f3f4f6', 'clusterBorder':'#6366f1', 'fontFamily':'Inter, sans-serif' }, 'flowchart': { 'nodeSpacing': 160, 'rankSpacing': 160, 'direction': 'TB' } } }%%
graph TD
  %% Frontend
  A["User (Student/Provider/Admin)\nBrowser"]
  A -->|"HTTP/HTTPS"| B["Next.js 15+ App\n(apps/web)"]
  B -->|"API Calls (REST/RPC)"| C["Hono API\n(packages/api)"]
  B -->|"Auth (better-auth)"| D["Auth Package\n(packages/auth)"]
  B -->|"File Uploads"| E["Supabase Storage"]
  B -->|"Payments"| F["Payments Package"]
  B -->|"Email"| G["Mail Package"]

  %% API Layer
  C -->|"DB Access"| H["Prisma ORM\n(packages/database)"]
  C -->|"File Storage"| E
  C -->|"Payments"| F
  C -->|"Auth"| D
  C -->|"Logging"| I["Logs Package"]
  C -->|"i18n"| J["i18n Package"]

  %% Payments
  F -->|"Paystack API"| K["Paystack"]
  F -->|"Flutterwave API"| L["Flutterwave"]

  %% Email
  G -->|"Resend API"| M["Resend"]

  %% Database
  H -->|"SQL"| N["Supabase PostgreSQL"]

  %% Storage
  E -->|"S3 API"| O["Supabase Storage Buckets"]

  %% Data Flow
  subgraph "Data Flow"
    A-->|"Form Submit"|B-->|"API Request"|C-->|"DB Query"|H-->|"Data"|N
    C-->|"Upload URL"|E-->|"File"|O
    C-->|"Payment"|F-->|"Provider API"|K
    C-->|"Payment"|F-->|"Provider API"|L
    C-->|"Send Email"|G-->|"Provider API"|M
  end

  %% Admin
  A -.->|"Admin Dashboard"| B

  %% Notes
  classDef ext fill:#f9f,stroke:#1e293b,stroke-width:4px,color:#1e293b;
  class K,L,M,N,O ext;

direction TB
```

---

**Legend:**
- **A**: User interacts with the frontend (Next.js app)
- **B**: Next.js app handles UI, calls APIs, manages auth, uploads, payments
- **C**: Hono API layer (REST/RPC endpoints)
- **D**: Authentication (better-auth)
- **E**: Supabase Storage (for files/images)
- **F**: Payments logic (Paystack/Flutterwave)
- **G**: Email logic (Resend)
- **H**: Prisma ORM (DB access)
- **I**: Logging
- **J**: i18n
- **N**: Supabase PostgreSQL (main DB)
- **O**: Supabase Storage Buckets
- **K/L**: Payment Providers
- **M**: Email Provider

This diagram shows the main data flow from the frontend, through the API, to the database, storage, payments, and email providers. Each package is modularized for separation of concerns and scalability.
