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
  
  const parts = url?.split('.');
  const extension = parts[parts.length - 1]?.toLowerCase();

  let videoName = url.split('/').pop() || 'Open Video'; 
  videoName = videoName.length > 25 ? videoName.slice(0, 25) + '...' +extension : videoName;

  

  const buttonStyle = {
    backgroundColor: 'rgb(140, 116, 247)',
    borderRadius: '8px',
    color: 'white',
    display: 'inline-block',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    padding: '6px',
    textDecoration: 'none',
    height: '30px',
    width: '250px'
  };

  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}>
      <p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <span data-lexical-text="true" style={buttonStyle}>
            {videoName}
          </span>
        </a> &nbsp;
      </p>
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

function convertVideoElement(domNode: HTMLElement): null | DOMConversionOutput {
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
  a.href = this.__url; 
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer'); 
  a.setAttribute('data-lexical-video', this.__url);
  a.setAttribute('allowfullscreen', 'true');

  const span = document.createElement('span');
  

  const parts = this.__url?.split('.');
  const extension = parts[parts.length - 1]?.toLowerCase();
  let urlPart  =  this.__url.split('/').pop() || 'Open Video';
  urlPart = urlPart.length > 25 ? urlPart.slice(0, 25) + '...' +extension : urlPart;
  span.textContent =  urlPart;

  span.style.backgroundColor = 'rgb(140, 116, 247)';
  span.style.borderRadius = '8px';
  span.style.color = 'white';
  span.style.display = 'inline-block';
  span.style.fontFamily = 'Arial, sans-serif';
  span.style.fontSize = '14px';
  span.style.fontWeight = 'bold';
  span.style.padding = '6px';
  span.style.textDecoration = 'none';
  span.style.width = '250px';
  span.style.height = '30px';
  a.appendChild(span);
  const space = document.createElement('p');
  space.textContent = ' '
  const p = document.createElement('p');
  p.appendChild(a); 
  p.appendChild(space)

  return { element: p };


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
