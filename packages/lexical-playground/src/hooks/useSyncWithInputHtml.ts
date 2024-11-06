import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  CLEAR_HISTORY_COMMAND
} from 'lexical';
import useLayoutEffect from 'shared/useLayoutEffect';
import { useDebounce } from 'use-debounce';

type Options = {
  timeoutMs?: number;
};

const normalizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerHTML;
};

const useSyncWithInputHtml = (
  html?: string | null,
  {timeoutMs = 800}: Options = {},
) => {
  const [editor] = useLexicalComposerContext();
  const [debHtml] = useDebounce(html, timeoutMs);
  const normHtml = editor.getEditorState().isEmpty() ? html : debHtml;

  useLayoutEffect(() => {
    if (!normHtml) return;

    const currentHtml = editor.getEditorState().read(() => 
      $generateHtmlFromNodes(editor, null)
    );

    const normalizedCurrentHtml = normalizeHtml(currentHtml);
    const normalizedNewHtml = normalizeHtml(normHtml);

    if (normalizedCurrentHtml !== normalizedNewHtml) {
      editor.update(() => {
        $getRoot().clear();
        const parser = new DOMParser();
        const dom = parser.parseFromString(normHtml, 'text/html');

        const nodes = $generateNodesFromDOM(editor, dom);

        const root = $getRoot();
        if (nodes.length === 0) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(''));
          root.append(paragraph);
        } else {
          nodes.forEach(node => {
            root.append(node);
          });
        }

        root.selectEnd();

        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      });
    }
  }, [editor, normHtml]);

  const getCurrentHtml = () => {
    return editor.getEditorState().read(() => 
      $generateHtmlFromNodes(editor, null)
    );
  };

  return {
    getCurrentHtml,
  };
};

export default useSyncWithInputHtml;