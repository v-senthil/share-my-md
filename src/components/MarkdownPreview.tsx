import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
}

const MarkdownPreview = ({ content }: MarkdownPreviewProps) => {
  if (!content.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground italic font-body">
        Start typing to see your markdown rendered here…
      </div>
    );
  }

  return (
    <div className="prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
