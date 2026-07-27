const TODO_ITEMS = [
  "Book doctors appointment",
  "Take a walk",
  "Write gratitude list",
  "Declutter small area",
  "Try new recipe",
  "Send positive text",
  "Spend 15 minutes stretching",
  "Read a book chapter",
  "Listen to a podcast",
  "Write journal entry",
  "Take a break",
  "Organize your desktop",
  "Plan a future weekend",
  "Learn a new word",
  "Water your plants",
  "Create a playlist",
  "Watch a TED Talk",
  "Do workout routine",
  "Appreciate nature",
  "Solve a puzzle",
  "Write encouragement",
];

function randomItem() {
  return TODO_ITEMS[Math.floor(Math.random() * TODO_ITEMS.length)];
}

export default randomItem;
