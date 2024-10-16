/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {type LexicalEditor, $getNodeByKey} from 'lexical';
import {useEffect} from 'react';

import {$isImageNode, ImageNode} from '../../nodes/ImageNode';
import { INSERT_VIDEO_COMMAND } from '../VideoPlugin';

export type OnImageUpload = (img: File, altText: string) => Promise<string>;

export type DragDropPasteProps = {
  onUpload?: OnImageUpload;
};

const removeNode = (editor: LexicalEditor, node: ImageNode) => {
  try {
    editor.update(() => {
      node.remove();
    });
  } catch (e) {} // eslint-disable-line no-empty
};

export default function OnImageUploadPlugin({
  onUpload,
}: DragDropPasteProps): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!onUpload) return;

    const unregisterMutationListener = editor.registerMutationListener(
      ImageNode,
      (nodeMutations) => {
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === 'created') {
            editor.getEditorState().read(() => {
              const imageNode = $getNodeByKey<ImageNode>(nodeKey);
              if ($isImageNode(imageNode)) {
                const file = imageNode.getFile();
                const altText = imageNode.getAltText();
                if (file) {
                  (async () => {
                    try {
                      const imgUrl = await onUpload(file, altText);
                      if(imgUrl){
                        const parts = imgUrl.split('.');
                        const extension = parts[parts.length - 1].toLowerCase();
                        const validImageTypes = ['jpg', 'jpeg', 'png'];
                        const validVideoTypes = ['mp4', 'webm', 'mov', 'avi', 'flv', 'mkv', 'wmv'];
  
                        
                        if (validImageTypes.includes(extension)) {
                          const preloadImage = new Image();
                          preloadImage.onload = () => {
                            editor.update(() => {
                              imageNode.setFile(undefined);
                              imageNode.setSrc(imgUrl);
                            });
                          };
                          preloadImage.onerror = () => {
                            removeNode(editor, imageNode);
                          };
                          preloadImage.src = imgUrl;
  
                          return ;
                        } else if (validVideoTypes.includes(extension)) {
                          editor.dispatchCommand(INSERT_VIDEO_COMMAND, imgUrl);
                          return ;
                        } 
                      }else{
                        return;
                      }                      
                  
                    } catch (e) {
                      removeNode(editor, imageNode);
                    }
                  })();
                }
              }
            });
          }
        }
      },
    );

    return () => {
      unregisterMutationListener();
    };
  }, [editor, onUpload]);

  return null;
}
