"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RichTextEditor({
  label,
  value,
  onChange,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[240px] px-[22px] py-4 text-base text-[#565656] outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  return (
    <div className="relative w-full">
      <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[14px] font-bold text-dark">
        {label}
      </label>
      <div className={`overflow-hidden rounded-xl border border-[#DCDCDC] bg-white transition-all duration-200 focus-within:border-primary ${
        disabled
          ? "bg-gray-50 opacity-75"
          : "hover:border-primary hover:shadow-[0_4px_12px_rgba(7,162,162,0.08)]"
      }`}>
        <div className="flex flex-wrap items-center gap-1 border-b border-[#EAEAEA] bg-[#FAFAFA] px-3 py-2">
          <ToolbarButton
            label="หัวข้อ"
            disabled={disabled}
            active={editor?.isActive("heading", { level: 2 }) ?? false}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            icon={<Heading2 size={16} />}
          />
          <ToolbarButton
            label="ตัวหนา"
            disabled={disabled}
            active={editor?.isActive("bold") ?? false}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            icon={<Bold size={16} />}
          />
          <ToolbarButton
            label="ตัวเอียง"
            disabled={disabled}
            active={editor?.isActive("italic") ?? false}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            icon={<Italic size={16} />}
          />
          <ToolbarButton
            label="โค้ด"
            disabled={disabled}
            active={editor?.isActive("code") ?? false}
            onClick={() => editor?.chain().focus().toggleCode().run()}
            icon={<Code size={16} />}
          />
          <span className="mx-1 h-5 w-px bg-[#DCDCDC]" />
          <ToolbarButton
            label="รายการ"
            disabled={disabled}
            active={editor?.isActive("bulletList") ?? false}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            icon={<List size={16} />}
          />
          <ToolbarButton
            label="รายการลำดับ"
            disabled={disabled}
            active={editor?.isActive("orderedList") ?? false}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            icon={<ListOrdered size={16} />}
          />
          <ToolbarButton
            label="อ้างอิง"
            disabled={disabled}
            active={editor?.isActive("blockquote") ?? false}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            icon={<Quote size={16} />}
          />
          <span className="mx-1 h-5 w-px bg-[#DCDCDC]" />
          <ToolbarButton
            label="ย้อนกลับ"
            disabled={disabled}
            onClick={() => editor?.chain().focus().undo().run()}
            icon={<Undo2 size={16} />}
          />
          <ToolbarButton
            label="ทำซ้ำ"
            disabled={disabled}
            onClick={() => editor?.chain().focus().redo().run()}
            icon={<Redo2 size={16} />}
          />
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors ${
        disabled
          ? "cursor-not-allowed text-[#B7B7B7]"
          : active
          ? "bg-primary text-white"
          : "text-[#565656] hover:bg-[#EDF9F9] hover:text-primary"
      }`}
    >
      {icon}
    </button>
  );
}
