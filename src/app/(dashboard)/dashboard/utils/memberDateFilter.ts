export type MemberQuickFilter = "7" | "30" | "90" | "CUSTOM" | "";

export function getMemberDateFilterParams(
  quickFilter: MemberQuickFilter,
  customFrom: string,
  customTo: string
) {
  if (quickFilter === "CUSTOM") {
    return {
      createdFrom: customFrom || undefined,
      createdTo: customTo || undefined,
    };
  }

  const range = getMemberDateRange(quickFilter);

  return {
    createdFrom: range?.from ? formatDate(range.from) : undefined,
    createdTo: range?.to ? formatDate(range.to) : undefined,
  };
}

function getMemberDateRange(quickFilter: MemberQuickFilter) {
  if (!quickFilter) return null;

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

function formatDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
