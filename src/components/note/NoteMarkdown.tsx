import ReactMarkdown from "react-markdown";

type Props = {
  source: string;
  className?: string;
};

export function NoteMarkdown({ source, className = "" }: Props) {
  return (
    <div
      className={`max-w-none text-sm leading-relaxed text-foreground/95 [&_a]:wrap-break-word [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-muted/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted/80 [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold ${className}`}
    >
      <ReactMarkdown>{source}</ReactMarkdown>
    </div>
  );
}
