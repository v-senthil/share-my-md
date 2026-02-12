import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MarkdownPreview from '@/components/MarkdownPreview';
import ShareDialog from '@/components/ShareDialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Share2, FileText, Plus, Eye, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_MD = `# Welcome to MarkView

Write your **markdown** here and see it rendered in real-time.

## Features

- 📝 Live editing with instant preview
- 🔗 Share documents with a public URL
- ✨ GitHub Flavored Markdown support

## Code Example

\`\`\`javascript
const hello = () => {
  console.log("Hello, world!");
};
\`\`\`

> "The best way to predict the future is to create it."

---

| Feature | Status |
|---------|--------|
| Editor  | ✅ Ready |
| Preview | ✅ Ready |
| Sharing | ✅ Ready |
`;

const Index = () => {
  const [title, setTitle] = useState('Untitled');
  const [content, setContent] = useState(SAMPLE_MD);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const saveAndShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const shareId = crypto.randomUUID().slice(0, 8);

      if (documentId) {
        await supabase
          .from('documents')
          .update({ title, content, share_id: shareId, is_shared: true })
          .eq('id', documentId);
      } else {
        const { data, error } = await supabase
          .from('documents')
          .insert({ title, content, share_id: shareId, is_shared: true })
          .select('id')
          .single();

        if (error) throw error;
        setDocumentId(data.id);
      }

      const url = `${window.location.origin}/view/${shareId}`;
      setShareUrl(url);
      toast.success('Share link generated!');
    } catch (err) {
      toast.error('Failed to generate share link');
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  }, [title, content, documentId]);

  const handleNew = () => {
    setTitle('Untitled');
    setContent('');
    setDocumentId(null);
    setShareUrl(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-display text-xl tracking-tight">MarkView</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleNew} className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShareOpen(true);
                if (!shareUrl) setShareUrl(null);
              }}
              className="gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Title */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 pb-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-none shadow-none text-2xl font-display px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground"
          placeholder="Document title…"
        />
      </div>

      {/* Mobile tab switcher */}
      <div className="md:hidden flex border-b border-border mx-4">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'edit'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
      </div>

      {/* Editor & Preview */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4">
        <div className="grid md:grid-cols-2 gap-4 h-[calc(100vh-180px)]">
          {/* Editor */}
          <div className={`flex flex-col ${activeTab === 'preview' ? 'hidden md:flex' : ''}`}>
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <Edit3 className="w-3 h-3" />
              Editor
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none font-mono text-sm leading-relaxed bg-card border-border focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg p-4"
              placeholder="Write your markdown here…"
            />
          </div>

          {/* Preview */}
          <div className={`flex flex-col ${activeTab === 'edit' ? 'hidden md:flex' : ''}`}>
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <Eye className="w-3 h-3" />
              Preview
            </div>
            <div className="flex-1 overflow-y-auto bg-card border border-border rounded-lg p-6">
              <MarkdownPreview content={content} />
            </div>
          </div>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        shareUrl={shareUrl}
        onShare={saveAndShare}
        isSharing={isSharing}
      />
    </div>
  );
};

export default Index;
