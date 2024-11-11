/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$insertNodeToNearestRoot} from '@lexical/utils';
import {COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand} from 'lexical';
import {useEffect} from 'react';

import {$createPdfNode, PdfNode} from '../../nodes/PdfNode';

// Define the type for the Office data
export interface PdfData {
  url: string;
  id: string;
}

export const INSERT_PDF_COMMAND: LexicalCommand<PdfData> = createCommand(
  'INSERT_PDF_COMMAND',
);

export default function PdfPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([PdfNode])) {
      throw new Error('PdfPlugin: PdfNode not registered on editor');
    }

    return editor.registerCommand<PdfData>(
      INSERT_PDF_COMMAND,
      (payload) => {
        const pdfNode = $createPdfNode(payload);
        $insertNodeToNearestRoot(pdfNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
