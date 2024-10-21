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
  const pdfName = url.split('/').pop() || 'Open PDF'; // Extract PDF name from URL
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
        {pdfName}
      </a>
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
    // Create the button element
    const a = document.createElement('a');

    a.textContent = this.__url.split('/').pop() || 'Open PDF';

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
