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

type OfficeComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  url: string;
}>;

function OfficeComponent({
  className,
  format,
  nodeKey,
  url,
}: OfficeComponentProps) {
  const docName = url.split('/').pop() || 'Open Document'; // Extract Document name from URL
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
      <a href={`https://view.officeapps.live.com/op/view.aspx?src=${url}`} target="_blank" rel="noopener noreferrer" style={buttonStyle}>
        {docName}
      </a>
    </BlockWithAlignableContents>
  );


  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}>
      <iframe
        width="800"
        height="500"
        className="office"
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${url}`}
      />
    </BlockWithAlignableContents>
  );
}

export type SerializedOfficeNode = Spread<
  {
    url: string;
    type: 'office';
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

function convertOfficeElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const url = domNode.getAttribute('data-lexical-office');
  if (url) {
    const node = $createOfficeNode(url);
    return {node};
  }
  return null;
}

export class OfficeNode extends DecoratorBlockNode {
  __url: string;

  static getType(): string {
    return 'office';
  }

  static clone(node: OfficeNode): OfficeNode {
    return new OfficeNode(node.__url, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedOfficeNode): OfficeNode {
    const node = $createOfficeNode(serializedNode.url);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedOfficeNode {
    return {
      ...super.exportJSON(),
      type: 'office',
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

    a.textContent = this.__url.split('/').pop() || 'Open Document';

    a.style.display='inline-block';
    a.style.padding='10px 20px';
    a.style.backgroundColor='#8c74f7';
    a.style.color='white';
    a.style.textDecoration='none';
    a.style.borderRadius='20px';
    a.style.fontFamily='Arial, sans-serif';
    a.style.fontSize='14px';
    a.style.fontWeight='bold';

    a.href=`https://view.officeapps.live.com/op/view.aspx?src=${this.__url}`;

    a.setAttribute('target','_blank')

    return { element: a };

    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-office', this.__url);
    element.setAttribute('width', '800');
    element.setAttribute('height', '500');
    element.setAttribute('src', `https://view.officeapps.live.com/op/embed.aspx?src=${this.__url}`);
    element.setAttribute('class', 'office');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-office')) {
          return null;
        }
        return {
          conversion: convertOfficeElement,
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
      <OfficeComponent
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

export function $createOfficeNode(url: string): OfficeNode {
  return new OfficeNode(url);
}

export function $isOfficeNode(
  node: OfficeNode | LexicalNode | null | undefined,
): node is OfficeNode {
  return node instanceof OfficeNode;
}
