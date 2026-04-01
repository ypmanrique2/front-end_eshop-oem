# eShop SaaS (MCP Optimized)
1. Skill Resolution Protocol (MANDATORY)

Root:

C:\Users\yadin\.agents\skills

Rules:

Match task → trigger → load skill → execute
If no match → STOP (no assumptions)
No inline logic outside skills
Registry
Architecture Review
Triggers: architecture-audit, SOLID
Path: codex\arch-review.md
Backend (Java / Spring Boot)
Triggers: backend-dev, use-case, domain-model
Path: codex\java-backend.md
Database (PostgreSQL)
Triggers: db-migration, acid, transactions
Path: codex\postgres-persistence.md
Frontend (Next.js / React)
Triggers: react-ui, frontend-integration
Path: codex\react-frontend.md
2. Multi-Agent Execution Model
Planner → selects skills
Executor → implements
Reviewer → validates
Review Format (MANDATORY)
[SEVERITY]

File:
Line:

Problem:
WHY:
Fix:

Severity:

CRITICAL → breaks system/security
WARNING → bad practice
SUGGESTED → improvement
3. Backend Architecture (STRICT)

Structure:

controller → application → domain → infrastructure

Rules:

Domain = PURE Java (no Spring)
Controllers = NO business logic
DTOs = Java Records ONLY
UseCases = orchestration layer

Modules:

/auth
/product
/order
/shared

X Cross-module coupling = CRITICAL

4. Security Model
Current Strategy
Stateless JWT (Spring Security)
Future: Keycloak (OIDC)
Rules
All protected routes require token
/api/auth/** → public
/api/hello/** → public (health/test only)
5. Keycloak Integration Contract

User model MUST include:

id
email
role
keycloak_id

Sync rule:

if (!exists(keycloak_id)) → create user

Keycloak handles:

authentication
credentials
token issuance

Backend handles:

roles
business rules
6. Database Rules (PostgreSQL 18+)
PK → GENERATED AS IDENTITY
Migrations → Flyway ONLY
Transactions → REQUIRED (@Transactional)
No direct stock mutation without audit

Audit table REQUIRED:

inventory_transactions
7. Frontend Architecture (STRICT)

Flow:

UI → hooks → services → API

Rules:

X No API calls in components
X No auth logic in UI
X No duplicated state
8. Auth Flow (Target)
Frontend → Keycloak → Backend → DB

Steps:

Login → Keycloak
Token issued
Backend validates
User synced
Access granted
9. Performance Constraints

Backend:

Prevent N+1 queries
Use pagination
Use caching (Redis)

Frontend:

Avoid re-renders
Lazy load
Use server components when possible
10. Security Constraints

MUST validate:

Input data
JWT signature
Role-based access
No sensitive data exposure
11. SOLID Enforcement

All code MUST respect:

SRP
OCP
LSP
ISP
DIP

Violations → mandatory fix

12. Anti-Patterns (AUTO FAIL)
God classes
Tight coupling
Business logic in controllers
Anemic domain
Mixed responsibilities
13. Technical Debt Policy

If introduced:

Flag it
Explain impact
Provide alternative
14. Final Rule

If output is not:

precise
actionable
technically justified

→ DO NOT RETURN