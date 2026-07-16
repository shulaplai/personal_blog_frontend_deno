import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import {
  FormatBold, FormatItalic, StrikethroughS, FormatListBulleted,
  FormatListNumbered, FormatQuote, Code, Image as ImageIcon,
  Link as LinkIcon, Undo, Redo, Title,
} from '@mui/icons-material';
import UrlPromptDialog from './UrlPromptDialog';

const MenuBar = ({ editor }) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  if (!editor) return null;

  const addImage = (url) => {
    editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = (url) => {
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0.5, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      <ToggleButtonGroup size="small">
        <ToggleButton value="bold" selected={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><FormatBold fontSize="small" /></ToggleButton>
        <ToggleButton value="italic" selected={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><FormatItalic fontSize="small" /></ToggleButton>
        <ToggleButton value="strike" selected={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><StrikethroughS fontSize="small" /></ToggleButton>
        <ToggleButton value="code" selected={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><Code fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>
      <Divider orientation="vertical" flexItem />
      <ToggleButtonGroup size="small">
        <ToggleButton value="h2" selected={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Title fontSize="small" /></ToggleButton>
        <ToggleButton value="bulletList" selected={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><FormatListBulleted fontSize="small" /></ToggleButton>
        <ToggleButton value="orderedList" selected={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><FormatListNumbered fontSize="small" /></ToggleButton>
        <ToggleButton value="blockquote" selected={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><FormatQuote fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>
      <Divider orientation="vertical" flexItem />
      <ToggleButtonGroup size="small">
        <ToggleButton value="image" onClick={() => setImageDialogOpen(true)}><ImageIcon fontSize="small" /></ToggleButton>
        <ToggleButton value="link" selected={editor.isActive('link')} onClick={() => setLinkDialogOpen(true)}><LinkIcon fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>
      <Divider orientation="vertical" flexItem />
      <ToggleButtonGroup size="small">
        <ToggleButton value="undo" onClick={() => editor.chain().focus().undo().run()}><Undo fontSize="small" /></ToggleButton>
        <ToggleButton value="redo" onClick={() => editor.chain().focus().redo().run()}><Redo fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>
      <UrlPromptDialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onSubmit={addImage}
        title="插入圖片"
        label="圖片 URL"
        placeholder="https://example.com/image.jpg"
      />
      <UrlPromptDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSubmit={addLink}
        title="插入連結"
        label="連結 URL"
        placeholder="https://..."
      />
    </Box>
  );
};

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: '開始輸入內容…' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync editor content when the value prop changes externally (e.g. after data loads in edit mode)
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <MenuBar editor={editor} />
      <Box sx={{ px: 2, py: 1, minHeight: 300, '& .ProseMirror': { outline: 'none', minHeight: 300 } }}>
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
