# HANDOFF — XCODE — 2026-04-09

## SESSION SUMMARY
Work order from Boo: rename Requests → Projects across macOS app.

## CHANGES MADE — Brian_Patrick_McAllorum_MacOS_App

### Files Modified
- `Views/RequestsView.swift` — DELETED (moved to trash)
- `Views/ProjectsView.swift` — CREATED (full rename of all types, vars, labels)
- `ContentView.swift` — `case .requests` → `case .projects`, `RequestsView` → `ProjectsView`
- `Brian_Patrick_McAllorum_MacOS_AppApp.swift` — `case requests` → `case projects`, `Button("Requests")` → `Button("Projects")`, `.requests` → `.projects`

### What Changed Inside ProjectsView.swift
- `struct PipelineRequest` → `struct PipelineProject`
- `struct RequestsView` → `struct ProjectsView`
- `struct RequestRowView` → `struct ProjectRowView`
- All `requests` variables → `projects`
- All `selectedRequest` → `selectedProject`
- All `request` params → `project`
- Text: "Request Pipeline" → "Project Pipeline"
- Text: "requests" count → "projects"
- Text: "Loading requests from Ember..." → "Loading projects from Ember..."
- Text: "No Requests" → "No Projects"
- Text: "Select a request to view..." → "Select a project to view..."
- Functions: `loadRequests()` → `loadProjects()`, `sortedRequests` → `sortedProjects`
- Note: DB entity_type string "REQUEST" left unchanged (database value, not a label)

### Build Result
- ZERO ERRORS — builds clean

## i-know-brian (My-New-Universe)
- Work order listed this app as also affected
- No Requests-related Swift files found in this session's scope (separate Xcode project)
- Boo should verify if My-New-Universe has any Requests references needing rename

## PENDING
- My-New-Universe Requests → Projects check (if applicable)

-HANDOFF-XCODE-
