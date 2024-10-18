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

import {$createOfficeNode, OfficeNode} from '../../nodes/OfficeNode';

export const INSERT_OFFICE_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_OFFICE_COMMAND',
);

export default function OfficePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([OfficeNode])) {
      throw new Error('OfficePlugin: OfficeNode not registered on editor');
    }

    return editor.registerCommand<string>(
      INSERT_OFFICE_COMMAND,
      (payload) => {
        const officeNode = $createOfficeNode(payload);
        $insertNodeToNearestRoot(officeNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
