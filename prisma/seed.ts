import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const problems = [
  ['Lock an N-ary Tree', 'Medium', 'Tree / Concurrency', 'Implement lock, unlock, and upgrade operations for an N-ary tree. A node may be locked only when no ancestor or descendant is locked.', 'class LockingTree {\n  lock(node: number, user: number): boolean {\n    // your solution\n    return false;\n  }\n}'],
  ['Upgrade a Resource Branch', 'Hard', 'Tree / Concurrency', 'Upgrade a node when all locked descendants belong to one user. Preserve the resource-locking invariants.', 'function upgrade(node: number, user: number): boolean {\n  // validate descendants and unlock atomically\n  return false;\n}'],
  ['Concurrent Folder Reservations', 'Medium', 'Tree / Systems', 'Design a thread-safe hierarchical reservation service. Explain its consistency strategy before coding.', 'interface ReservationService {\n  reserve(path: string, actor: string): boolean;\n}'],
  ['Lock Escalation Metrics', 'Medium', 'Tree / Data structures', 'Return whether a lock operation is legal in O(h) time. Choose and maintain augmented metadata.', 'type Node = { parent?: Node; lockedDescendants: number };'],
  ['Deadlock-Free Space Allocation', 'Hard', 'Graph / Concurrency', 'Allocate connected co-working spaces to concurrent clients without deadlocks or double booking.', 'function allocate(request: Request): Allocation | null {\n  // reason about ordering\n  return null;\n}']
] as const;

async function main() {
  for (const [title, difficulty, category, description, starterCode] of problems) {
    await prisma.problem.upsert({ where: { title }, update: {}, create: { title, difficulty, category, description, starterCode } });
  }
}
main().finally(() => prisma.$disconnect());
