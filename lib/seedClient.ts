let seeded = false;

export async function seedMainAgent() {
  if (seeded) return;
  seeded = true;
  try {
    await fetch("/api/seed");
  } catch {
    // ignore
  }
}
