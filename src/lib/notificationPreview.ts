import type { NotificationPreviewContent } from "@/components/notification/NotificationPreviewCard";

export interface NotificationSendSource {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  mainImage?: string | null;
  bannerImage?: string | null;
  expiredAt?: string | null;
  category?: { name: string };
}

export function buildContentNotificationPreview(
  source: NotificationSendSource,
  type: "news" | "product",
): NotificationPreviewContent {
  const isProduct = type === "product";
  const categoryName = source.category?.name?.trim();
  const isPromotion = isPromotionCategory(categoryName);
  const image = isPromotion
    ? source.bannerImage || source.mainImage || undefined
    : source.mainImage || source.bannerImage || undefined;
  const contentDetails = extractContentLines(source.content);
  const compactBody = combineCardText(
    source.title,
    source.summary || contentDetails.join(" "),
  );

  if (!isProduct && isPromotion) {
    const promotionDetails: Array<{ text: string }> = [];

    if (contentDetails[0]) {
      promotionDetails.push({ text: contentDetails[0] });
    }

    if (source.expiredAt) {
      promotionDetails.push({ text: `ถึง ${formatThaiDate(source.expiredAt)}` });
    } else if (contentDetails[1]) {
      promotionDetails.push({ text: contentDetails[1] });
    }

    return {
      title: "🎁 โปรโมชั่นใหม่สำหรับคุณ",
      compactBody,
      reference: source.summary || source.title,
      image,
      imageAlt: source.title,
      details: promotionDetails.length > 0 ? promotionDetails : undefined,
    };
  }

  if (!isProduct) {
    return {
      title: "📰 ข่าวสารจาก ICI Insurance",
      compactBody,
      reference: combineCardText(source.title, source.summary),
      details:
        contentDetails.length > 0
          ? contentDetails.map((text) => ({ text }))
          : undefined,
      image,
      imageAlt: source.title,
    };
  }

  return {
    title: "📦 ผลิตภัณฑ์แนะนำสำหรับคุณ",
    compactBody,
    reference: source.title,
    message: source.summary || undefined,
    image,
    imageAlt: source.title,
    imageBadge: categoryName,
    details:
      contentDetails.length > 0
        ? contentDetails.map((text) => ({ text }))
        : undefined,
  };
}

export function buildContentNotificationBody(
  source: NotificationSendSource,
  type: "news" | "product",
  preview = buildContentNotificationPreview(source, type),
) {
  if (type === "product") {
    return source.summary
      ? `${source.title}\n${source.summary}`
      : source.title;
  }

  const summary = preview.message || preview.reference || source.summary || source.title;
  const details = preview.details?.map((detail) => detail.text).join("\n");
  return details ? `${summary}\n─────────────────\n${details}` : summary;
}

export function isPromotionCategory(categoryName?: string | null) {
  const normalizedCategory = categoryName?.toLocaleLowerCase() ?? "";
  return (
    normalizedCategory.includes("โปรโม") ||
    normalizedCategory.includes("promotion") ||
    normalizedCategory.includes("promo")
  );
}

function formatThaiDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function extractContentLines(content?: string | null) {
  if (!content) return [];

  return content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function combineCardText(title: string, body?: string | null) {
  const normalizedTitle = title.trim();
  const normalizedBody = body?.replace(/\s+/g, " ").trim();

  if (!normalizedBody || normalizedBody === normalizedTitle) {
    return normalizedTitle;
  }

  return `${normalizedTitle} ${normalizedBody}`;
}
