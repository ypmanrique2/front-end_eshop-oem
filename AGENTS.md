1. Project Skills Index

This file defines the Skill Registry used by all sub-agents operating in this project.

It provides:

Available skills
Trigger conditions
Execution paths
Operational conventions

This registry is the single source of truth for agent behavior.

2. Available Skills
Trigger
Code review request
Architecture audit request
SOLID compliance validation
Pattern evaluation
Structural refactoring analysis
Paths

Codex Path

C:\Users\yadin\.agents\skills

OpenCode Path

C:\Users\yadin\.agents\skills

Antigravity Path

C:\Users\yadin\.agents\skills
Skills
Code review
Architecture audit
SOLID analysis
Evaluate design patterns
Review structural architecture
3. How Sub-Agents Use This

All sub-agents MUST follow this lifecycle:

The skill registry (/skill-registry or /sdd-init) scans this file
It gets persisted into:
.atl/skill-registry.md
Engram memory layer
Every sub-agent reads the registry as its FIRST step
The agent matches the task against available triggers
If a match is found:
The corresponding skill is loaded
Execution follows the defined conventions strictly

Failure to load the registry = invalid execution.

4. Execution Model
4.1 Deterministic Behavior

Agents MUST:

Avoid assumptions
Avoid vague interpretations
Operate only on verifiable code or input
4.2 Priority Order
Correctness
Architecture integrity
Maintainability
Performance
Developer Experience (DX)
4.3 Output Constraints

All outputs MUST be:

Structured
Deterministic
Actionable

No filler text. No generic advice.

5. Project Conventions
5.1 Architecture Review Standard

All architecture reviews MUST follow:

[SEVERITY] TYPE

File:
Line:

Problem:
WHY:

Fix:
5.2 Severity Levels
CRITICAL → Breaks system, security, or scalability
WARNING → Risk of failure or bad practice
SUGGESTED → Improvement opportunity
5.3 Mandatory Rules

Every finding MUST include:

File path
Line reference
Clear description
WHY it is a problem
Concrete FIX (code-level if possible)
5.4 Forbidden Output

Agents MUST NOT:

Give vague feedback
Say “consider improving” without solution
Provide generic best practices without context
Skip technical justification
6. SOLID Enforcement

All reviews MUST validate:

S → Single Responsibility Principle
O → Open/Closed Principle
L → Liskov Substitution Principle
I → Interface Segregation Principle
D → Dependency Inversion Principle

Each violation MUST include:

Impact analysis
Refactoring proposal
7. Pattern Evaluation Rules

When evaluating patterns, agents MUST:

Identify the current pattern (if any)
Validate correctness of implementation
Detect anti-patterns
Recommend:
Keep
Refactor
Replace
8. Architecture Standards

Expected architecture styles:

Layered (Controller → UseCase → Domain → Repository)
Hexagonal (Ports & Adapters)
Microservices-ready separation
8.1 Anti-Patterns to Detect
God classes
Tight coupling
Anemic domain
Business logic inside controllers
Improper DTO usage
Mixed responsibilities
9. Code Review Protocol
9.1 Mandatory Checks
Naming consistency
Method size and cohesion
Dependency direction
Exception handling
Transaction boundaries
Data integrity
9.2 Output Format Example
CRITICAL - SOLID VIOLATION

File: ProductService.java
Line: 45

Problem:
Service is handling persistence and business logic.

WHY:
Violates Single Responsibility Principle and reduces maintainability.

Fix:
Extract business logic into a UseCase class and delegate persistence to repository.
10. Multi-Agent Coordination
10.1 Rules
One agent = one responsibility
No overlapping analysis
No duplicated findings
10.2 Shared Context

Agents MUST:

Use registry as source of truth
Share findings through structured output
Avoid re-processing same files
11. Performance Considerations

Agents MUST detect:

N+1 queries
Missing caching strategies
Inefficient loops
Blocking operations
12. Security Considerations

Mandatory checks:

Input validation
Authentication/authorization gaps
Sensitive data exposure
Injection vulnerabilities
13. Final Rule

If feedback is not:

precise
actionable
technically justified

-> It MUST NOT be returned.