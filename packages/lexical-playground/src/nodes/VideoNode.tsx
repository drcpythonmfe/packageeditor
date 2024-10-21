/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical';

import {BlockWithAlignableContents} from '@lexical/react/LexicalBlockWithAlignableContents';
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';
import * as React from 'react';

type VideoComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  url: string;
}>;

function VideoComponent({
  className,
  format,
  nodeKey,
  url,
}: VideoComponentProps) {
  const videoName = url.split('/').pop() || 'Open Video'; // Extract PDF name from URL
  const buttonStyle = {
    backgroundColor: '#8c74f7',
    borderRadius: '20px',
    color: 'white',
    display: 'inline-block',
    fontFamily: 'Arial, sans-serif', 
    fontSize: '14px', 
    fontWeight: 'bold',
    padding: '10px 20px',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease',
  };

  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <a href={url} target="_blank" rel="noopener noreferrer" style={buttonStyle}>
        {videoName}
      </a>
    </BlockWithAlignableContents>
  );
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}>
      <iframe
        width="560"
        height="315"
        src={url}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
        title="Video"
      />
    </BlockWithAlignableContents>
  );
}

export type SerializedVideoNode = Spread<
  {
    url: string;
    type: 'video';
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

function convertVideoElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const url = domNode.getAttribute('data-lexical-video');
  if (url) {
    const node = $createVideoNode(url);
    return {node};
  }
  return null;
}

export class VideoNode extends DecoratorBlockNode {
  __url: string;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__url, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const node = $createVideoNode(serializedNode.url);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedVideoNode {
    return {
      ...super.exportJSON(),
      type: 'video',
      url: this.__url,
      version: 1,
    };
  }

  constructor(url: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__url = url;
  }

  exportDOM(): DOMExportOutput {
    const a = document.createElement('a');

    a.textContent = this.__url.split('/').pop() || 'Open Video';

    a.style.display='inline-block';
    a.style.padding='10px 20px';
    a.style.backgroundColor='#8c74f7';
    a.style.color='white';
    a.style.textDecoration='none';
    a.style.borderRadius='20px';
    a.style.fontFamily='Arial, sans-serif';
    a.style.fontSize='14px';
    a.style.fontWeight='bold';

    a.href=this.__url;

    a.setAttribute('target','_blank')

    return { element: a };

    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-video', this.__url);
    element.setAttribute('width', '560');
    element.setAttribute('height', '315');
    element.setAttribute('src', `${this.__url}`);
    element.setAttribute('frameborder', '0');
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    );
    element.setAttribute('allowfullscreen', 'true');
    element.setAttribute('title', 'Video');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-video')) {
          return null;
        }
        return {
          conversion: convertVideoElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__url;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `${this.__url}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };
    return (
      <VideoComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        url={this.__url}
      />
    );
  }

  isInline(): false {
    return false;
  }
}

export function $createVideoNode(url: string): VideoNode {
  return new VideoNode(url);
}

export function $isVideoNode(
  node: VideoNode | LexicalNode | null | undefined,
): node is VideoNode {
  return node instanceof VideoNode;
}
