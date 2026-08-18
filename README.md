# CareShield - Digital Insurance Claims & Policies Portal

CareShield is a modern, web-based self-service insurance portal built with Spring Boot and JPA. It allows users to register, manage their insurance policies, file digital claims with uploaded documents, and track their reimbursement status. Admins can review, approve, or reject claims, which automatically updates the policy's remaining balance.

---

## 🚀 Getting Started

### Prerequisites
* **OS**: Windows
* **JDK**: Microsoft OpenJDK 17 (Automated in script)
* **Build Tool**: Maven 3.9.9 (Automated in script)

### Installation & Run
1. Run PowerShell as administrator and setup the compiler environment:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\setup_tools.ps1
   ```
2. Start the local server:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\run_app.ps1
   ```
3. Access the portal:
   * **URL**: [http://localhost:8080](http://localhost:8080)

---

## 📊 Flowchart

The following flowchart shows the user and admin interaction cycle in the CareShield portal.

```mermaid
flowchart TD
    Start([Access CareShield Portal]) --> Auth{Logged In?}
    Auth -- No --> AuthPage[Sign In / Sign Up]
    AuthPage --> Auth
    Auth -- Yes --> RoleCheck{User Role?}
    
    %% User Flow
    RoleCheck -- USER --> UserDashboard[User Dashboard]
    UserDashboard --> ViewPolicies[View Active Policies]
    UserDashboard --> FileClaim[File New Claim]
    FileClaim --> SubmitClaim[Submit Description, Amount & Document]
    SubmitClaim --> PendingState[Claim status: PENDING]
    
    %% Admin Flow
    RoleCheck -- ADMIN --> AdminDashboard[Admin Dashboard]
    AdminDashboard --> ReviewClaims[Review Pending Claims]
    ReviewClaims --> ApproveReject{Approve or Reject?}
    ApproveReject -- Approve --> ApprovedState[Claim status: APPROVED]
    ApprovedState --> UpdateBalance[Deduct Claim Amount from Policy Remaining Balance]
    ApproveReject -- Reject --> RejectedState[Claim status: REJECTED]
    
    PendingState --> ReviewClaims
    UpdateBalance --> End([End Cycle])
    RejectedState --> End
```

---

## 🔄 Workflow

1. **User Onboarding**:
   * Users sign up via the Auth portal. The system assigns them the role of `USER` (or `ADMIN` depending on credentials).
   
2. **Dashboard Overview**:
   * **Users**: View active policies, coverages, remaining balance, and historical claims.
   * **Admins**: Monitor all users, active policies, and claim pending statistics.

3. **Claim Submission**:
   * The user selects an active policy and submits a claim specifying the provider, date of service, description, claim amount, and an attached receipt (Base64 encoded).

4. **Claims Processing**:
   * Admins evaluate claims.
   * **Approved**: The claim amount is deducted from the associated policy's `remainingBalance`.
   * **Rejected**: The status is updated with reviewer feedback remarks.

---

## 🗄️ Database ER Diagram

The database uses three principal entities: `User`, `Policy`, and `Claim`. Below is the entity-relationship model.

```mermaid
erDiagram
    USER ||--o{ POLICY : owns
    USER ||--o{ CLAIM : submits
    
    USER {
        Long id PK
        String email UK
        String password
        String fullName
        String role "USER / ADMIN"
    }

    POLICY {
        Long id PK
        String policyNumber UK
        String policyName
        String policyType "Health, Dental, Vision, Life"
        Double coverageLimit
        Double remainingBalance
        Double deductible
        Double premiumAmount
        String status "Active, Suspended, Expired"
        Long user_id FK
    }

    CLAIM {
        Long id PK
        String policyNumber
        LocalDate serviceDate
        Double claimAmount
        String provider
        String description
        String status "Pending, Under Review, Approved, Rejected"
        String remarks
        LocalDate submissionDate
        String fileName
        String fileType
        String documentBase64
        Long user_id FK
    }
```

---

## 🛠️ Tech Stack
* **Backend**: Java 17, Spring Boot, Spring Data JPA, H2 Database (In-Memory)
* **Frontend**: Vanilla CSS, JavaScript (ES6+, Fetch API), Semantic HTML5
