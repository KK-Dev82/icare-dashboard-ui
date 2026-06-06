import type { Member } from "@/types/member";

export type MemberQuickFilter = "7" | "30" | "90" | "CUSTOM" | "";

export function filterMembersByQuickRange(
  members: Member[],
  quickFilter: MemberQuickFilter,
  customFrom: string,
  customTo: string
) {
  const range = getMemberDateRange(quickFilter, customFrom, customTo);

  if (!range) return members;

  return members.filter((member) => {
    const createdAt = new Date(member.createdAt);
    if (Number.isNaN(createdAt.getTime())) return false;
    if (range.from && createdAt < range.from) return false;
    if (range.to && createdAt > range.to) return false;
    return true;
  });
}

function getMemberDateRange(
  quickFilter: MemberQuickFilter,
  customFrom: string,
  customTo: string
) {
  if (!quickFilter) return null;

  if (quickFilter === "CUSTOM") {
    return {
      from: customFrom ? startOfDay(new Date(customFrom)) : null,
      to: customTo ? endOfDay(new Date(customTo)) : null,
    };
  }

  const to = endOfDay(new Date());
  const from = startOfDay(new Date());

  if (quickFilter === "90") {
    from.setMonth(from.getMonth() - 3);
  } else {
    from.setDate(from.getDate() - Number(quickFilter) + 1);
  }

  return { from, to };
}

function startOfDay(value: Date) {
  const nextValue = new Date(value);
  nextValue.setHours(0, 0, 0, 0);
  return nextValue;
}

function endOfDay(value: Date) {
  const nextValue = new Date(value);
  nextValue.setHours(23, 59, 59, 999);
  return nextValue;
}
