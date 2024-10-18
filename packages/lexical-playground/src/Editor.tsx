/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ToolbarConfig} from './plugins/toolbarTypes';
import type {EditorState, LexicalEditor} from 'lexical';

import {$generateHtmlFromNodes} from '@lexical/html';
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CharacterLimitPlugin} from '@lexical/react/LexicalCharacterLimitPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {HorizontalRulePlugin} from '@lexical/react/LexicalHorizontalRulePlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {CAN_USE_DOM} from 'shared/canUseDOM';

import {createWebsocketProvider} from './collaboration';
import {useSharedHistoryContext} from './context/SharedHistoryContext';
import {useEditorComposerContext} from './EditorComposerContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import ClickableLinkPlugin from './plugins/ClickableLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import CommentPlugin from './plugins/CommentPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import FigmaPlugin from './plugins/FigmaPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import {MaxLengthPlugin} from './plugins/MaxLengthPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import OfficePlugin, {INSERT_OFFICE_COMMAND} from './plugins/OfficePlugin';
import OnImageUploadPlugin, {
  type OnImageUpload,
} from './plugins/OnImageUploadPlugin';
import PdfPlugin, {INSERT_PDF_COMMAND} from './plugins/PdfPlugin';
import PollPlugin from './plugins/PollPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import VideoPlugin, {INSERT_VIDEO_COMMAND} from './plugins/VideoPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import joinClasses from './utils/joinClasses';

const skipCollaborationInit =
  // @ts-ignore
  window.parent != null && window.parent.frames.right === window;

export type EditorProps = {
  isCollab?: boolean;
  isAutocomplete?: boolean;
  isMaxLength?: boolean;
  isCharLimit?: boolean;
  isCharLimitUtf8?: boolean;
  isRichText?: boolean;
  showTreeView?: boolean;
  showTableOfContents?: boolean;
  onChange?: (
    htmlJson: string,
    editorState: EditorState,
    editor: LexicalEditor,
  ) => void;
  onChangeMode?: 'html' | 'json';
  toolbarConfig?: ToolbarConfig;
  onUpload?: OnImageUpload;
  onDataSend?: ((data: any) => void | undefined | any) | undefined;
  rootClassName?: string;
  containerClassName?: string;
  dummyMentionsDatas?: string[];
};

const defaultToolbarConfig: ToolbarConfig = {
  align: true,
  bgColorPicker: true,
  biu: true,
  codeBlock: true,
  fontFamilyOptions: true,
  fontSizeOptions: true,
  formatBlockOptions: true,
  formatTextOptions: true,
  insertOptions: true,
  link: true,
  textColorPicker: true,
  undoRedo: true,
};

export default function Editor({
  isCollab,
  isAutocomplete,
  isMaxLength,
  isCharLimit,
  isCharLimitUtf8,
  isRichText = false,
  showTreeView,
  showTableOfContents,
  onChange,
  onChangeMode = 'json',
  onUpload,
  onDataSend,
  toolbarConfig,
  rootClassName,
  containerClassName,
  dummyMentionsDatas,
}: EditorProps): JSX.Element {
  const {historyState} = useSharedHistoryContext();
  const text = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
    ? 'Enter some rich text...'
    : 'Enter some plain text...';
  const placeholder = <Placeholder>{text}</Placeholder>;
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };
  const [editor] = useLexicalComposerContext();
  const editorContext = useEditorComposerContext();

  const normToolbarConfig = useMemo(
    () => ({...defaultToolbarConfig, ...toolbarConfig}),
    [toolbarConfig],
  );

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };

    window.addEventListener('resize', updateViewPortWidth);

    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  const handleClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (onDataSend) {
        onDataSend(selectedFile).then((res: any) => {
          const parts = res?.split('.');
          const extension = parts[parts.length - 1]?.toLowerCase();
          const validVideoTypes = [
            'mp4',
            'webm',
            'mov',
            'avi',
            'flv',
            'mkv',
            'wmv',
          ];

          const validPdfTypes = [
            'pdf'
          ]

          const validOfficeTypes = [
            'xlsx',
            'docx',
            'pptx',
            'csv',
            'ods',
          ]

          if (validVideoTypes.includes(extension)) {
            editor.dispatchCommand(INSERT_VIDEO_COMMAND, res);
            return;
          }

          if (validPdfTypes.includes(extension)) {
            editor.dispatchCommand(INSERT_PDF_COMMAND, res);
            return;
          }

          if (validOfficeTypes.includes(extension)) {
            editor.dispatchCommand(INSERT_OFFICE_COMMAND, res);
            return;
          }
        });
      } else {
        console.error('onDataSend function is not defined');
      }
    }
  };

  return (
    <div className={joinClasses('editor-shell', rootClassName)}>
      <div
        className={`editor-container ${containerClassName ?? ''} ${
          showTreeView ? 'tree-view' : ''
        } ${!isRichText ? 'plain-text' : ''}`}>
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <CommentPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <AutoEmbedPlugin />
        <MentionsPlugin dummyMentionsDatas={dummyMentionsDatas} />
        <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin />
        <AutoLinkPlugin />

        {onChange && (
          <OnChangePlugin
            onChange={(editorState, editor) => {
              if (onChangeMode === 'html') {
                editor.update(() => {
                  onChange(
                    $generateHtmlFromNodes(editor, null),
                    editorState,
                    editor,
                  );
                });
              } else if (onChangeMode === 'json') {
                onChange(JSON.stringify(editorState), editorState, editor);
              }
            }}
          />
        )}
        {isRichText ? (
          <>
            {isCollab ? (
              <CollaborationPlugin
                id="main"
                providerFactory={createWebsocketProvider}
                shouldBootstrap={!skipCollaborationInit}
              />
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )}
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor themeeditor" ref={onRef}>
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <MarkdownShortcutPlugin />
            <CodeHighlightPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin />
            <TableCellResizer />
            <ImagesPlugin />
            <OnImageUploadPlugin onUpload={onUpload} />
            <LinkPlugin />
            <PollPlugin />
            <TwitterPlugin />
            <YouTubePlugin />
            <VideoPlugin />
            <PdfPlugin />
            <OfficePlugin />
            <FigmaPlugin />
            <ClickableLinkPlugin />
            <HorizontalRulePlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                <TableCellActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem}
                  config={normToolbarConfig}
                />
              </>
            )}
            {editorContext.extensions.plugins.map(([extName, Plugin]) => (
              <Plugin key={extName} />
            ))}
          </>
        ) : (
          <>
            <PlainTextPlugin
              contentEditable={<ContentEditable />}
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
            maxLength={5}
          />
        )}
        {isAutocomplete && <AutocompletePlugin />}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        <ActionsPlugin isRichText={isRichText} />
      </div>
      {isRichText && <ToolbarPlugin config={normToolbarConfig} handleClick={handleClick} />}
      {showTreeView && <TreeViewPlugin />}
    </div>
  );
}
