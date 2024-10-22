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

type PdfComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  url: string;
}>;

function PdfComponent({
  className,
  format,
  nodeKey,
  url,
}: PdfComponentProps) {
  const parts = url?.split('.');
  const extension = parts[parts.length - 1]?.toLowerCase();

  let videoName = url.split('/').pop() || 'Open Pdf'; 
  videoName = videoName.length > 15 ? videoName.slice(0, 15) + '...' +extension : videoName;

  

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
    width: 'auto'
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
}

export type SerializedPdfNode = Spread<
  {
    url: string;
    type: 'pdf';
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

function convertPdfElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const url = domNode.getAttribute('data-lexical-pdf');
  if (url) {
    const node = $createPdfNode(url);
    return {node};
  }
  return null;
}

export class PdfNode extends DecoratorBlockNode {
  __url: string;

  static getType(): string {
    return 'pdf';
  }

  static clone(node: PdfNode): PdfNode {
    return new PdfNode(node.__url, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedPdfNode): PdfNode {
    const node = $createPdfNode(serializedNode.url);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedPdfNode {
    return {
      ...super.exportJSON(),
      type: 'pdf',
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
    let urlPart  =  this.__url.split('/').pop() || 'Open pdf';
    urlPart = urlPart.length > 15 ? urlPart.slice(0, 15) + '...' +extension : urlPart;
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
    span.style.width = 'auto';
    span.style.height = '30px';
    a.appendChild(span);
    const space = document.createElement('p');
    space.textContent = ' '
    const p = document.createElement('p');
    p.appendChild(a); 
    p.appendChild(space)
  
    return { element: p };


  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-pdf')) {
          return null;
        }
        return {
          conversion: convertPdfElement,
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
      <PdfComponent
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

export function $createPdfNode(url: string): PdfNode {
  return new PdfNode(url);
}

export function $isPdfNode(
  node: PdfNode | LexicalNode | null | undefined,
): node is PdfNode {
  return node instanceof PdfNode;
}
