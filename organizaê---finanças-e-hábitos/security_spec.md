# Security Specification - Organizaê

## Data Invariants
- A transaction must always belong to the authenticated user (`userId == auth.uid`).
- A goal must always belong to the authenticated user (`userId == auth.uid`).
- A reminder must always belong to the authenticated user (`userId == auth.uid`).
- Users can only read and write their own profile and data.
- Timestamps must be server-generated.
- Amounts must be positive numbers (or at least valid numbers).

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Creating a transaction with someone else's `userId`.
2. **Unauthorized Read**: Trying to read another user's transactions collection.
3. **Ghost Field Update**: Adding an `isVip: true` field to a user profile.
4. **Invalid Type**: Setting `amount` to a string "100" instead of a number.
5. **ID Poisoning**: Using a 2KB string as a transaction ID.
6. **Negative Amount**: (Optional depending on app logic, but let's say amount must be valid).
7. **Future Creation**: Sending a `createdAt` timestamp from the future (client-side).
8. **Bypassing Hierarchy**: Writing to a random collection like `/config`.
9. **PII Leak**: Non-owner trying to 'get' a user document to see their email.
10. **Shadow Transaction**: Modifying `userId` of an existing transaction to transfer it to a different user.
11. **Excessive Array**: Creating a goal with 10,000 `completedDates`.
12. **Status Shortcutting**: (Not applicable here as we don't have complex states yet, but let's say modifying `email` after creation).

## Test Runner (firestore.rules.test.ts)
I'll implement the rules first and then ensure they are tested.
