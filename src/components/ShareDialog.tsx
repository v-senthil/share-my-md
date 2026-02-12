import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, Link } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string | null;
  onShare: () => Promise<void>;
  isSharing: boolean;
}

const ShareDialog = ({ open, onOpenChange, shareUrl, onShare, isSharing }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Share Document</DialogTitle>
          <DialogDescription>
            Generate a public link anyone can use to view this document.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!shareUrl ? (
            <Button
              onClick={onShare}
              disabled={isSharing}
              className="w-full gap-2"
            >
              <Link className="w-4 h-4" />
              {isSharing ? 'Generating link…' : 'Generate Public Link'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
