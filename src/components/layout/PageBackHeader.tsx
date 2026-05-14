import { ArrowLeft } from "lucide-react";

interface PageBackHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
}

export function PageBackHeader({
  title,
  description,
  onBack,
}: PageBackHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <button
        type="button"
        onClick={onBack}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#EAEAEA] text-[#565656] hover:border-primary hover:text-primary transition-colors"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">{description}</p>
      </div>
    </div>
  );
}
