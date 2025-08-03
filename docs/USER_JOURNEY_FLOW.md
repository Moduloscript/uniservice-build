# UnibenServices - Complete User Journey Flow

## Holistic User Experience Flow (All Roles)

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                UNIBENSERVICES PLATFORM                                 │
│                              Complete User Journey Flow                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────┐
                                    │   LANDING PAGE  │
                                    │   (Public)      │
                                    └─────────┬───────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
                        ▼                     ▼                     ▼
                ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                │   SIGN UP    │    │   SIGN IN    │    │   BROWSE     │
                │              │    │              │    │   SERVICES   │
                └──────┬───────┘    └──────┬───────┘    │  (Guest)     │
                       │                   │            └──────────────┘
                       │                   │
                       └─────────┬─────────┘
                                 │
                                 ▼
                      ┌─────────────────┐
                      │  ROLE SELECTION │
                      │                 │
                      └─────────┬───────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   STUDENT    │    │   PROVIDER   │    │    ADMIN     │
│   JOURNEY    │    │   JOURNEY    │    │   JOURNEY    │
└──────────────┘    └──────────────┘    └──────────────┘

```

## 🎓 STUDENT USER JOURNEY

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 STUDENT JOURNEY                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   SIGN UP   │───▶│ ONBOARDING  │───▶│  PROFILE    │───▶│   BROWSE    │
    │             │    │   WIZARD    │    │  CREATION   │    │  SERVICES   │
    └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                    │
    ┌─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SEARCH &  │───▶│   SELECT    │───▶│   BOOK      │───▶│   PAYMENT   │
│   FILTER    │    │   SERVICE   │    │  SERVICE    │    │  PROCESS    │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
┌─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  BOOKING    │───▶│   ATTEND    │───▶│   REVIEW    │───▶│   REPEAT    │
│ CONFIRMED   │    │   SESSION   │    │  PROVIDER   │    │  JOURNEY    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

DETAILED STUDENT FLOW:
═════════════════════════════════════════════════════════════════════════

1. REGISTRATION & ONBOARDING
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1: Basic Registration                                         │
│  ├─ Email verification                                               │
│  ├─ Password creation                                                │
│  └─ Initial profile setup                                           │
│                                                                     │
│  Step 2: Student Verification                                       │
│  ├─ Matric number verification                                       │
│  ├─ Department selection                                             │
│  ├─ Academic level confirmation                                      │
│  └─ Student ID upload                                                │
│                                                                     │
│  Step 3: Profile Completion                                         │
│  ├─ Profile photo upload                                             │
│  ├─ Academic interests                                               │
│  ├─ Contact preferences                                              │
│  └─ Notification settings                                            │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
2. SERVICE DISCOVERY
┌─────────────────────────────────────────────────────────────────────┐
│  Service Marketplace                                                │
│  ├─ Browse by categories (Academic, Beauty, Tech, etc.)             │
│  ├─ Search by keywords/provider name                                 │
│  ├─ Filter by: Price, Rating, Availability, Location               │
│  ├─ Sort by: Price, Rating, Popularity, Distance                   │
│  └─ View service details and provider profiles                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
3. BOOKING PROCESS
┌─────────────────────────────────────────────────────────────────────┐
│  Service Selection & Booking                                       │
│  ├─ View service details (features, outcomes, provider info)       │
│  ├─ Check real-time availability calendar                          │
│  ├─ Select preferred time slot                                     │
│  ├─ Add booking notes/requirements                                  │
│  ├─ Review booking summary                                          │
│  └─ Proceed to payment                                              │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
4. PAYMENT & CONFIRMATION
┌─────────────────────────────────────────────────────────────────────┐
│  Payment Processing                                                 │
│  ├─ Select payment method (Paystack/Flutterwave)                   │
│  ├─ Enter payment details                                           │
│  ├─ Process secure payment                                          │
│  ├─ Receive booking confirmation                                    │
│  └─ Get provider contact information                                │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
5. SERVICE EXPERIENCE
┌─────────────────────────────────────────────────────────────────────┐
│  Pre-Service                                                        │
│  ├─ Receive booking reminders (24h, 2h before)                     │
│  ├─ Provider communication/preparation instructions                  │
│  ├─ Location/meeting details confirmation                           │
│  └─ Last-minute booking modifications (if needed)                   │
│                                                                     │
│  During Service                                                     │
│  ├─ Attend scheduled session                                        │
│  ├─ Receive agreed-upon service                                     │
│  └─ Real-time support access if needed                             │
│                                                                     │
│  Post-Service                                                       │
│  ├─ Service completion notification                                 │
│  ├─ Payment finalization (if escrow)                               │
│  ├─ Receive service materials/follow-up                            │
│  └─ Review and rating prompt                                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
6. ONGOING RELATIONSHIP
┌─────────────────────────────────────────────────────────────────────┐
│  Post-Service Engagement                                            │
│  ├─ Submit service review and rating                                │
│  ├─ Save provider to favorites                                      │
│  ├─ Book future sessions with same provider                         │
│  ├─ Discover related services                                       │
│  └─ Share recommendations with friends                              │
│                                                                     │
│  Account Management                                                 │
│  ├─ View booking history and receipts                               │
│  ├─ Manage payment methods                                          │
│  ├─ Update profile and preferences                                  │
│  ├─ Track spending and service usage                                │
│  └─ Access customer support                                         │
└─────────────────────────────────────────────────────────────────────┘

```

## 👨‍🏫 PROVIDER USER JOURNEY

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                PROVIDER JOURNEY                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   SIGN UP   │───▶│ ONBOARDING  │───▶│ DOCUMENT    │───▶│    ADMIN    │
    │             │    │   WIZARD    │    │ SUBMISSION  │    │ VERIFICATION│
    └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                    │
    ┌─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  APPROVAL   │───▶│   CREATE    │───▶│    SET      │───▶│   MANAGE    │
│  RECEIVED   │    │  SERVICES   │    │ AVAILABILITY│    │  BOOKINGS   │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
┌─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DELIVER   │───▶│   RECEIVE   │───▶│   REVIEW    │───▶│    GROW     │
│   SERVICE   │    │   PAYMENT   │    │  STUDENTS   │    │  BUSINESS   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

DETAILED PROVIDER FLOW:
═════════════════════════════════════════════════════════════════════════

1. REGISTRATION & VERIFICATION
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1: Provider Registration                                      │
│  ├─ Complete basic profile information                               │
│  ├─ Select provider category/specialization                         │
│  ├─ Provide contact and professional details                        │
│  └─ Upload professional profile photo                               │
│                                                                     │
│  Step 2: Document Verification                                      │
│  ├─ Upload student ID or staff ID                                   │
│  ├─ Upload skill certifications/portfolios                          │
│  ├─ Provide academic transcripts (if applicable)                    │
│  ├─ Submit professional references                                  │
│  └─ Complete skills assessment/interview                            │
│                                                                     │
│  Step 3: Admin Review Process                                       │
│  ├─ Admin reviews submitted documents                               │
│  ├─ Background verification checks                                  │
│  ├─ Skills validation process                                       │
│  └─ Approval/rejection notification                                 │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
2. SERVICE SETUP & MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│  Service Creation                                                   │
│  ├─ Create service listings with detailed descriptions              │
│  ├─ Set service pricing and duration                               │
│  ├─ Upload service images and portfolios                           │
│  ├─ Define service features and inclusions                         │
│  ├─ Set learning outcomes and expectations                         │
│  └─ Configure service level and capacity                           │
│                                                                     │
│  Availability Management                                            │
│  ├─ Set weekly availability schedule                               │
│  ├─ Define available time slots                                    │
│  ├─ Set booking capacity per slot                                  │
│  ├─ Manage holiday/unavailable periods                             │
│  └─ Update real-time availability status                           │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
3. BOOKING MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│  Incoming Booking Requests                                          │
│  ├─ Receive real-time booking notifications                         │
│  ├─ Review student booking details and requirements                 │
│  ├─ Accept or decline booking requests                              │
│  ├─ Communicate with students pre-service                          │
│  └─ Confirm service details and logistics                          │
│                                                                     │
│  Booking Dashboard                                                  │
│  ├─ View upcoming bookings calendar                                 │
│  ├─ Track booking statuses and payments                            │
│  ├─ Manage booking modifications/cancellations                     │
│  ├─ Access student contact information                             │
│  └─ Generate booking reports and analytics                         │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
4. SERVICE DELIVERY
┌─────────────────────────────────────────────────────────────────────┐
│  Pre-Service Preparation                                            │
│  ├─ Prepare service materials and resources                         │
│  ├─ Send preparation instructions to students                       │
│  ├─ Confirm meeting location/virtual link                          │
│  └─ Set up service environment                                      │
│                                                                     │
│  Service Execution                                                  │
│  ├─ Deliver agreed-upon service professionally                      │
│  ├─ Maintain quality standards and outcomes                         │
│  ├─ Document service progress/completion                            │
│  └─ Handle any service-related issues                              │
│                                                                     │
│  Service Completion                                                 │
│  ├─ Mark service as completed in system                            │
│  ├─ Provide follow-up materials if applicable                      │
│  ├─ Request service feedback from student                          │
│  └─ Update availability for future bookings                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
5. PAYMENT & FINANCIAL MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│  Payment Processing                                                 │
│  ├─ Automatic payment release after service completion             │
│  ├─ View payment status and transaction history                    │
│  ├─ Handle payment disputes (if any)                               │
│  └─ Track earnings and commission deductions                       │
│                                                                     │
│  Financial Dashboard                                                │
│  ├─ Monitor monthly/weekly earnings                                 │
│  ├─ View payout schedules and methods                              │
│  ├─ Generate financial reports and tax documents                   │
│  ├─ Manage banking/payment account details                         │
│  └─ Track platform fees and commissions                           │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
6. GROWTH & OPTIMIZATION
┌─────────────────────────────────────────────────────────────────────┐
│  Performance Analytics                                              │
│  ├─ View service performance metrics and ratings                    │
│  ├─ Analyze booking patterns and popular services                   │
│  ├─ Track student retention and repeat bookings                     │
│  ├─ Monitor competitive positioning                                 │
│  └─ Identify opportunities for service expansion                    │
│                                                                     │
│  Profile & Service Optimization                                     │
│  ├─ Update services based on demand and feedback                    │
│  ├─ Enhance service descriptions and pricing                        │
│  ├─ Build portfolio with student testimonials                       │
│  ├─ Participate in platform promotional activities                  │
│  └─ Expand service offerings in new categories                     │
│                                                                     │
│  Community Engagement                                               │
│  ├─ Respond to student reviews and feedback                         │
│  ├─ Participate in provider community forums                        │
│  ├─ Share best practices with other providers                       │
│  ├─ Attend platform training and development sessions              │
│  └─ Build long-term relationships with regular students            │
└─────────────────────────────────────────────────────────────────────┘

```

## 👨‍💼 ADMIN USER JOURNEY

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ADMIN JOURNEY                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │    LOGIN    │───▶│   ADMIN     │───▶│   VERIFY    │───▶│   MANAGE    │
    │             │    │  DASHBOARD  │    │  PROVIDERS  │    │   USERS     │
    └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                    │
    ┌─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   MONITOR   │───▶│   HANDLE    │───▶│  GENERATE   │───▶│   SYSTEM    │
│  PLATFORM   │    │  DISPUTES   │    │   REPORTS   │    │ MAINTENANCE │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

DETAILED ADMIN FLOW:
═════════════════════════════════════════════════════════════════════════

1. ADMIN ACCESS & DASHBOARD
┌─────────────────────────────────────────────────────────────────────┐
│  Admin Authentication                                               │
│  ├─ Secure admin login with 2FA                                     │
│  ├─ Role-based access control verification                          │
│  ├─ Session management and security logging                         │
│  └─ Admin activity audit trail                                      │
│                                                                     │
│  Dashboard Overview                                                 │
│  ├─ Platform usage statistics (users, bookings, revenue)           │
│  ├─ Pending verification requests counter                           │
│  ├─ Recent platform activity feed                                  │
│  ├─ System health and performance metrics                          │
│  ├─ Financial overview and transaction summaries                   │
│  └─ Quick action buttons for common tasks                          │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
2. USER MANAGEMENT & VERIFICATION
┌─────────────────────────────────────────────────────────────────────┐
│  Provider Verification Workflow                                     │
│  ├─ Review pending provider applications                            │
│  ├─ Verify submitted documents and credentials                      │
│  ├─ Conduct background checks and skill assessments                 │
│  ├─ Approve/reject applications with detailed feedback              │
│  ├─ Send verification status notifications                          │
│  └─ Maintain verification audit trail                              │
│                                                                     │
│  User Account Management                                            │
│  ├─ View and manage all user accounts (students/providers)         │
│  ├─ Handle account suspension/activation requests                   │
│  ├─ Reset passwords and manage account issues                      │
│  ├─ Monitor user activity and flag suspicious behavior             │
│  ├─ Manage user roles and permissions                              │
│  └─ Handle account deletion and data privacy requests              │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
3. SERVICE & CONTENT MODERATION
┌─────────────────────────────────────────────────────────────────────┐
│  Service Listing Management                                         │
│  ├─ Review and moderate new service listings                        │
│  ├─ Ensure service content meets platform guidelines               │
│  ├─ Handle inappropriate service content reports                    │
│  ├─ Manage service category organization                            │
│  ├─ Set platform-wide service policies                             │
│  └─ Monitor service quality and standards                          │
│                                                                     │
│  Content Quality Control                                            │
│  ├─ Review user-generated content (reviews, profiles)              │
│  ├─ Handle content violation reports                                │
│  ├─ Maintain platform community guidelines                         │
│  ├─ Moderate user communications and disputes                      │
│  └─ Ensure legal compliance of all content                         │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
4. FINANCIAL & TRANSACTION OVERSIGHT
┌─────────────────────────────────────────────────────────────────────┐
│  Payment System Management                                          │
│  ├─ Monitor all financial transactions                              │
│  ├─ Handle payment disputes and refund requests                     │
│  ├─ Manage platform commission and fee structures                   │
│  ├─ Oversee provider payout processing                             │
│  ├─ Generate financial reports and tax documentation               │
│  └─ Ensure payment security and fraud prevention                   │
│                                                                     │
│  Revenue Analytics                                                  │
│  ├─ Track platform revenue and growth metrics                      │
│  ├─ Analyze booking patterns and seasonal trends                   │
│  ├─ Monitor provider earnings and platform take-rate              │
│  ├─ Generate investor and stakeholder reports                      │
│  └─ Identify revenue optimization opportunities                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
5. PLATFORM OPERATIONS & SUPPORT
┌─────────────────────────────────────────────────────────────────────┐
│  Customer Support Management                                        │
│  ├─ Handle escalated customer support tickets                       │
│  ├─ Manage support team and response protocols                      │
│  ├─ Monitor support metrics (response time, resolution rate)       │
│  ├─ Create and update help documentation/FAQs                      │
│  ├─ Train support staff on platform policies                       │
│  └─ Implement customer feedback improvements                        │
│                                                                     │
│  System Monitoring & Security                                       │
│  ├─ Monitor platform performance and uptime                         │
│  ├─ Oversee security protocols and incident response               │
│  ├─ Manage system updates and maintenance schedules                │
│  ├─ Handle data backup and disaster recovery                       │
│  ├─ Monitor for security threats and vulnerabilities               │
│  └─ Ensure GDPR and data privacy compliance                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
6. STRATEGIC MANAGEMENT & GROWTH
┌─────────────────────────────────────────────────────────────────────┐
│  Platform Analytics & Insights                                      │
│  ├─ Generate comprehensive platform usage reports                   │
│  ├─ Analyze user behavior and engagement patterns                   │
│  ├─ Track key performance indicators (KPIs)                        │
│  ├─ Monitor competitive landscape and market trends                │
│  ├─ Identify growth opportunities and bottlenecks                  │
│  └─ Create data-driven strategic recommendations                    │
│                                                                     │
│  Policy & Compliance Management                                     │
│  ├─ Develop and update platform terms of service                   │
│  ├─ Ensure legal compliance across all jurisdictions               │
│  ├─ Manage partnerships and third-party integrations               │
│  ├─ Oversee marketing and promotional campaigns                     │
│  ├─ Handle public relations and community engagement               │
│  └─ Plan platform expansion and new feature rollouts              │
└─────────────────────────────────────────────────────────────────────┘

```

## 🔄 CROSS-ROLE INTERACTIONS

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            CROSS-ROLE INTERACTION MAP                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

STUDENT ←→ PROVIDER INTERACTIONS:
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────┐  Booking Request   ┌─────────────┐  Service Delivery  ┌─────────────┐
│   STUDENT   │ ═════════════════▶ │   PROVIDER  │ ═════════════════▶ │   STUDENT   │
│             │                    │             │                    │             │
│ • Searches  │◀═════════════════  │ • Reviews   │◀═════════════════  │ • Receives  │
│ • Compares  │  Accept/Decline    │ • Confirms  │   Payment & Review │ • Reviews   │
│ • Books     │                    │ • Delivers  │                    │ • Re-books  │
└─────────────┘                    └─────────────┘                    └─────────────┘

ADMIN ←→ PROVIDER INTERACTIONS:
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────┐  Verification      ┌─────────────┐  Monitoring        ┌─────────────┐
│   PROVIDER  │ ═════════════════▶ │    ADMIN    │ ═════════════════▶ │   PROVIDER  │
│             │                    │             │                    │             │
│ • Applies   │◀═════════════════  │ • Reviews   │◀═════════════════  │ • Complies  │
│ • Submits   │  Approval/Feedback │ • Monitors  │   Support/Guidance │ • Improves  │
│ • Appeals   │                    │ • Supports  │                    │ • Reports   │
└─────────────┘                    └─────────────┘                    └─────────────┘

ADMIN ←→ STUDENT INTERACTIONS:
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────┐  Support Request   ┌─────────────┐  Platform Access   ┌─────────────┐
│   STUDENT   │ ═════════════════▶ │    ADMIN    │ ═════════════════▶ │   STUDENT   │
│             │                    │             │                    │             │
│ • Reports   │◀═════════════════  │ • Resolves  │◀═════════════════  │ • Benefits  │
│ • Appeals   │   Resolution       │ • Maintains │    Service Quality │ • Trusts    │
│ • Feedback  │                    │ • Improves  │                    │ • Engages   │
└─────────────┘                    └─────────────┘                    └─────────────┘

```

## 📊 SYSTEM TOUCHPOINTS & DATA FLOW

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM DATA FLOW                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   DATABASE      │
                              │   (Prisma)      │
                              └─────────┬───────┘
                                        │
                      ┌─────────────────┼─────────────────┐
                      │                 │                 │
                      ▼                 ▼                 ▼
              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
              │   USERS      │  │   SERVICES   │  │   BOOKINGS   │
              │              │  │              │  │              │
              │ • Students   │  │ • Listings   │  │ • Requests   │
              │ • Providers  │  │ • Features   │  │ • Payments   │
              │ • Admins     │  │ • Outcomes   │  │ • Reviews    │
              └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                     │                 │                 │
                     └─────────────────┼─────────────────┘
                                       │
                                       ▼
                           ┌─────────────────┐
                           │   API LAYER     │
                           │   (Hono)        │
                           └─────────┬───────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
                     ▼               ▼               ▼
             ┌──────────────┐┌──────────────┐┌──────────────┐
             │   STUDENT    ││   PROVIDER   ││    ADMIN     │
             │   FRONTEND   ││   FRONTEND   ││   FRONTEND   │
             │              ││              ││              │
             │ • Browse     ││ • Manage     ││ • Monitor    │
             │ • Book       ││ • Schedule   ││ • Verify     │
             │ • Pay        ││ • Deliver    ││ • Analyze    │
             │ • Review     ││ • Earn       ││ • Support    │
             └──────────────┘└──────────────┘└──────────────┘

NOTIFICATION SYSTEM:
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   EMAIL     │    │    SMS      │    │   IN-APP    │    │    PUSH     │
│             │    │             │    │             │    │             │
│ • Booking   │    │ • Reminders │    │ • Real-time │    │ • Critical  │
│ • Receipts  │    │ • Critical  │    │ • Updates   │    │ • Updates   │
│ • Updates   │    │ • Alerts    │    │ • Messages  │    │ • Offers    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

PAYMENT FLOW:
═══════════════════════════════════════════════════════════════════════════════════════════

Student Payment ──▶ Platform Escrow ──▶ Service Delivery ──▶ Provider Payout
     │                    │                      │                    │
     │                    │                      │                    │
     ▼                    ▼                      ▼                    ▼
┌──────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────┐
│ Paystack │      │   Platform   │      │   Service    │      │ Provider │
│   /      │      │  Commission  │      │  Completion  │      │ Earnings │
│Flutter-  │      │   (5-10%)    │      │     Flag     │      │ (90-95%) │
│  wave    │      │              │      │              │      │          │
└──────────┘      └──────────────┘      └──────────────┘      └──────────┘

```

## 🎯 KEY USER JOURNEY METRICS

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           SUCCESS METRICS BY ROLE                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

STUDENT SUCCESS METRICS:
═══════════════════════════════════════════════════════════════════════════════════════════

Registration → First Booking: 
├─ Target: <24 hours
├─ Current: TBD
└─ Optimization: Streamlined onboarding

Booking Completion Rate:
├─ Target: >85%
├─ Current: TBD  
└─ Optimization: Clear expectations, quality providers

Service Satisfaction:
├─ Target: >4.5/5 rating
├─ Current: TBD
└─ Optimization: Provider quality, dispute resolution

Repeat Booking Rate:
├─ Target: >60% within 30 days
├─ Current: TBD
└─ Optimization: Provider relationships, service quality

PROVIDER SUCCESS METRICS:
═══════════════════════════════════════════════════════════════════════════════════════════

Verification → First Booking:
├─ Target: <7 days
├─ Current: TBD
└─ Optimization: Fast verification, profile optimization

Monthly Active Revenue:
├─ Target: ₦50,000+ per provider
├─ Current: TBD
└─ Optimization: Service optimization, demand matching

Booking Acceptance Rate:
├─ Target: >80%
├─ Current: TBD
└─ Optimization: Realistic availability, clear expectations

Provider Rating:
├─ Target: >4.3/5 average
├─ Current: TBD
└─ Optimization: Quality training, feedback loops

ADMIN SUCCESS METRICS:
═══════════════════════════════════════════════════════════════════════════════════════════

Platform Growth:
├─ Target: 20% MoM user growth
├─ Current: TBD
└─ Optimization: Marketing, referrals, quality

Verification Time:
├─ Target: <72 hours
├─ Current: TBD
└─ Optimization: Automated checks, efficient workflows

Dispute Resolution:
├─ Target: <48 hours average
├─ Current: TBD
└─ Optimization: Clear policies, quick escalation

Platform Revenue:
├─ Target: ₦2M+ monthly GMV
├─ Current: TBD
└─ Optimization: Provider success, student retention

```

## 🚀 IMPLEMENTATION PRIORITIES

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION PRIORITY MATRIX                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘

CRITICAL PATH (Week 1-2):
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│     STUDENT PATH        │  │     PROVIDER PATH       │  │      ADMIN PATH         │
│                         │  │                         │  │                         │
│ 1. Service Discovery    │  │ 1. Verification System  │  │ 1. Verification Review  │
│ 2. Booking Process      │  │ 2. Service Creation     │  │ 2. User Management      │
│ 3. Payment Integration  │  │ 3. Availability Mgmt    │  │ 3. Platform Monitoring  │
│ 4. Service Experience   │  │ 4. Booking Management   │  │ 4. Support System       │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘

HIGH PRIORITY (Week 3-4):
═══════════════════════════════════════════════════════════════════════════════════════════

• Real-time notifications across all roles
• Advanced analytics and reporting
• Mobile responsiveness optimization
• Performance and security enhancements

MEDIUM PRIORITY (Week 5+):
═══════════════════════════════════════════════════════════════════════════════════════════

• Advanced features (AI recommendations, chatbot)
• Third-party integrations (calendar sync, video calls)
• Marketing and referral systems
• Advanced payment features (subscriptions, splits)

```

## 🔧 COMPONENT MAPPING TO CODEBASE

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                             COMPONENT TO CODE MAPPING                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

STUDENT JOURNEY COMPONENTS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. LANDING PAGE & MARKETING
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Landing Page                                             │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(marketing)/[locale]/(home)/page.tsx         │
│ Features: Hero section, service showcase, testimonials             │
└─────────────────────────────────────────────────────────────────────┘

2. AUTHENTICATION & ONBOARDING
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Auth System                                              │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/auth/                                 │
│ Backend: packages/auth/                                             │
│ Features: Login, signup, email verification, role selection        │
└─────────────────────────────────────────────────────────────────────┘

3. SERVICE DISCOVERY & MARKETPLACE
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Services Marketplace                                     │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/services/                                │
│ Files:                                                              │
│ ├─ services-marketplace.tsx (Main marketplace)                     │
│ ├─ service-search.tsx (Search functionality)                       │
│ ├─ service-card.tsx (Service display cards)                        │
│ ├─ category-filter.tsx (Category filtering)                        │
│ ├─ service-sort.tsx (Sorting options)                              │
│ └─ api.ts (Service API integration)                                 │
│ Features: Browse, search, filter, sort services                    │
└─────────────────────────────────────────────────────────────────────┘

4. BOOKING SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Booking Management                                       │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/bookings/                                │
│ API: packages/api/src/routes/bookings.ts                           │
│ Database: booking model in schema.prisma                           │
│ Features: Create bookings, manage booking status                   │
└─────────────────────────────────────────────────────────────────────┘

5. AVAILABILITY SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Real-time Availability                                   │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/availability/                            │
│ Database: ProviderAvailability model in schema.prisma              │
│ Features: Real-time slot management, booking calendar              │
└─────────────────────────────────────────────────────────────────────┘

6. PAYMENT INTEGRATION
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Payment Processing                                       │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/payments/                                        │
│ Database: payment, payout_account models in schema.prisma          │
│ Providers: Paystack, Flutterwave support                           │
│ Features: Secure payments, escrow, provider payouts                │
└─────────────────────────────────────────────────────────────────────┘

PROVIDER JOURNEY COMPONENTS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. PROVIDER REGISTRATION & VERIFICATION
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Provider Authentication                                  │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/provider/               │
│ Guard: ProviderGuard.tsx                                            │
│ Hook: useProviderAuth.tsx                                           │
│ Features: Provider-specific auth, role verification                 │
└─────────────────────────────────────────────────────────────────────┘

2. SERVICE CREATION & MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Service Management                                       │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/provider/services/      │
│ API: apps/web/modules/provider/api.ts                              │
│ Database: service, ServiceFeatures, ServiceOutcomes models         │
│ Features: Create/edit services, pricing, features, outcomes        │
└─────────────────────────────────────────────────────────────────────┘

3. AVAILABILITY MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Provider Availability                                    │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/provider/availability/  │
│ Components:                                                         │
│ ├─ UnifiedAvailabilityManager.tsx                                  │
│ └─ AvailabilitySlotsList.tsx                                       │
│ Features: Set schedules, manage time slots, real-time updates      │
└─────────────────────────────────────────────────────────────────────┘

4. PROVIDER DASHBOARD
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Provider Dashboard                                       │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/provider/page.tsx       │
│ API: packages/api/src/routes/provider/dashboard.ts                 │
│ Features: Overview, earnings, booking stats, performance metrics   │
└─────────────────────────────────────────────────────────────────────┘

5. BOOKING MANAGEMENT (Provider Side)
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Provider Booking Management                              │
│ Status: ✅ IMPLEMENTED                                              │
│ API: packages/api/src/routes/provider/bookings.ts                  │
│ Features: View bookings, accept/decline, manage booking lifecycle  │
└─────────────────────────────────────────────────────────────────────┘

ADMIN JOURNEY COMPONENTS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. ADMIN DASHBOARD
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Admin Dashboard                                          │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/admin/                  │
│ Layout: admin/layout.tsx                                            │
│ Features: Platform overview, user stats, system monitoring         │
└─────────────────────────────────────────────────────────────────────┘

2. USER MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│ Component: User Management                                          │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/admin/users/page.tsx    │
│ API: packages/api/src/routes/admin/users.ts                        │
│ Features: View all users, manage accounts, role management         │
└─────────────────────────────────────────────────────────────────────┘

3. PROVIDER VERIFICATION SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Verification Management                                  │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/admin/verification-docs/                │
│ Components:                                                         │
│ ├─ VerificationDocsList.tsx                                        │
│ ├─ VerificationDocActions.tsx                                      │
│ ├─ VerificationActionDialog.tsx                                    │
│ └─ DocumentPreview.tsx                                             │
│ API: packages/api/src/routes/admin/verification-docs.ts            │
│ Features: Review docs, approve/reject providers, audit trail       │
└─────────────────────────────────────────────────────────────────────┘

4. ORGANIZATION MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Organization Management                                  │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/admin/organizations/    │
│ API: packages/api/src/routes/admin/organizations.ts                │
│ Features: Manage platform organizations, settings                  │
└─────────────────────────────────────────────────────────────────────┘

SHARED COMPONENTS & SYSTEMS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. AUTHENTICATION SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Better-Auth Integration                                  │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/auth/                                            │
│ Features: Multi-provider auth, session management, role-based      │
│ Providers: Email/password, OAuth, magic links, passkeys           │
└─────────────────────────────────────────────────────────────────────┘

2. DATABASE LAYER
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Prisma Database                                          │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/database/prisma/schema.prisma                   │
│ Models: user, service, booking, payment, review, availability      │
│ Features: Full relational schema, type safety, migrations          │
└─────────────────────────────────────────────────────────────────────┘

3. API LAYER
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Hono API Router                                          │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/api/                                             │
│ Routes: admin, provider, bookings, services                        │
│ Features: Type-safe APIs, middleware, OpenAPI docs                 │
└─────────────────────────────────────────────────────────────────────┘

4. UI COMPONENTS
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Shared UI Library                                        │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/ui/                                      │
│ Features: Shadcn UI components, consistent design system           │
└─────────────────────────────────────────────────────────────────────┘

5. ANALYTICS & MONITORING
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Analytics Integration                                    │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/analytics/                               │
│ Providers: Google Analytics, Mixpanel, PostHog, Plausible          │
│ Features: Multi-provider analytics, event tracking                 │
└─────────────────────────────────────────────────────────────────────┘

6. NOTIFICATION SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Email & Notifications                                    │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/mail/                                            │
│ Features: Email templates, notification management                  │
└─────────────────────────────────────────────────────────────────────┘

7. FILE STORAGE
┌─────────────────────────────────────────────────────────────────────┐
│ Component: File Storage System                                      │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/storage/                                         │
│ Features: File upload, storage management, CDN integration         │
└─────────────────────────────────────────────────────────────────────┘

GAPS & MISSING COMPONENTS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. STUDENT DASHBOARD
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Student-specific Dashboard                               │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/student/                │
│ Features: Dashboard overview, booking management, profile settings  │
│ Components:                                                         │
│ ├─ page.tsx (Main dashboard)                                       │
│ ├─ bookings/page.tsx (Booking history with filtering)              │
│ ├─ profile/page.tsx (Profile & notification settings)              │
│ └─ layout.tsx (Student-specific layout)                            │
└─────────────────────────────────────────────────────────────────────┘

2. REVIEW & RATING SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Review Management                                        │
│ Status: ❌ MISSING (DB exists)                                      │
│ Needed: Review UI components, rating system                        │
│ Database: ✅ review model exists                                   │
└─────────────────────────────────────────────────────────────────────┘

6. REAL-TIME NOTIFICATIONS
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Push Notifications & Real-time Updates                  │
│ Status: ❌ MISSING                                                  │
│ Needed: WebSocket connection, push notification service            │
│ Features: Booking alerts, payment notifications                    │
└─────────────────────────────────────────────────────────────────────┘

7. PAYMENT VERIFICATION SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Payment Verification & Status Tracking                  │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(marketing)/[locale]/payments/verify/        │
│ Components:                                                         │
│ ├─ page.tsx (Payment verification page)                            │
│ ├─ payment-verification.tsx (Status checking component)            │
│ └─ packages/api/src/routes/payments/initialize.ts (API)            │
│ Features: Payment status verification, error handling, redirects   │
└─────────────────────────────────────────────────────────────────────┘

4. ADVANCED SEARCH & FILTERING
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Enhanced Search Experience                               │
│ Status: ⚠️ BASIC IMPLEMENTATION                                    │
│ Location: apps/web/modules/services/service-search.tsx             │
│ Needed: Advanced filters, location-based search, AI recommendations│
└─────────────────────────────────────────────────────────────────────┘

5. MOBILE RESPONSIVENESS
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Mobile-optimized UI                                     │
│ Status: ⚠️ PARTIAL                                                 │
│ Needed: Mobile-first design, touch interactions, PWA features      │
└─────────────────────────────────────────────────────────────────────┘

```

## 📋 IMPLEMENTATION STATUS SUMMARY

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           IMPLEMENTATION STATUS OVERVIEW                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

CORE PLATFORM FEATURES:
✅ User Authentication & Role Management
✅ Provider Verification System
✅ Service Creation & Management
✅ Real-time Availability System
✅ Booking Management
✅ Payment Processing (Paystack/Flutterwave)
✅ Admin Dashboard & User Management
✅ Database Schema & API Layer
✅ File Storage & Upload System

PARTIALLY IMPLEMENTED:
⚠️ Service Search & Filtering (basic functionality)
⚠️ Mobile Responsiveness (needs optimization)
⚠️ Analytics & Reporting (infrastructure exists)

MISSING CRITICAL COMPONENTS:
✅ Student Dashboard & Profile Management (Main Dashboard - COMPLETED)
✅ Student Booking History (Comprehensive booking management - COMPLETED)
✅ Student Profile & Settings (Full profile system - COMPLETED)
❌ Review & Rating System UI
❌ Real-time Notifications & Push Alerts
❌ Advanced Search with Location & AI
❌ Provider-Student Communication System
❌ Dispute Resolution Workflow
❌ Mobile App/PWA Features
❌ Marketing & Referral System

COMPLETION ESTIMATE:
╔══════════════════════════════════════════════════════════════════════╗
║ Core Platform: 88% Complete                                         ║
║ Student Experience: 80% Complete                                    ║
║ Provider Experience: 90% Complete                                   ║
║ Admin Experience: 95% Complete                                      ║
║ Mobile Experience: 50% Complete                                     ║
║ Advanced Features: 35% Complete                                     ║
╚══════════════════════════════════════════════════════════════════════╝

```

## 💻 In-Depth Implementation Blueprint (v3) - Comprehensive Edition

**STATUS: Final, detailed technical breakdown for all critical path features across all user journeys.**

### 🎯 Guiding Principle: From Feature to Experience

We are moving beyond a simple feature checklist. Each task below is framed within a user story, tied to a specific component, and supported by a defined API endpoint. This ensures we are building a cohesive and complete user experience, not just isolated functionalities.

---

### 🚀 PRIORITY 1: Building the Complete Student & Provider Journeys (Critical Path)

**Goal:** Close the loop on the core platform experience for both students and providers. This is the highest priority as it directly impacts user retention, provider engagement, and platform viability.

--- 

### 🎓 **Epic 1.1: The Student Experience Hub**

**User Story:** "As a student, I need a central place to view my upcoming bookings, manage my schedule, and track my history, so I can feel in control of my learning and service journey."

**Location:** `apps/web/app/(saas)/app/(account)/student/`

*   **Task 1.1.1: Main Dashboard Page** ✅ **COMPLETED**
    *   **File:** `apps/web/app/(saas)/app/(account)/student/page.tsx`
    *   **UI Components:** `UpcomingBookingWidget`, `RecentActivityWidget`, `MyProvidersWidget`
    *   **API Endpoint:** `GET /api/student/dashboard-summary`
    *   **Status:** ✅ Fully implemented with modern UI, statistics cards, and real-time data
    *   **Implementation Details:** Complete student dashboard with routing, API integration, and responsive design

*   **Task 1.1.2: Comprehensive Booking History** ✅ **COMPLETED**
    *   **File:** `apps/web/app/(saas)/app/(account)/student/bookings/page.tsx`
    *   **UI Components:** `BookingDataTable`, `BookingFilterTabs` (`Upcoming`, `Completed`, `Cancelled`)
    *   **API Endpoint:** `GET /api/student/bookings?status=upcoming&page=1&limit=10`
    *   **Status:** ✅ Fully implemented with filtering, pagination, sorting, and responsive design
    *   **Implementation Details:** Complete booking management with desktop table + mobile cards, React Query integration, and comprehensive API backend

*   **Task 1.1.3: Student Profile & Notification Management** ✅ **COMPLETED**
    *   **File:** `apps/web/app/(saas)/app/(account)/student/profile/page.tsx`
    *   **UI Components:** `ProfileForm`, `NotificationSettings` with tabbed interface
    *   **API Endpoints:** `GET /api/users/me`, `PATCH /api/users/me/profile`, `GET|PATCH /api/users/me/notification-settings`
    *   **Status:** ✅ Fully implemented with comprehensive profile management, notification preferences, and academic information
    *   **Implementation Details:** Complete profile system with personal info, academic details, University of Benin departments, notification toggles, and API backend

--- 

### 💳 **Epic 1.2: The Payment & Booking Completion Flow**

**User Story:** "As a student, I want to securely and easily pay for a service I've selected, so I can confirm my booking and get the help I need."

**Location:** `apps/web/modules/payments/components/` and integrated into the booking flow.

*   **Task 1.2.1: Payment Flow UI Integration**
    *   **File:** `apps/web/modules/bookings/components/booking-dialog.tsx` (enhancement)
    *   **UI Components:** `PaymentMethodSelector`, `PaymentGatewayForm`, `PaymentSuccessScreen`
    *   **API Endpoints:** `POST /api/payments/initiate`, `POST /api/payments/verify` (webhook)
    *   **Backend Logic:** Implement Paystack/Flutterwave SDKs and secure webhook verification.

--- 

### 👨‍🏫 **Epic 1.3: The Provider Growth & Management Hub**

**User Story:** "As a provider, I need a dashboard to track my earnings, see my performance analytics, and manage my finances so I can grow my business on the platform."

**Location:** `apps/web/app/(saas)/app/(account)/provider/` (enhancements to existing dashboard)

*   **Task 1.3.1: Financial Dashboard**
    *   **File:** `apps/web/app/(saas)/app/(account)/provider/financials/page.tsx`
    *   **UI Components:** `EarningsChart` (monthly/weekly), `PayoutHistoryTable`, `PayoutAccountManager` (to connect bank account)
    *   **API Endpoint:** `GET /api/provider/financials` to fetch earnings data and payout history.
    *   **Backend Logic:** Integrate with payment provider to fetch payout status.

*   **Task 1.3.2: Performance Analytics Dashboard**
    *   **File:** `apps/web/app/(saas)/app/(account)/provider/performance/page.tsx`
    *   **UI Components:** `RatingOverTimeChart`, `BookingTrendChart`, `TopPerformingServicesList`, `ReviewFeed`
    *   **API Endpoint:** `GET /api/provider/performance-analytics`

--- 

### 💬 **Epic 1.4: The Communication Layer**

**User Story:** "As a user (student or provider), I need to communicate within the platform regarding a specific booking to ask questions and confirm details, ensuring a smooth service delivery."

**Location:** `apps/web/modules/messaging/`

*   **Task 1.4.1: In-App Messaging System**
    *   **File:** `apps/web/app/(saas)/app/bookings/[bookingId]/chat/page.tsx`
    *   **UI Components:** `ChatWindow`, `MessageBubble`
    *   **Technology:** Supabase Realtime for WebSocket communication.
    *   **Database:** New `Message` model in `schema.prisma` linked to `Booking` and `User`.
    *   **API:** `POST /api/bookings/{bookingId}/messages` and subscribe to Realtime channel `booking-chat:{bookingId}`.

--- 

### 🚀 PRIORITY 2: Building Trust, Safety, and Platform Integrity

**Goal:** Implement the critical features that make the platform safe, trustworthy, and reliable for all users. This includes robust admin tools and transparent user-facing systems.

--- 

### 👨‍💼 **Epic 2.1: The Admin Power Tools**

**User Story:** "As an admin, I need powerful tools to monitor platform health, manage disputes, and analyze growth, so I can ensure the platform is sustainable and secure."

**Location:** `apps/web/app/(saas)/app/(account)/admin/`

*   **Task 2.1.1: Platform Analytics & Insights Dashboard**
    *   **File:** `apps/web/app/(saas)/app/(account)/admin/analytics/page.tsx`
    *   **UI Components:** `KPIWidget` (for MoM growth, GMV), `UserGrowthChart`, `RevenueTrendChart`, `ServiceCategoryPopularity`
    *   **API Endpoint:** `GET /api/admin/platform-analytics` to fetch aggregated data for all KPIs.

*   **Task 2.1.2: Dispute Resolution Center**
    *   **File:** `apps/web/app/(saas)/app/(account)/admin/disputes/page.tsx`
    *   **Description:** A structured system for admins to mediate issues between students and providers.
    *   **UI Components:** `DisputeQueueTable`, `DisputeDetailView` (with chat logs, booking info, payment status), `ResolutionForm`
    *   **Database:** New `Dispute` model in `schema.prisma` linked to `Booking`.
    *   **API Endpoint:** `POST /api/disputes`, `GET /api/admin/disputes`, `PATCH /api/admin/disputes/{disputeId}`

--- 

### ⭐ **Epic 2.2: The Trust & Quality Layer**

**User Story:** "As a student, I want to leave detailed feedback after a service and see transparent reviews from others, so I can make informed decisions and trust the platform."

**Location:** Integrated across the student and service modules.

*   **Task 2.2.1: Submit Review Workflow**
    *   **File:** `apps/web/modules/reviews/components/submit-review-form.tsx`
    *   **Description:** A form in a modal, triggered from the "Completed Bookings" section of the student dashboard.
    *   **UI Components:** `StarRatingInput`, `ReviewTextArea`
    *   **API Endpoint (`packages/api/src/routes/reviews.ts`):** `POST /api/reviews` (UI needs to be built).
    *   **Workflow Trigger:** After a provider marks a booking `COMPLETED`, the student gets a notification and a "Leave a Review" CTA appears.

--- 

### 📱 **Epic 2.3: The Mobile-First Experience**

**User Story:** "As a user, I want a seamless and intuitive experience on my phone, as it is my primary way of accessing the internet."

**Approach:** A cross-cutting concern requiring a dedicated audit and refactor.

*   **Task 2.3.1: Mobile Experience Audit & Refactor**
    *   **Action:** Systematically audit and refactor all Priority 1 journeys on a mobile viewport.
    *   **Refactor `BookingDataTable`:** On mobile, transform it into a list of `BookingCard` components.
    *   **Refactor Forms:** Ensure all inputs are large, touch-friendly, and have clearly associated labels.

---

# UnibenServices - Complete User Journey Flow

## Holistic User Experience Flow (All Roles)

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                UNIBENSERVICES PLATFORM                                 │
│                              Complete User Journey Flow                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────┐
                                    │   LANDING PAGE  │
                                    │   (Public)      │
                                    └─────────┬───────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
                        ▼                     ▼                     ▼
                ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                │   SIGN UP    │    │   SIGN IN    │    │   BROWSE     │
                │              │    │              │    │   SERVICES   │
                └──────┬───────┘    └──────┬───────┘    │  (Guest)     │
                       │                   │            └──────────────┘
                       │                   │
                       └─────────┬─────────┘
                                 │
                                 ▼
                      ┌─────────────────┐
                      │  ROLE SELECTION │
                      │                 │
                      └─────────┬───────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   STUDENT    │    │   PROVIDER   │    │    ADMIN     │
│   JOURNEY    │    │   JOURNEY    │    │   JOURNEY    │
└──────────────┘    └──────────────┘    └──────────────┘

```

## 🎓 STUDENT USER JOURNEY

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 STUDENT JOURNEY                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   SIGN UP   │───▶│ ONBOARDING  │───▶│  PROFILE    │───▶│   BROWSE    │
    │             │    │   WIZARD    │    │  CREATION   │    │  SERVICES   │
    └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                    │
    ┌─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SEARCH &  │───▶│   SELECT    │───▶│   BOOK      │───▶│   PAYMENT   │
│   FILTER    │    │   SERVICE   │    │  SERVICE    │    │  PROCESS    │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
┌─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  BOOKING    │───▶│   ATTEND    │───▶│   REVIEW    │───▶│   REPEAT    │
│ CONFIRMED   │    │   SESSION   │    │  PROVIDER   │    │  JOURNEY    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

DETAILED STUDENT FLOW:
═════════════════════════════════════════════════════════════════════════

1. REGISTRATION & ONBOARDING
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1: Basic Registration                                         │
│  ├─ Email verification                                               │
│  ├─ Password creation                                                │
│  └─ Initial profile setup                                           │
│                                                                     │
│  Step 2: Student Verification                                       │
│  ├─ Matric number verification                                       │
│  ├─ Department selection                                             │
│  ├─ Academic level confirmation                                      │
│  └─ Student ID upload                                                │
│                                                                     │
│  Step 3: Profile Completion                                         │
│  ├─ Profile photo upload                                             │
│  ├─ Academic interests                                               │
│  ├─ Contact preferences                                              │
│  └─ Notification settings                                            │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
2. SERVICE DISCOVERY
┌─────────────────────────────────────────────────────────────────────┐
│  Service Marketplace                                                │
│  ├─ Browse by categories (Academic, Beauty, Tech, etc.)             │
│  ├─ Search by keywords/provider name                                 │
│  ├─ Filter by: Price, Rating, Availability, Location               │
│  ├─ Sort by: Price, Rating, Popularity, Distance                   │
│  └─ View service details and provider profiles                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
3. BOOKING PROCESS
┌─────────────────────────────────────────────────────────────────────┐
│  Service Selection & Booking                                       │
│  ├─ View service details (features, outcomes, provider info)       │
│  ├─ Check real-time availability calendar                          │
│  ├─ Select preferred time slot                                     │
│  ├─ Add booking notes/requirements                                  │
│  ├─ Review booking summary                                          │
│  └─ Proceed to payment                                              │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
4. PAYMENT & CONFIRMATION
┌─────────────────────────────────────────────────────────────────────┐
│  Payment Processing                                                 │
│  ├─ Select payment method (Paystack/Flutterwave)                   │
│  ├─ Enter payment details                                           │
│  ├─ Process secure payment                                          │
│  ├─ Receive booking confirmation                                    │
│  └─ Get provider contact information                                │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
5. SERVICE EXPERIENCE
┌─────────────────────────────────────────────────────────────────────┐
│  Pre-Service                                                        │
│  ├─ Receive booking reminders (24h, 2h before)                     │
│  ├─ Provider communication/preparation instructions                  │
│  ├─ Location/meeting details confirmation                           │
│  └─ Last-minute booking modifications (if needed)                   │
│                                                                     │
│  During Service                                                     │
│  ├─ Attend scheduled session                                        │
│  ├─ Receive agreed-upon service                                     │
│  └─ Real-time support access if needed                             │
│                                                                     │
│  Post-Service                                                       │
│  ├─ Service completion notification                                 │
│  ├─ Payment finalization (if escrow)                               │
│  ├─ Receive service materials/follow-up                            │
│  └─ Review and rating prompt                                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
6. ONGOING RELATIONSHIP
┌─────────────────────────────────────────────────────────────────────┐
│  Post-Service Engagement                                            │
│  ├─ Submit service review and rating                                │
│  ├─ Save provider to favorites                                      │
│  ├─ Book future sessions with same provider                         │
│  ├─ Discover related services                                       │
│  └─ Share recommendations with friends                              │
│                                                                     │
│  Account Management                                                 │
│  ├─ View booking history and receipts                               │
│  ├─ Manage payment methods                                          │
│  ├─ Update profile and preferences                                  │
│  ├─ Track spending and service usage                                │
│  └─ Access customer support                                         │
└─────────────────────────────────────────────────────────────────────┘

```

## 👨‍🏫 PROVIDER USER JOURNEY

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                PROVIDER JOURNEY                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   SIGN UP   │───▶│ ONBOARDING  │───▶│ DOCUMENT    │───▶│    ADMIN    │
    │             │    │   WIZARD    │    │ SUBMISSION  │    │ VERIFICATION│
    └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                    │
    ┌─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  APPROVAL   │───▶│   CREATE    │───▶│    SET      │───▶│   MANAGE    │
│  RECEIVED   │    │  SERVICES   │    │ AVAILABILITY│    │  BOOKINGS   │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
┌─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DELIVER   │───▶│   RECEIVE   │───▶│   REVIEW    │───▶│    GROW     │
│   SERVICE   │    │   PAYMENT   │    │  STUDENTS   │    │  BUSINESS   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

DETAILED PROVIDER FLOW:
═════════════════════════════════════════════════════════════════════════

1. REGISTRATION & VERIFICATION
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1: Provider Registration                                      │
│  ├─ Complete basic profile information                               │
│  ├─ Select provider category/specialization                         │
│  ├─ Provide contact and professional details                        │
│  └─ Upload professional profile photo                               │
│                                                                     │
│  Step 2: Document Verification                                      │
│  ├─ Upload student ID or staff ID                                   │
│  ├─ Upload skill certifications/portfolios                          │
│  ├─ Provide academic transcripts (if applicable)                    │
│  ├─ Submit professional references                                  │
│  └─ Complete skills assessment/interview                            │
│                                                                     │
│  Step 3: Admin Review Process                                       │
│  ├─ Admin reviews submitted documents                               │
│  ├─ Background verification checks                                  │
│  ├─ Skills validation process                                       │
│  └─ Approval/rejection notification                                 │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
2. SERVICE SETUP & MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│  Service Creation                                                   │
│  ├─ Create service listings with detailed descriptions              │
│  ├─ Set service pricing and duration                               │
│  ├─ Upload service images and portfolios                           │
│  ├─ Define service features and inclusions                         │
│  ├─ Set learning outcomes and expectations                         │
│  └─ Configure service level and capacity                           │
│                                                                     │
│  Availability Management                                            │
│  ├─ Set weekly availability schedule                               │
│  ├─ Define available time slots                                    │
│  ├─ Set booking capacity per slot                                  │
│  ├─ Manage holiday/unavailable periods                             │
│  └─ Update real-time availability status                           │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
3. BOOKING MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│  Incoming Booking Requests                                          │
│  ├─ Receive real-time booking notifications                         │
│  ├─ Review student booking details and requirements                 │
│  ├─ Accept or decline booking requests                              │
│  ├─ Communicate with students pre-service                          │
│  └─ Confirm service details and logistics                          │
│                                                                     │
│  Booking Dashboard                                                  │
│  ├─ View upcoming bookings calendar                                 │
│  ├─ Track booking statuses and payments                            │
│  ├─ Manage booking modifications/cancellations                     │
│  ├─ Access student contact information                             │
│  └─ Generate booking reports and analytics                         │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
4. SERVICE DELIVERY
┌─────────────────────────────────────────────────────────────────────┐
│  Pre-Service Preparation                                            │
│  ├─ Prepare service materials and resources                         │
│  ├─ Send preparation instructions to students                       │
│  ├─ Confirm meeting location/virtual link                          │
│  └─ Set up service environment                                      │
│                                                                     │
│  Service Execution                                                  │
│  ├─ Deliver agreed-upon service professionally                      │
│  ├─ Maintain quality standards and outcomes                         │
│  ├─ Document service progress/completion                            │
│  └─ Handle any service-related issues                              │
│                                                                     │
│  Service Completion                                                 │
│  ├─ Mark service as completed in system                            │
│  ├─ Provide follow-up materials if applicable                      │
│  ├─ Request service feedback from student                          │
│  └─ Update availability for future bookings                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
5. PAYMENT & FINANCIAL MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│  Payment Processing                                                 │
│  ├─ Automatic payment release after service completion             │
│  ├─ View payment status and transaction history                    │
│  ├─ Handle payment disputes (if any)                               │
│  └─ Track earnings and commission deductions                       │
│                                                                     │
│  Financial Dashboard                                                │
│  ├─ Monitor monthly/weekly earnings                                 │
│  ├─ View payout schedules and methods                              │
│  ├─ Generate financial reports and tax documents                   │
│  ├─ Manage banking/payment account details                         │
│  └─ Track platform fees and commissions                           │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
6. GROWTH & OPTIMIZATION
┌─────────────────────────────────────────────────────────────────────┐
│  Performance Analytics                                              │
│  ├─ View service performance metrics and ratings                    │
│  ├─ Analyze booking patterns and popular services                   │
│  ├─ Track student retention and repeat bookings                     │
│  ├─ Monitor competitive positioning                                 │
│  └─ Identify opportunities for service expansion                    │
│                                                                     │
│  Profile & Service Optimization                                     │
│  ├─ Update services based on demand and feedback                    │
│  ├─ Enhance service descriptions and pricing                        │
│  ├─ Build portfolio with student testimonials                       │
│  ├─ Participate in platform promotional activities                  │
│  └─ Expand service offerings in new categories                     │
│                                                                     │
│  Community Engagement                                               │
│  ├─ Respond to student reviews and feedback                         │
│  ├─ Participate in provider community forums                        │
│  ├─ Share best practices with other providers                       │
│  ├─ Attend platform training and development sessions              │
│  └─ Build long-term relationships with regular students            │
└─────────────────────────────────────────────────────────────────────┘

```

## 👨‍💼 ADMIN USER JOURNEY

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ADMIN JOURNEY                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │    LOGIN    │───▶│   ADMIN     │───▶│   VERIFY    │───▶│   MANAGE    │
    │             │    │  DASHBOARD  │    │  PROVIDERS  │    │   USERS     │
    └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                    │
    ┌─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   MONITOR   │───▶│   HANDLE    │───▶│  GENERATE   │───▶│   SYSTEM    │
│  PLATFORM   │    │  DISPUTES   │    │   REPORTS   │    │ MAINTENANCE │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

DETAILED ADMIN FLOW:
═════════════════════════════════════════════════════════════════════════

1. ADMIN ACCESS & DASHBOARD
┌─────────────────────────────────────────────────────────────────────┐
│  Admin Authentication                                               │
│  ├─ Secure admin login with 2FA                                     │
│  ├─ Role-based access control verification                          │
│  ├─ Session management and security logging                         │
│  └─ Admin activity audit trail                                      │
│                                                                     │
│  Dashboard Overview                                                 │
│  ├─ Platform usage statistics (users, bookings, revenue)           │
│  ├─ Pending verification requests counter                           │
│  ├─ Recent platform activity feed                                  │
│  ├─ System health and performance metrics                          │
│  ├─ Financial overview and transaction summaries                   │
│  └─ Quick action buttons for common tasks                          │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
2. USER MANAGEMENT & VERIFICATION
┌─────────────────────────────────────────────────────────────────────┐
│  Provider Verification Workflow                                     │
│  ├─ Review pending provider applications                            │
│  ├─ Verify submitted documents and credentials                      │
│  ├─ Conduct background checks and skill assessments                 │
│  ├─ Approve/reject applications with detailed feedback              │
│  ├─ Send verification status notifications                          │
│  └─ Maintain verification audit trail                              │
│                                                                     │
│  User Account Management                                            │
│  ├─ View and manage all user accounts (students/providers)         │
│  ├─ Handle account suspension/activation requests                   │
│  ├─ Reset passwords and manage account issues                      │
│  ├─ Monitor user activity and flag suspicious behavior             │
│  ├─ Manage user roles and permissions                              │
│  └─ Handle account deletion and data privacy requests              │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
3. SERVICE & CONTENT MODERATION
┌─────────────────────────────────────────────────────────────────────┐
│  Service Listing Management                                         │
│  ├─ Review and moderate new service listings                        │
│  ├─ Ensure service content meets platform guidelines               │
│  ├─ Handle inappropriate service content reports                    │
│  ├─ Manage service category organization                            │
│  ├─ Set platform-wide service policies                             │
│  └─ Monitor service quality and standards                          │
│                                                                     │
│  Content Quality Control                                            │
│  ├─ Review user-generated content (reviews, profiles)              │
│  ├─ Handle content violation reports                                │
│  ├─ Maintain platform community guidelines                         │
│  ├─ Moderate user communications and disputes                      │
│  └─ Ensure legal compliance of all content                         │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
4. FINANCIAL & TRANSACTION OVERSIGHT
┌─────────────────────────────────────────────────────────────────────┐
│  Payment System Management                                          │
│  ├─ Monitor all financial transactions                              │
│  ├─ Handle payment disputes and refund requests                     │
│  ├─ Manage platform commission and fee structures                   │
│  ├─ Oversee provider payout processing                             │
│  ├─ Generate financial reports and tax documentation               │
│  └─ Ensure payment security and fraud prevention                   │
│                                                                     │
│  Revenue Analytics                                                  │
│  ├─ Track platform revenue and growth metrics                      │
│  ├─ Analyze booking patterns and seasonal trends                   │
│  ├─ Monitor provider earnings and platform take-rate              │
│  ├─ Generate investor and stakeholder reports                      │
│  └─ Identify revenue optimization opportunities                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
5. PLATFORM OPERATIONS & SUPPORT
┌─────────────────────────────────────────────────────────────────────┐
│  Customer Support Management                                        │
│  ├─ Handle escalated customer support tickets                       │
│  ├─ Manage support team and response protocols                      │
│  ├─ Monitor support metrics (response time, resolution rate)       │
│  ├─ Create and update help documentation/FAQs                      │
│  ├─ Train support staff on platform policies                       │
│  └─ Implement customer feedback improvements                        │
│                                                                     │
│  System Monitoring & Security                                       │
│  ├─ Monitor platform performance and uptime                         │
│  ├─ Oversee security protocols and incident response               │
│  ├─ Manage system updates and maintenance schedules                │
│  ├─ Handle data backup and disaster recovery                       │
│  ├─ Monitor for security threats and vulnerabilities               │
│  └─ Ensure GDPR and data privacy compliance                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
6. STRATEGIC MANAGEMENT & GROWTH
┌─────────────────────────────────────────────────────────────────────┐
│  Platform Analytics & Insights                                      │
│  ├─ Generate comprehensive platform usage reports                   │
│  ├─ Analyze user behavior and engagement patterns                   │
│  ├─ Track key performance indicators (KPIs)                        │
│  ├─ Monitor competitive landscape and market trends                │
│  ├─ Identify growth opportunities and bottlenecks                  │
│  └─ Create data-driven strategic recommendations                    │
│                                                                     │
│  Policy & Compliance Management                                     │
│  ├─ Develop and update platform terms of service                   │
│  ├─ Ensure legal compliance across all jurisdictions               │
│  ├─ Manage partnerships and third-party integrations               │
│  ├─ Oversee marketing and promotional campaigns                     │
│  ├─ Handle public relations and community engagement               │
│  └─ Plan platform expansion and new feature rollouts              │
└─────────────────────────────────────────────────────────────────────┘

```

## 🔄 CROSS-ROLE INTERACTIONS

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            CROSS-ROLE INTERACTION MAP                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

STUDENT ←→ PROVIDER INTERACTIONS:
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────┐  Booking Request   ┌─────────────┐  Service Delivery  ┌─────────────┐
│   STUDENT   │ ═════════════════▶ │   PROVIDER  │ ═════════════════▶ │   STUDENT   │
│             │                    │             │                    │             │
│ • Searches  │◀═════════════════  │ • Reviews   │◀═════════════════  │ • Receives  │
│ • Compares  │  Accept/Decline    │ • Confirms  │   Payment & Review │ • Reviews   │
│ • Books     │                    │ • Delivers  │                    │ • Re-books  │
└─────────────┘                    └─────────────┘                    └─────────────┘

ADMIN ←→ PROVIDER INTERACTIONS:
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────┐  Verification      ┌─────────────┐  Monitoring        ┌─────────────┐
│   PROVIDER  │ ═════════════════▶ │    ADMIN    │ ═════════════════▶ │   PROVIDER  │
│             │                    │             │                    │             │
│ • Applies   │◀═════════════════  │ • Reviews   │◀═════════════════  │ • Complies  │
│ • Submits   │  Approval/Feedback │ • Monitors  │   Support/Guidance │ • Improves  │
│ • Appeals   │                    │ • Supports  │                    │ • Reports   │
└─────────────┘                    └─────────────┘                    └─────────────┘

ADMIN ←→ STUDENT INTERACTIONS:
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────┐  Support Request   ┌─────────────┐  Platform Access   ┌─────────────┐
│   STUDENT   │ ═════════════════▶ │    ADMIN    │ ═════════════════▶ │   STUDENT   │
│             │                    │             │                    │             │
│ • Reports   │◀═════════════════  │ • Resolves  │◀═════════════════  │ • Benefits  │
│ • Appeals   │   Resolution       │ • Maintains │    Service Quality │ • Trusts    │
│ • Feedback  │                    │ • Improves  │                    │ • Engages   │
└─────────────┘                    └─────────────┘                    └─────────────┘

```

## 📊 SYSTEM TOUCHPOINTS & DATA FLOW

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM DATA FLOW                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   DATABASE      │
                              │   (Prisma)      │
                              └─────────┬───────┘
                                        │
                      ┌─────────────────┼─────────────────┐
                      │                 │                 │
                      ▼                 ▼                 ▼
              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
              │   USERS      │  │   SERVICES   │  │   BOOKINGS   │
              │              │  │              │  │              │
              │ • Students   │  │ • Listings   │  │ • Requests   │
              │ • Providers  │  │ • Features   │  │ • Payments   │
              │ • Admins     │  │ • Outcomes   │  │ • Reviews    │
              └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                     │                 │                 │
                     └─────────────────┼─────────────────┘
                                       │
                                       ▼
                           ┌─────────────────┐
                           │   API LAYER     │
                           │   (Hono)        │
                           └─────────┬───────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
                     ▼               ▼               ▼
             ┌──────────────┐┌──────────────┐┌──────────────┐
             │   STUDENT    ││   PROVIDER   ││    ADMIN     │
             │   FRONTEND   ││   FRONTEND   ││   FRONTEND   │
             │              ││              ││              │
             │ • Browse     ││ • Manage     ││ • Monitor    │
             │ • Book       ││ • Schedule   ││ • Verify     │
             │ • Pay        ││ • Deliver    ││ • Analyze    │
             │ • Review     ││ • Earn       ││ • Support    │
             └──────────────┘└──────────────┘└──────────────┘

NOTIFICATION SYSTEM:
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   EMAIL     │    │    SMS      │    │   IN-APP    │    │    PUSH     │
│             │    │             │    │             │    │             │
│ • Booking   │    │ • Reminders │    │ • Real-time │    │ • Critical  │
│ • Receipts  │    │ • Critical  │    │ • Updates   │    │ • Updates   │
│ • Updates   │    │ • Alerts    │    │ • Messages  │    │ • Offers    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

PAYMENT FLOW:
═══════════════════════════════════════════════════════════════════════════════════════════

Student Payment ──▶ Platform Escrow ──▶ Service Delivery ──▶ Provider Payout
     │                    │                      │                    │
     │                    │                      │                    │
     ▼                    ▼                      ▼                    ▼
┌──────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────┐
│ Paystack │      │   Platform   │      │   Service    │      │ Provider │
│   /      │      │  Commission  │      │  Completion  │      │ Earnings │
│Flutter-  │      │   (5-10%)    │      │     Flag     │      │ (90-95%) │
│  wave    │      │              │      │              │      │          │
└──────────┘      └──────────────┘      └──────────────┘      └──────────┘

```

## 🎯 KEY USER JOURNEY METRICS

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           SUCCESS METRICS BY ROLE                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

STUDENT SUCCESS METRICS:
═══════════════════════════════════════════════════════════════════════════════════════════

Registration → First Booking: 
├─ Target: <24 hours
├─ Current: TBD
└─ Optimization: Streamlined onboarding

Booking Completion Rate:
├─ Target: >85%
├─ Current: TBD  
└─ Optimization: Clear expectations, quality providers

Service Satisfaction:
├─ Target: >4.5/5 rating
├─ Current: TBD
└─ Optimization: Provider quality, dispute resolution

Repeat Booking Rate:
├─ Target: >60% within 30 days
├─ Current: TBD
└─ Optimization: Provider relationships, service quality

PROVIDER SUCCESS METRICS:
═══════════════════════════════════════════════════════════════════════════════════════════

Verification → First Booking:
├─ Target: <7 days
├─ Current: TBD
└─ Optimization: Fast verification, profile optimization

Monthly Active Revenue:
├─ Target: ₦50,000+ per provider
├─ Current: TBD
└─ Optimization: Service optimization, demand matching

Booking Acceptance Rate:
├─ Target: >80%
├─ Current: TBD
└─ Optimization: Realistic availability, clear expectations

Provider Rating:
├─ Target: >4.3/5 average
├─ Current: TBD
└─ Optimization: Quality training, feedback loops

ADMIN SUCCESS METRICS:
═══════════════════════════════════════════════════════════════════════════════════════════

Platform Growth:
├─ Target: 20% MoM user growth
├─ Current: TBD
└─ Optimization: Marketing, referrals, quality

Verification Time:
├─ Target: <72 hours
├─ Current: TBD
└─ Optimization: Automated checks, efficient workflows

Dispute Resolution:
├─ Target: <48 hours average
├─ Current: TBD
└─ Optimization: Clear policies, quick escalation

Platform Revenue:
├─ Target: ₦2M+ monthly GMV
├─ Current: TBD
└─ Optimization: Provider success, student retention

```

## 🚀 IMPLEMENTATION PRIORITIES

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION PRIORITY MATRIX                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘

CRITICAL PATH (Week 1-2):
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│     STUDENT PATH        │  │     PROVIDER PATH       │  │      ADMIN PATH         │
│                         │  │                         │  │                         │
│ 1. Service Discovery    │  │ 1. Verification System  │  │ 1. Verification Review  │
│ 2. Booking Process      │  │ 2. Service Creation     │  │ 2. User Management      │
│ 3. Payment Integration  │  │ 3. Availability Mgmt    │  │ 3. Platform Monitoring  │
│ 4. Service Experience   │  │ 4. Booking Management   │  │ 4. Support System       │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘

HIGH PRIORITY (Week 3-4):
═══════════════════════════════════════════════════════════════════════════════════════════

• Real-time notifications across all roles
• Advanced analytics and reporting
• Mobile responsiveness optimization
• Performance and security enhancements

MEDIUM PRIORITY (Week 5+):
═══════════════════════════════════════════════════════════════════════════════════════════

• Advanced features (AI recommendations, chatbot)
• Third-party integrations (calendar sync, video calls)
• Marketing and referral systems
• Advanced payment features (subscriptions, splits)

```

## 🔧 COMPONENT MAPPING TO CODEBASE

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                             COMPONENT TO CODE MAPPING                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

STUDENT JOURNEY COMPONENTS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. LANDING PAGE & MARKETING
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Landing Page                                             │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(marketing)/[locale]/(home)/page.tsx         │
│ Features: Hero section, service showcase, testimonials             │
└─────────────────────────────────────────────────────────────────────┘

2. AUTHENTICATION & ONBOARDING
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Auth System                                              │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/auth/                                 │
│ Backend: packages/auth/                                             │
│ Features: Login, signup, email verification, role selection        │
└─────────────────────────────────────────────────────────────────────┘

3. SERVICE DISCOVERY & MARKETPLACE
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Services Marketplace                                     │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/services/                                │
│ Files:                                                              │
│ ├─ services-marketplace.tsx (Main marketplace)                     │
│ ├─ service-search.tsx (Search functionality)                       │
│ ├─ service-card.tsx (Service display cards)                        │
│ ├─ category-filter.tsx (Category filtering)                        │
│ ├─ service-sort.tsx (Sorting options)                              │
│ └─ api.ts (Service API integration)                                 │
│ Features: Browse, search, filter, sort services                    │
└─────────────────────────────────────────────────────────────────────┘

4. BOOKING SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Booking Management                                       │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/bookings/                                │
│ API: packages/api/src/routes/bookings.ts                           │
│ Database: booking model in schema.prisma                           │
│ Features: Create bookings, manage booking status                   │
└─────────────────────────────────────────────────────────────────────┘

5. AVAILABILITY SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Real-time Availability                                   │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/availability/                            │
│ Database: ProviderAvailability model in schema.prisma              │
│ Features: Real-time slot management, booking calendar              │
└─────────────────────────────────────────────────────────────────────┘

6. PAYMENT INTEGRATION
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Payment Processing                                       │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/payments/                                        │
│ Database: payment, payout_account models in schema.prisma          │
│ Providers: Paystack, Flutterwave support                           │
│ Features: Secure payments, escrow, provider payouts                │
└─────────────────────────────────────────────────────────────────────┘

PROVIDER JOURNEY COMPONENTS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. PROVIDER REGISTRATION & VERIFICATION
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Provider Authentication                                  │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/provider/               │
│ Guard: ProviderGuard.tsx                                            │
│ Hook: useProviderAuth.tsx                                           │
│ Features: Provider-specific auth, role verification                 │
└─────────────────────────────────────────────────────────────────────┘

2. SERVICE CREATION & MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Service Management                                       │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/provider/services/      │
│ API: apps/web/modules/provider/api.ts                              │
│ Database: service, ServiceFeatures, ServiceOutcomes models         │
│ Features: Create/edit services, pricing, features, outcomes        │
└─────────────────────────────────────────────────────────────────────┘

3. AVAILABILITY MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Provider Availability                                    │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/provider/availability/  │
│ Components:                                                         │
│ ├─ UnifiedAvailabilityManager.tsx                                  │
│ └─ AvailabilitySlotsList.tsx                                       │
│ Features: Set schedules, manage time slots, real-time updates      │
└─────────────────────────────────────────────────────────────────────┘

4. PROVIDER DASHBOARD
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Provider Dashboard                                       │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/provider/page.tsx       │
│ API: packages/api/src/routes/provider/dashboard.ts                 │
│ Features: Overview, earnings, booking stats, performance metrics   │
└─────────────────────────────────────────────────────────────────────┘

5. BOOKING MANAGEMENT (Provider Side)
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Provider Booking Management                              │
│ Status: ✅ IMPLEMENTED                                              │
│ API: packages/api/src/routes/provider/bookings.ts                  │
│ Features: View bookings, accept/decline, manage booking lifecycle  │
└─────────────────────────────────────────────────────────────────────┘

ADMIN JOURNEY COMPONENTS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. ADMIN DASHBOARD
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Admin Dashboard                                          │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/admin/                  │
│ Layout: admin/layout.tsx                                            │
│ Features: Platform overview, user stats, system monitoring         │
└─────────────────────────────────────────────────────────────────────┘

2. USER MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│ Component: User Management                                          │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/admin/users/page.tsx    │
│ API: packages/api/src/routes/admin/users.ts                        │
│ Features: View all users, manage accounts, role management         │
└─────────────────────────────────────────────────────────────────────┘

3. PROVIDER VERIFICATION SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Verification Management                                  │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/admin/verification-docs/                │
│ Components:                                                         │
│ ├─ VerificationDocsList.tsx                                        │
│ ├─ VerificationDocActions.tsx                                      │
│ ├─ VerificationActionDialog.tsx                                    │
│ └─ DocumentPreview.tsx                                             │
│ API: packages/api/src/routes/admin/verification-docs.ts            │
│ Features: Review docs, approve/reject providers, audit trail       │
└─────────────────────────────────────────────────────────────────────┘

4. ORGANIZATION MANAGEMENT
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Organization Management                                  │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/app/(saas)/app/(account)/admin/organizations/    │
│ API: packages/api/src/routes/admin/organizations.ts                │
│ Features: Manage platform organizations, settings                  │
└─────────────────────────────────────────────────────────────────────┘

SHARED COMPONENTS & SYSTEMS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. AUTHENTICATION SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Better-Auth Integration                                  │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/auth/                                            │
│ Features: Multi-provider auth, session management, role-based      │
│ Providers: Email/password, OAuth, magic links, passkeys           │
└─────────────────────────────────────────────────────────────────────┘

2. DATABASE LAYER
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Prisma Database                                          │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/database/prisma/schema.prisma                   │
│ Models: user, service, booking, payment, review, availability      │
│ Features: Full relational schema, type safety, migrations          │
└─────────────────────────────────────────────────────────────────────┘

3. API LAYER
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Hono API Router                                          │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/api/                                             │
│ Routes: admin, provider, bookings, services                        │
│ Features: Type-safe APIs, middleware, OpenAPI docs                 │
└─────────────────────────────────────────────────────────────────────┘

4. UI COMPONENTS
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Shared UI Library                                        │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/ui/                                      │
│ Features: Shadcn UI components, consistent design system           │
└─────────────────────────────────────────────────────────────────────┘

5. ANALYTICS & MONITORING
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Analytics Integration                                    │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: apps/web/modules/analytics/                               │
│ Providers: Google Analytics, Mixpanel, PostHog, Plausible          │
│ Features: Multi-provider analytics, event tracking                 │
└─────────────────────────────────────────────────────────────────────┘

6. NOTIFICATION SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Email & Notifications                                    │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/mail/                                            │
│ Features: Email templates, notification management                  │
└─────────────────────────────────────────────────────────────────────┘

7. FILE STORAGE
┌─────────────────────────────────────────────────────────────────────┐
│ Component: File Storage System                                      │
│ Status: ✅ IMPLEMENTED                                              │
│ Location: packages/storage/                                         │
│ Features: File upload, storage management, CDN integration         │
└─────────────────────────────────────────────────────────────────────┘

GAPS & MISSING COMPONENTS:
═══════════════════════════════════════════════════════════════════════════════════════════

1. STUDENT DASHBOARD
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Student-specific Dashboard                               │
│ Status: ❌ MISSING                                                  │
│ Needed: apps/web/app/(saas)/app/(account)/student/                  │
│ Features: Booking history, favorites, spending tracking            │
└─────────────────────────────────────────────────────────────────────┘

2. REVIEW & RATING SYSTEM
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Review Management                                        │
│ Status: ❌ MISSING (DB exists)                                      │
│ Needed: Review UI components, rating system                        │
│ Database: ✅ review model exists                                   │
└─────────────────────────────────────────────────────────────────────┘

3. REAL-TIME NOTIFICATIONS
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Push Notifications & Real-time Updates                  │
│ Status: ❌ MISSING                                                  │
│ Needed: WebSocket connection, push notification service            │
│ Features: Booking alerts, payment notifications                    │
└─────────────────────────────────────────────────────────────────────┘

4. ADVANCED SEARCH & FILTERING
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Enhanced Search Experience                               │
│ Status: ⚠️ BASIC IMPLEMENTATION                                    │
│ Location: apps/web/modules/services/service-search.tsx             │
│ Needed: Advanced filters, location-based search, AI recommendations│
└─────────────────────────────────────────────────────────────────────┘

5. MOBILE RESPONSIVENESS
┌─────────────────────────────────────────────────────────────────────┐
│ Component: Mobile-optimized UI                                     │
│ Status: ⚠️ PARTIAL                                                 │
│ Needed: Mobile-first design, touch interactions, PWA features      │
└─────────────────────────────────────────────────────────────────────┘

```

## 📋 IMPLEMENTATION STATUS SUMMARY

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           IMPLEMENTATION STATUS OVERVIEW                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

CORE PLATFORM FEATURES:
✅ User Authentication & Role Management
✅ Provider Verification System
✅ Service Creation & Management
✅ Real-time Availability System
✅ Booking Management
✅ Payment Processing (Paystack/Flutterwave)
✅ Admin Dashboard & User Management
✅ Database Schema & API Layer
✅ File Storage & Upload System

PARTIALLY IMPLEMENTED:
⚠️ Service Search & Filtering (basic functionality)
⚠️ Mobile Responsiveness (needs optimization)
⚠️ Analytics & Reporting (infrastructure exists)

MISSING CRITICAL COMPONENTS:
❌ Student Dashboard & Profile Management
❌ Review & Rating System UI
❌ Real-time Notifications & Push Alerts
❌ Advanced Search with Location & AI
❌ Provider-Student Communication System
❌ Dispute Resolution Workflow
❌ Mobile App/PWA Features
❌ Marketing & Referral System

RECENTLY COMPLETED:
✅ Payment Verification System

COMPLETION ESTIMATE:
╔══════════════════════════════════════════════════════════════════════╗
║ Core Platform: 85% Complete                                         ║
║ Student Experience: 60% Complete                                    ║
║ Provider Experience: 90% Complete                                   ║
║ Admin Experience: 95% Complete                                      ║
║ Mobile Experience: 40% Complete                                     ║
║ Advanced Features: 30% Complete                                     ║
╚══════════════════════════════════════════════════════════════════════╝

```

This comprehensive user journey flow shows how each role interacts with the UnibenServices platform, their touchpoints, and the complete user experience from registration to ongoing platform engagement. The ASCII diagrams provide a clear visual representation of the complex interactions and system flows that make up the holistic user experience.

The component mapping section above provides a detailed analysis of what's already implemented in the codebase versus what still needs to be built to achieve the complete user journey experience outlined in this document.
## 💻 In-Depth Implementation Blueprint (v3) - Comprehensive Edition

**STATUS: Final, detailed technical breakdown for all critical path features across all user journeys.**

### 🎯 Guiding Principle: From Feature to Experience

We are moving beyond a simple feature checklist. Each task below is framed within a user story, tied to a specific component, and supported by a defined API endpoint. This ensures we are building a cohesive and complete user experience, not just isolated functionalities.

---

### 🚀 PRIORITY 1: Building the Complete Student & Provider Journeys (Critical Path)

**Goal:** Close the loop on the core platform experience for both students and providers. This is the highest priority as it directly impacts user retention, provider engagement, and platform viability.

--- 

### 🎓 **Epic 1.1: The Student Experience Hub**

**User Story:** "As a student, I need a central place to view my upcoming bookings, manage my schedule, and track my history, so I can feel in control of my learning and service journey."

**Location:** `apps/web/app/(saas)/app/(account)/student/`

*   **Task 1.1.1: Main Dashboard Page**
    *   **File:** `apps/web/app/(saas)/app/(account)/student/page.tsx`
    *   **UI Components:** `UpcomingBookingWidget`, `RecentActivityWidget`, `MyProvidersWidget`
    *   **API Endpoint:** `GET /api/student/dashboard-summary` 

*   **Task 1.1.2: Comprehensive Booking History**
    *   **File:** `apps/web/app/(saas)/app/(account)/student/bookings/page.tsx`
    *   **UI Components:** `BookingDataTable`, `BookingFilterTabs` (`Upcoming`, `Completed`, `Cancelled`)
    *   **API Endpoint:** `GET /api/student/bookings?status=upcoming&page=1&limit=10`

*   **Task 1.1.3: Student Profile & Notification Management**
    *   **File:** `apps/web/app/(saas)/app/(account)/student/profile/page.tsx`
    *   **UI Components:** `ProfileForm`, `AcademicInterestsManager`, `NotificationSettings`
    *   **API Endpoints:** `PATCH /api/users/me/profile`, `PATCH /api/users/me/notification-settings`

--- 

### 💳 **Epic 1.2: The Payment & Booking Completion Flow**

**User Story:** "As a student, I want to securely and easily pay for a service I've selected, so I can confirm my booking and get the help I need."

**Status:** 85% Complete

#### **Implemented**
- **Flutterwave Payment Gateway Fully Integrated**
- **Backend Payment Processing with Real-time Updates**
- **Payment Verification and Error Handling**
- **UI Components for Payment Flow: Booking Dialog Enhancement**

#### ⚠️ **In Progress**
- **Paystack Integration**

#### ❌ **Not Implemented**
- **Split Payment Feature**
- **Wallet Integration**

**Location:** `apps/web/modules/payments/components/` and integrated into the booking flow.

*   **Task 1.2.1: Payment Flow UI Integration**
    *   **File:** `apps/web/modules/bookings/components/booking-dialog.tsx` (enhancement)
    *   **UI Components:** `PaymentMethodSelector`, `PaymentGatewayForm`, `PaymentSuccessScreen`
    *   **API Endpoints:** `POST /api/payments/initiate`, `POST /api/payments/verify` (webhook)
    *   **Backend Logic:** Implement Paystack/Flutterwave SDKs and secure webhook verification.

--- 

### 👨‍🏫 **Epic 1.3: The Provider Growth & Management Hub**

**User Story:** "As a provider, I need a dashboard to track my earnings, see my performance analytics, and manage my finances so I can grow my business on the platform."

**Location:** `apps/web/app/(saas)/app/(account)/provider/` (enhancements to existing dashboard)

*   **Task 1.3.1: Financial Dashboard**
    *   **File:** `apps/web/app/(saas)/app/(account)/provider/financials/page.tsx`
    *   **UI Components:** `EarningsChart` (monthly/weekly), `PayoutHistoryTable`, `PayoutAccountManager` (to connect bank account)
    *   **API Endpoint:** `GET /api/provider/financials` to fetch earnings data and payout history.
    *   **Backend Logic:** Integrate with payment provider to fetch payout status.

*   **Task 1.3.2: Performance Analytics Dashboard**
    *   **File:** `apps/web/app/(saas)/app/(account)/provider/performance/page.tsx`
    *   **UI Components:** `RatingOverTimeChart`, `BookingTrendChart`, `TopPerformingServicesList`, `ReviewFeed`
    *   **API Endpoint:** `GET /api/provider/performance-analytics`

--- 

### 💬 **Epic 1.4: The Communication Layer**

**User Story:** "As a user (student or provider), I need to communicate within the platform regarding a specific booking to ask questions and confirm details, ensuring a smooth service delivery."

**Location:** `apps/web/modules/messaging/`

*   **Task 1.4.1: In-App Messaging System**
    *   **File:** `apps/web/app/(saas)/app/bookings/[bookingId]/chat/page.tsx`
    *   **UI Components:** `ChatWindow`, `MessageBubble`
    *   **Technology:** Supabase Realtime for WebSocket communication.
    *   **Database:** New `Message` model in `schema.prisma` linked to `Booking` and `User`.
    *   **API:** `POST /api/bookings/{bookingId}/messages` and subscribe to Realtime channel `booking-chat:{bookingId}`.

--- 

### 🚀 PRIORITY 2: Building Trust, Safety, and Platform Integrity

**Goal:** Implement the critical features that make the platform safe, trustworthy, and reliable for all users. This includes robust admin tools and transparent user-facing systems.

--- 

### 👨‍💼 **Epic 2.1: The Admin Power Tools**

**User Story:** "As an admin, I need powerful tools to monitor platform health, manage disputes, and analyze growth, so I can ensure the platform is sustainable and secure."

**Location:** `apps/web/app/(saas)/app/(account)/admin/`

*   **Task 2.1.1: Platform Analytics & Insights Dashboard**
    *   **File:** `apps/web/app/(saas)/app/(account)/admin/analytics/page.tsx`
    *   **UI Components:** `KPIWidget` (for MoM growth, GMV), `UserGrowthChart`, `RevenueTrendChart`, `ServiceCategoryPopularity`
    *   **API Endpoint:** `GET /api/admin/platform-analytics` to fetch aggregated data for all KPIs.

*   **Task 2.1.2: Dispute Resolution Center**
    *   **File:** `apps/web/app/(saas)/app/(account)/admin/disputes/page.tsx`
    *   **Description:** A structured system for admins to mediate issues between students and providers.
    *   **UI Components:** `DisputeQueueTable`, `DisputeDetailView` (with chat logs, booking info, payment status), `ResolutionForm`
    *   **Database:** New `Dispute` model in `schema.prisma` linked to `Booking`.
    *   **API Endpoint:** `POST /api/disputes`, `GET /api/admin/disputes`, `PATCH /api/admin/disputes/{disputeId}`

--- 

### ⭐ **Epic 2.2: The Trust & Quality Layer**

**User Story:** "As a student, I want to leave detailed feedback after a service and see transparent reviews from others, so I can make informed decisions and trust the platform."

**Location:** Integrated across the student and service modules.

*   **Task 2.2.1: Submit Review Workflow**
    *   **File:** `apps/web/modules/reviews/components/submit-review-form.tsx`
    *   **Description:** A form in a modal, triggered from the "Completed Bookings" section of the student dashboard.
    *   **UI Components:** `StarRatingInput`, `ReviewTextArea`
    *   **API Endpoint (`packages/api/src/routes/reviews.ts`):** `POST /api/reviews` (UI needs to be built).
    *   **Workflow Trigger:** After a provider marks a booking `COMPLETED`, the student gets a notification and a "Leave a Review" CTA appears.

--- 

### 📱 **Epic 2.3: The Mobile-First Experience**

**User Story:** "As a user, I want a seamless and intuitive experience on my phone, as it is my primary way of accessing the internet."

**Approach:** A cross-cutting concern requiring a dedicated audit and refactor.

*   **Task 2.3.1: Mobile Experience Audit & Refactor**
    *   **Action:** Systematically audit and refactor all Priority 1 journeys on a mobile viewport.
    *   **Refactor `BookingDataTable`:** On mobile, transform it into a list of `BookingCard` components.
    *   **Refactor Forms:** Ensure all inputs are large, touch-friendly, and have clearly associated labels.

---
