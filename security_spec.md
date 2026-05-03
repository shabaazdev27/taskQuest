# Security Specification: TaskQuest

## Data Invariants
1. A Quest cannot exist without a valid creatorId that matches the authenticated user's UID.
2. Users can only modify their own User profile (except for system-managed fields like XP if we had a more complex backend, but for now we'll allow self-updates for the gamified feel, but restricted roles).
3. Chat messages must have a senderId matching the user's UID.
4. Quests can only be updated by their creator or assigned users.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Theft**: Create a quest with `creatorId` of another user.
2. **XP Spoof**: Update `users/{uid}` to directly set `xp: 999999`.
3. **Shadow Field**: Add `isAdmin: true` to a user profile update.
4. **Id Poisoning**: Use a 2KB string as a `questId`.
5. **Relational Bypass**: Create a `quest` as a user who isn't signed in.
6. **State Shortcut**: Update a quest directly to `status: 'Completed'` without it ever being `Active`. (Actually allowed in this simple version, but we should track state transitions).
7. **PII Leak**: Read `users/{otherUid}` to get private data (we'll separate public/private).
8. **Spam**: Send a message with 1MB of text.
9. **Orphaned Write**: Create a message for a quest that doesn't exist.
10. **Role Escalation**: Update another user's quest.
11. **Time Travel**: Set `createdAt` to a future date in the past.
12. **Blanket Read**: Query all quests without a `where` filter on `creatorId`.

## Firestore Rules Pattern
- Use `isValidId()` for all path variables.
- Use `isValidQuest()` for validation.
- Implement action-based updates.
