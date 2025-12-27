# Writing Studio Phase 2 + 3

## Phase 2: Feedback & improvement loop (implemented)
- Baseline alignment feedback
- 3-line size/band feedback
- Word spacing feedback (conservative heuristic)
- Smoothness score (simple ratio-based heuristic)
- Review screen to browse recent attempts

## Phase 3: Assignments & review (scaffolding)
- /app/english/writing/assign provides the UI concept
- Teacher-student mappings exist in `teacher_students` (migration 0002)
- Next: add child selection and assignment storage:
  - writing_assignments table
  - writing_assignment_attempts mapping
