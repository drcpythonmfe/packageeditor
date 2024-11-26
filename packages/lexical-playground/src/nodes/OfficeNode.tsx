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

// Updated types to include id
type OfficeData = {
  url: string;
  id: string;
};

type OfficeComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  data: OfficeData;
}>;

function OfficeComponent({
  className,
  format,
  nodeKey,
  data,
}: OfficeComponentProps) {
  const { url, id } = data;
  const parts = url.split('.');
  const extension = parts[parts.length - 1]?.toLowerCase();

  let fileName = url.split('/').pop() || 'Open Document'; 
  fileName = fileName.length > 25 ? fileName.slice(0, 25) + '...' + extension : fileName;

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
        <a 
          href={`https://view.officeapps.live.com/op/view.aspx?src=${url}`} 
          target="_blank" 
          rel= {id}
          title={id}
        >
          <span 
            data-lexical-text="true" 
            style={buttonStyle}
            title={id}
          >
            {fileName}
          </span>
        </a> &nbsp;
      </p>
    </BlockWithAlignableContents>
  );
}

// Updated serialized type to include id
export type SerializedOfficeNode = Spread<
  {
    data: OfficeData;
    type: 'office';
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

function convertOfficeElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const url = domNode.getAttribute('data-lexical-office-url');
  const id = domNode.getAttribute('data-lexical-office-id');
  if (url && id) {
    const node = $createOfficeNode({ url, id });
    return {node};
  }
  return null;
}

export class OfficeNode extends DecoratorBlockNode {
  __data: OfficeData;

  static getType(): string {
    return 'office';
  }

  static clone(node: OfficeNode): OfficeNode {
    return new OfficeNode(node.__data, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedOfficeNode): OfficeNode {
    const node = $createOfficeNode(serializedNode.data);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedOfficeNode {
    return {
      ...super.exportJSON(),
      type: 'office',
      data: this.__data,
      version: 1,
    };
  }

  constructor(data: OfficeData, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__data = data;
  }

  exportDOM(): DOMExportOutput {
    const { url, id } = this.__data;
    const a = document.createElement('a');
    a.href = `https://view.officeapps.live.com/op/view.aspx?src=${url}`;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', id); 
    a.setAttribute('data-lexical-office-url', url);
    a.setAttribute('data-lexical-office-id', id);
    a.setAttribute('title', id);


    const span = document.createElement('span');
    const parts = url.split('.');
    const extension = parts[parts.length - 1]?.toLowerCase();
    let urlPart = url.split('/').pop() || 'Open Document';
    urlPart = urlPart.length > 25 ? urlPart.slice(0, 25) + '...' + extension : urlPart;
    
    span.textContent = urlPart;
    span.setAttribute('title', id);
    // span.setAttribute('alt', id);

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

    return { element: a };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-office-url')) {
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
    return this.__data.id;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `${this.__data.url}`;
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
        data={this.__data}
      />
    );
  }

  isInline(): false {
    return false;
  }
}

// Updated create function to accept data object
export function $createOfficeNode(data: OfficeData): OfficeNode {
  return new OfficeNode(data);
}

export function $isOfficeNode(
  node: OfficeNode | LexicalNode | null | undefined,
): node is OfficeNode {
  return node instanceof OfficeNode;
}