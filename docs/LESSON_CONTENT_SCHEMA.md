# Lesson `content_json` Schema (v1)

This document defines the canonical JSON structure stored in `public.lessons.content_json`.

## Design goals

- Minimum 15 minutes of learning per lesson (structure supports ~15–25 minutes).
- Age-appropriate explanations and worked examples.
- Real-world application + memory strategies to support retention.
- Multiple scenarios and questions to promote transfer.
- A quiz section to support retrieval practice.

## JSON shape

See `docs/lesson_content_schema.json` for the machine-readable schema.

### Required fields

- `duration_minutes` (int, >= 15)
- `objective` (string)
- `explanation` (string)
- `real_world_application` (string)
- `memory_strategies` (string[])
- `worked_example` (string)
- `scenarios` (array of scenario objects)
- `quiz` (array of quiz question objects)

## Example

```json
{
  "duration_minutes": 15,
  "objective": "Count objects to 10 and match the number to a numeral.",
  "explanation": "Counting means saying number words in order while touching each object once. The last number you say tells you how many there are.",
  "real_world_application": "Count toys as you pack them away, or count steps as you walk to the door.",
  "memory_strategies": [
    "Touch-and-count: touch each object once.",
    "Last number tells the total: stop and say it again."
  ],
  "worked_example": "There are 6 apples. Touch each apple and count: 1,2,3,4,5,6. The last number is 6, so there are 6 apples.",
  "scenarios": [
    {
      "context": "At snack time, you have grapes on your plate.",
      "questions": [
        { "prompt": "Count 7 grapes. What number do you say last?", "answer": "7" },
        { "prompt": "If you move one grape away, how many are left?", "answer": "6" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which number shows 'five'?",
      "options": ["3", "5", "8", "10"],
      "answer": "5",
      "explanation": "The numeral 5 represents five."
    },
    {
      "question": "You count: 1,2,3,4. How many blocks are there?",
      "options": ["3", "4", "5"],
      "answer": "4",
      "explanation": "The last number said is 4, so there are 4 blocks."
    },
    {
      "question": "If you have 6 cookies and eat 1, how many are left?",
      "options": ["5", "6", "7"],
      "answer": "5",
      "explanation": "Taking 1 away from 6 leaves 5."
    }
  ]
}
```

## Notes for CSV imports

- Store this JSON as a string in the `content_json` column.
- Ensure the JSON is valid (use double quotes, no trailing commas).
- Keep `topic` non-null if your schema requires it.

