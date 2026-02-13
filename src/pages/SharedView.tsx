import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MarkdownPreview from '@/components/MarkdownPreview';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SharedView = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [document, setDocument] = useState<{ title: string; content: string; created_at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!shareId) return;

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('title, content, created_at')
        .eq('share_id', shareId)
        .eq('is_shared', true)
        .maybeSingle();

      if (fetchError || !data) {
        setError(true);
      } else {
        setDocument(data);
      }
      setLoading(false);
    };

    fetchDocument();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-body">Loading document…</div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground font-body">Document not found or is no longer shared.</p>
        <Button asChild variant="outline">
          <Link to="/" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Create your own
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl tracking-tight">MarkView</span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">New Document</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="font-display text-3xl mb-2">{document.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Shared on {new Date(document.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 overflow-x-auto">
          <MarkdownPreview content={document.content} />
        </div>
      </main>
    </div>
  );
};

export default SharedView;
