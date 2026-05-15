import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import {
  actionIconButtonConfig,
  type ActionIconButtonVariant,
} from "./action-button.config";

interface ActionIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: LucideIcon;
  variant: ActionIconButtonVariant;
  iconSize?: number;
  iconStrokeWidth?: number;
}

export function ActionIconButton({
  icon: Icon,
  variant,
  iconSize = 15,
  iconStrokeWidth,
  className,
  type = "button",
  ...props
}: ActionIconButtonProps) {
  const config = actionIconButtonConfig[variant];

  return (
    <button
      type={type}
      aria-label={props["aria-label"] ?? config.label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-opacity hover:opacity-[0.85] disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
      style={{ backgroundColor: config.bg, color: config.text }}
      {...props}
    >
      <Icon size={iconSize} strokeWidth={iconStrokeWidth} />
    </button>
  );
}
