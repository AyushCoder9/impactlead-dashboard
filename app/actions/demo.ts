"use server";

import { revalidatePath } from "next/cache";
import { updateLeadStatus as updateLeadStatusQuery } from "@/lib/db/queries/leads";

// Demo-only mutations. Deliberately does NOT touch better-auth sessions at
// all, and hard-codes `demo: true` on every call — there is no parameter a
// caller could flip to reach real data.
type Status = "new" | "contacted" | "closed";

export async function updateDemoLeadStatus(input: {
  leadId: string;
  toStatus: Status;
  expectedStatus?: Status;
}) {
  const result = await updateLeadStatusQuery(input.leadId, {
    demo: true,
    toStatus: input.toStatus,
    expectedStatus: input.expectedStatus,
    changedBy: null,
  });

  if (result.ok) {
    revalidatePath("/demo");
  }

  return result;
}
