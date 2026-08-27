import Image, { type StaticImageData } from "next/image";
import iciLogo from "@/../assets/ici.png";

export type NotificationPreviewPlatform = "android" | "ios" | "in-app";

export interface NotificationPreviewContent {
  title: string;
  compactBody?: string;
  reference?: string;
  previousValue?: string;
  message?: string;
  image?: StaticImageData | string;
  imageAlt?: string;
  imageBadge?: string;
  details?: Array<{
    icon?: string;
    text: string;
  }>;
}

interface NotificationPreviewCardProps {
  platform: NotificationPreviewPlatform;
  content?: NotificationPreviewContent;
  variant?: "compact" | "expanded";
  expandToContent?: boolean;
}

export function NotificationPreviewCard({
  platform,
  content,
  variant = "compact",
  expandToContent = false,
}: NotificationPreviewCardProps) {
  if (!content) {
    return (
      <div className="flex h-full min-h-[64px] w-full items-center justify-center rounded-[12px] border border-[#D5DADD] bg-white px-3 py-2 text-sm text-[#B1B7BA]">
        - ไม่มี -
      </div>
    );
  }

  if (platform === "android") {
    return (
      <AndroidNotificationCard
        content={content}
        variant={variant}
        expandToContent={expandToContent}
      />
    );
  }

  if (platform === "ios") {
    return (
      <IOSNotificationCard
        content={content}
        variant={variant}
        expandToContent={expandToContent}
      />
    );
  }

  return (
    <InAppNotificationCard
      content={content}
      variant={variant}
      expandToContent={expandToContent}
    />
  );
}

function AndroidNotificationCard({
  content,
  variant,
  expandToContent,
}: {
  content: NotificationPreviewContent;
  variant: "compact" | "expanded";
  expandToContent: boolean;
}) {
  return (
    <div className="w-full overflow-hidden rounded-[14px] bg-[#2B3539] px-3 py-2 text-[#F1F4F5]">
      <div className="mb-1 flex h-[15px] items-center text-[11px] leading-none text-[#C5CED1]">
        <Image
          src={iciLogo}
          alt="iCare"
          className="h-[14px] w-auto opacity-95"
        />
        <span className="ml-1">- ตอนนี้</span>
      </div>

      <div
        className={`relative min-w-0 text-[12px] leading-[14px] ${
          content.image && variant === "compact" ? "min-h-10" : ""
        }`}
      >
        <div
          className={
            content.image && variant === "compact" ? "pr-12" : undefined
          }
        >
          <p
            className={`text-[13px] font-bold leading-[15px] text-white ${
              variant !== "compact" && expandToContent
                ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                : "truncate"
            }`}
          >
            {content.title}
          </p>
          {variant === "compact" ? (
            <CompactNotificationBody
              content={content}
              className="text-[#D4DBDD]"
            />
          ) : (
            <>
              <ReferenceLine
                content={content}
                className={`font-semibold text-[#D4DBDD] ${
                  expandToContent
                    ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                    : "truncate"
                }`}
              />
              {content.message && (
                <p
                  className={`text-[#D4DBDD] ${
                    expandToContent
                      ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                      : "line-clamp-2"
                  }`}
                >
                  {content.message}
                </p>
              )}
              <NotificationDetails
                content={content}
                dividerClassName="bg-[#A6B1B4]"
                textClassName="text-[#E0E5E6]"
                expandToContent={expandToContent}
              />
            </>
          )}
        </div>
        <NotificationContentImage
          content={content}
          variant={variant}
          expandToContent={expandToContent}
        />
      </div>
    </div>
  );
}

function IOSNotificationCard({
  content,
  variant,
  expandToContent,
}: {
  content: NotificationPreviewContent;
  variant: "compact" | "expanded";
  expandToContent: boolean;
}) {
  return (
    <div className="w-full overflow-hidden rounded-[14px] border border-[#E2E5E7] bg-[#ECEFF0] px-3 py-2 text-[#243333]">
      <div className="mb-1 flex h-[17px] w-full items-center text-[11px] leading-none text-[#6A7478]">
        <Image src={iciLogo} alt="iCare" className="h-[14px] w-auto opacity-95" />
        <span className="ml-auto">ตอนนี้</span>
      </div>

      <div
        className={`relative min-w-0 text-[12px] leading-[14px] ${
          content.image && variant === "compact" ? "min-h-10" : ""
        }`}
      >
        <div
          className={
            content.image && variant === "compact" ? "pr-12" : undefined
          }
        >
          <p
            className={`text-[13px] font-bold leading-[15px] text-[#243333] ${
              variant !== "compact" && expandToContent
                ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                : "truncate"
            }`}
          >
            {content.title}
          </p>
          {variant === "compact" ? (
            <CompactNotificationBody
              content={content}
              className="text-[#536165]"
            />
          ) : (
            <>
              <ReferenceLine
                content={content}
                className={`font-semibold text-[#536165] ${
                  expandToContent
                    ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                    : "truncate"
                }`}
              />
              {content.message && (
                <p
                  className={`text-[#536165] ${
                    expandToContent
                      ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                      : "line-clamp-2"
                  }`}
                >
                  {content.message}
                </p>
              )}
              <NotificationDetails
                content={content}
                dividerClassName="bg-[#748287]"
                textClassName="text-[#536165]"
                expandToContent={expandToContent}
              />
            </>
          )}
        </div>
        <NotificationContentImage
          content={content}
          variant={variant}
          expandToContent={expandToContent}
        />
      </div>
    </div>
  );
}

function InAppNotificationCard({
  content,
  variant,
  expandToContent,
}: {
  content: NotificationPreviewContent;
  variant: "compact" | "expanded";
  expandToContent: boolean;
}) {
  return (
    <div className="flex w-full items-start gap-3 overflow-hidden rounded-[14px] border border-[#BCC3C6] bg-white px-4 py-3 text-[#243333]">
      <div className="relative mt-0.5 h-[34px] w-[34px] shrink-0 overflow-hidden">
        <Image
          src={iciLogo}
          alt="iCare"
          className="absolute -left-[9px] -top-[7px] h-[49px] w-auto max-w-none"
        />
      </div>

      <div
        className={`relative min-w-0 flex-1 text-[12px] leading-[14px] ${
          content.image && variant === "compact" ? "min-h-10" : ""
        }`}
      >
        <div
          className={
            content.image && variant === "compact" ? "pr-12" : undefined
          }
        >
          <p
            className={`text-[13px] font-bold leading-[15px] text-[#243333] ${
              variant !== "compact" && expandToContent
                ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                : "truncate"
            }`}
          >
            {content.title}
          </p>
          {variant === "compact" ? (
            <CompactNotificationBody
              content={content}
              className="text-[#536165]"
            />
          ) : (
            <>
              <ReferenceLine
                content={content}
                className={`font-semibold text-[#536165] ${
                  expandToContent
                    ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                    : "line-clamp-2"
                }`}
              />
              {content.message && (
                <p
                  className={`text-[#536165] ${
                    expandToContent
                      ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                      : "line-clamp-2"
                  }`}
                >
                  {content.message}
                </p>
              )}
              <NotificationDetails
                content={content}
                dividerClassName="bg-[#748287]"
                textClassName="text-[#536165]"
                fullWidth
                expandToContent={expandToContent}
              />
            </>
          )}
        </div>
        <NotificationContentImage
          content={content}
          variant={variant}
          expandToContent={expandToContent}
        />
      </div>
    </div>
  );
}

function CompactNotificationBody({
  content,
  className,
}: {
  content: NotificationPreviewContent;
  className: string;
}) {
  const body = getCompactNotificationBody(content);

  if (!body) return null;

  return <p className={`line-clamp-4 ${className}`}>{body}</p>;
}

function getCompactNotificationBody(content: NotificationPreviewContent) {
  if (content.compactBody?.trim()) {
    return normalizeCompactText(content.compactBody);
  }

  const reference = [
    content.reference,
    content.previousValue ? `(${content.previousValue})` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return [reference, content.message]
    .filter(Boolean)
    .map((value) => normalizeCompactText(String(value)))
    .join(" ");
}

function normalizeCompactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function ReferenceLine({
  content,
  className,
}: {
  content: NotificationPreviewContent;
  className: string;
}) {
  if (!content.reference) {
    return null;
  }

  return (
    <p className={className}>
      {content.reference}
      {content.previousValue && (
        <>
          {" ("}
          <span className="line-through">{content.previousValue}</span>
          {")"}
        </>
      )}
    </p>
  );
}

function NotificationDetails({
  content,
  dividerClassName,
  textClassName,
  fullWidth = false,
  expandToContent = false,
}: {
  content: NotificationPreviewContent;
  dividerClassName: string;
  textClassName: string;
  fullWidth?: boolean;
  expandToContent?: boolean;
}) {
  if (!content.details || content.details.length === 0) {
    return null;
  }

  const visibleDetails = expandToContent
    ? content.details
    : content.details.slice(0, 2);

  return (
    <div className="mt-1.5">
      <div
        className={`mb-1 h-px ${fullWidth ? "w-full" : "w-[82%]"} ${dividerClassName}`}
      />
      {visibleDetails.map((detail) => (
        <p
          key={`${detail.icon ?? ""}-${detail.text}`}
          className={`${
            expandToContent
              ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
              : "truncate"
          } ${textClassName}`}
        >
          {detail.icon && <span className="mr-1">{detail.icon}</span>}
          {detail.text}
        </p>
      ))}
    </div>
  );
}

function NotificationContentImage({
  content,
  variant,
  expandToContent,
}: {
  content: NotificationPreviewContent;
  variant: "compact" | "expanded";
  expandToContent: boolean;
}) {
  if (!content.image) {
    return null;
  }

  if (variant === "compact") {
    if (typeof content.image === "string") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.image}
          alt={content.imageAlt ?? ""}
          className="absolute right-0 top-0 h-10 w-10 rounded-[5px] object-cover"
        />
      );
    }

    return (
      <Image
        src={content.image}
        alt={content.imageAlt ?? ""}
        className="absolute right-0 top-0 h-10 w-10 rounded-[5px] object-cover"
      />
    );
  }

  return (
    <div className="relative mt-2 aspect-[2/1] w-full overflow-hidden rounded-[7px]">
      {typeof content.image === "string" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.image}
          alt={content.imageAlt ?? ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <Image
          src={content.image}
          alt={content.imageAlt ?? ""}
          fill
          sizes="300px"
          className="object-cover"
        />
      )}
      {content.imageBadge && (
        <span
          className={`absolute bottom-1 left-1 max-w-[calc(100%-8px)] rounded-[4px] bg-[#00A7A0] px-2 py-1 text-[8px] font-semibold leading-tight text-white ${
            expandToContent
              ? "whitespace-normal break-words [overflow-wrap:anywhere]"
              : "truncate"
          }`}
        >
          {content.imageBadge}
        </span>
      )}
    </div>
  );
}
