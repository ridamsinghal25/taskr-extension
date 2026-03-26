import MarkdownPreview from '@uiw/react-markdown-preview';

type Props = {
  source: string;
};

export function NoteMarkdown({ source }: Props) {
  return (
    <div className='w-full'>
      <MarkdownPreview
       source={source} 
       className="md:min-w-130 lg:min-w-160 p-2 pl-4 rounded-md overflow-x-auto prose dark:prose-invert [&_.anchor]:hidden"
      />
    </div>
  );
}