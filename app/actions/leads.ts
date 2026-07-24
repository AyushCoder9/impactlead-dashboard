"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updateLeadStatus as updateLeadStatusQuery } from "@/lib/db/queries/leads";

type Status = "new" | "contacted" | "closed";

export async function updateLeadStatus(input: {
  leadId: string;
  toStatus: Status;
  expectedStatus?: Status;
}) {
  // Server Actions get Next.js's built-in same-origin/CSRF protection, but
  // that's not authorization — every call still re-verifies the session.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false as const, reason: "unauthorized" as const };
  }

  const result = await updateLeadStatusQuery(input.leadId, {
    demo: false,
    toStatus: input.toStatus,
    expectedStatus: input.expectedStatus,
    changedBy: session.user.id,
  });

  if (result.ok) {
    revalidatePath("/admin");
  }

  return result;
}

export async function bulkUpdateLeadStatus(input: {
  leadIds: string[];
  toStatus: Status;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false as const, reason: "unauthorized" as const };
  }

  const results = await Promise.all(
    input.leadIds.map((leadId) =>
      updateLeadStatusQuery(leadId, {
        demo: false,
        toStatus: input.toStatus,
        changedBy: session.user.id,
      }),
    ),
  );

  revalidatePath("/admin");
  return { ok: true as const, updated: results.filter((r) => r.ok).length };
}
