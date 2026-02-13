import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import type { ComponentPropsWithoutRef } from 'react';

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) => {
            if (href?.startsWith('#')) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(href.slice(1));
                    target?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
