import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileType, File } from 'lucide-react';
import { toast } from 'sonner';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

interface ExportMenuProps {
  title: string;
  content: string;
  previewRef: React.RefObject<HTMLDivElement>;
}

const ExportMenu = ({ title, content, previewRef }: ExportMenuProps) => {
  const exportMd = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${title || 'document'}.md`);
    toast.success('Exported as Markdown');
  };

  const exportPdf = async () => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let y = 20;

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text(title || 'Untitled', margin, y);
      y += 12;

      // Content - simple line-by-line rendering
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);

      const lines = content.split('\n');
      for (const line of lines) {
        // Handle headings
        if (line.startsWith('# ')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(16);
          y += 4;
          const wrapped = pdf.splitTextToSize(line.replace(/^#+\s/, ''), maxWidth);
          for (const w of wrapped) {
            if (y > 280) { pdf.addPage(); y = 20; }
            pdf.text(w, margin, y);
            y += 8;
          }
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
        } else if (line.startsWith('## ')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          y += 3;
          const wrapped = pdf.splitTextToSize(line.replace(/^#+\s/, ''), maxWidth);
          for (const w of wrapped) {
            if (y > 280) { pdf.addPage(); y = 20; }
            pdf.text(w, margin, y);
            y += 7;
          }
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
        } else if (line.startsWith('### ')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          y += 2;
          const wrapped = pdf.splitTextToSize(line.replace(/^#+\s/, ''), maxWidth);
          for (const w of wrapped) {
            if (y > 280) { pdf.addPage(); y = 20; }
            pdf.text(w, margin, y);
            y += 6;
          }
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
        } else if (line.trim() === '') {
          y += 4;
        } else if (line.startsWith('---')) {
          y += 2;
          pdf.setDrawColor(200);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 4;
        } else {
          // Strip basic markdown formatting for PDF
          const cleanLine = line
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
          
          const wrapped = pdf.splitTextToSize(cleanLine, maxWidth);
          for (const w of wrapped) {
            if (y > 280) { pdf.addPage(); y = 20; }
            pdf.text(w, margin, y);
            y += 6;
          }
        }
      }

      pdf.save(`${title || 'document'}.pdf`);
      toast.success('Exported as PDF');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  const exportDocx = async () => {
    try {
      const paragraphs: Paragraph[] = [];
      const lines = content.split('\n');

      for (const line of lines) {
        if (line.startsWith('### ')) {
          paragraphs.push(new Paragraph({
            text: line.replace(/^###\s/, ''),
            heading: HeadingLevel.HEADING_3,
          }));
        } else if (line.startsWith('## ')) {
          paragraphs.push(new Paragraph({
            text: line.replace(/^##\s/, ''),
            heading: HeadingLevel.HEADING_2,
          }));
        } else if (line.startsWith('# ')) {
          paragraphs.push(new Paragraph({
            text: line.replace(/^#\s/, ''),
            heading: HeadingLevel.HEADING_1,
          }));
        } else if (line.startsWith('> ')) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: line.replace(/^>\s/, ''), italics: true })],
            indent: { left: 720 },
          }));
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          paragraphs.push(new Paragraph({
            text: line.replace(/^[-*]\s/, ''),
            bullet: { level: 0 },
          }));
        } else if (line.trim() === '') {
          paragraphs.push(new Paragraph({ text: '' }));
        } else if (line.startsWith('---')) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: '─'.repeat(50) })],
          }));
        } else {
          // Parse bold/italic inline
          const children: TextRun[] = [];
          const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|([^*`]+))/g;
          let match;
          while ((match = regex.exec(line)) !== null) {
            if (match[2]) {
              children.push(new TextRun({ text: match[2], bold: true }));
            } else if (match[3]) {
              children.push(new TextRun({ text: match[3], italics: true }));
            } else if (match[4]) {
              children.push(new TextRun({ text: match[4], font: 'Courier New', size: 20 }));
            } else if (match[5]) {
              children.push(new TextRun({ text: match[5] }));
            }
          }
          if (children.length > 0) {
            paragraphs.push(new Paragraph({ children }));
          } else {
            paragraphs.push(new Paragraph({ text: line }));
          }
        }
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: title || 'Untitled',
              heading: HeadingLevel.TITLE,
            }),
            ...paragraphs,
          ],
        }],
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `${title || 'document'}.docx`);
      toast.success('Exported as DOCX');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export DOCX');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportMd} className="gap-2">
          <FileText className="w-4 h-4" />
          Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPdf} className="gap-2">
          <File className="w-4 h-4" />
          PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportDocx} className="gap-2">
          <FileType className="w-4 h-4" />
          Word (.docx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
