---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
handoffs: 
  - label: Build Specification
    agent: speckit.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
---

# Constitution Command

## Purpose

This command creates or updates the project constitution at `.specify/memory/constitution.md`. The constitution defines the non-negotiable technical and governance principles for the project.

## Execution Flow

1. **Load Constitution Template**
   - Read `.specify/memory/constitution.md`
   - Identify placeholder tokens `[ALL_CAPS_IDENTIFIER]`

2. **Collect Values**
   - Use user-provided values from conversation
   - Infer from repo context (package.json, README, etc.)
   - Apply versioning rules (MAJOR.MINOR.PATCH)

3. **Draft Constitution**
   - Replace all placeholders with concrete values
   - Ensure each principle has: name, rule, rationale
   - Validate governance section completeness

4. **Propagate Changes**
   - Update `.specify/templates/plan-template.md`
   - Update `.specify/templates/spec-template.md`
   - Update `.specify/templates/tasks-template.md`
   - Ensure constitution checks align across all templates

5. **Generate Sync Impact Report**
   - Prepend as HTML comment in constitution file
   - Document version changes, modified/added/removed sections

6. **Validation**
   - No unexplained bracket tokens remain
   - Dates in ISO format (YYYY-MM-DD)
   - Principles are declarative and testable

7. **Write Output**
   - Overwrite `.specify/memory/constitution.md`
   - Output summary to user with commit message suggestion

## Constitution Structure

### Required Sections

- **Header:** Project name, version, dates
- **Purpose:** Why this constitution exists
- **Core Principles:** 3-7 principles, each with:
  - Name
  - Rule (declarative, testable)
  - Rationale
- **Governance:** Amendment process, compliance review, versioning
- **Dependencies:** Technical stack assumptions

### Versioning Rules

- **MAJOR:** Breaking principle changes, removals
- **MINOR:** New principles, material expansions
- **PATCH:** Clarifications, typo fixes, wording improvements

## Template Alignment

All templates must reference constitution principles:

- **plan-template.md:** Constitution Alignment Check section
- **spec-template.md:** Constitution Compliance requirements
- **tasks-template.md:** Principle mapping table

## Validation Checklist

- [ ] All placeholders replaced
- [ ] Version incremented correctly
- [ ] Dates in ISO format
- [ ] Each principle has name + rule + rationale
- [ ] Governance section complete
- [ ] Templates updated for consistency
- [ ] Sync Impact Report included

## Usage

```
I need a constitution for [project type] with principles:
1. [Principle 1]
2. [Principle 2]
...
```

Or update existing:

```
Update constitution: change principle 3 to [new description]
```

## Output

- Updated `.specify/memory/constitution.md`
- Sync Impact Report (in file as comment)
- Summary with version bump rationale
- Suggested commit message
