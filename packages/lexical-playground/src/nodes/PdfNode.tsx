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

// Define PdfData type
type PdfData = {
  url: string;
  id: string;
};

type PdfComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  data: PdfData;
}>;

function PdfComponent({
  className,
  format,
  nodeKey,
  data,
}: PdfComponentProps) {
  const { url, id } = data;
  const parts = url?.split('.');
  const extension = parts[parts.length - 1]?.toLowerCase();

  let fileName = url.split('/').pop() || 'Open Pdf'; 
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
          <a href={url} target="_blank" rel={id} >
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

export type SerializedPdfNode = Spread<
  {
    data: PdfData;
    type: 'pdf';
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

function convertPdfElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const url = domNode.getAttribute('data-lexical-pdf-url');
  const id = domNode.getAttribute('data-lexical-pdf-id');
  if (url && id) {
    const node = $createPdfNode({ url, id });
    return {node};
  }
  return null;
}

export class PdfNode extends DecoratorBlockNode {
  __data: PdfData;

  static getType(): string {
    return 'pdf';
  }

  static clone(node: PdfNode): PdfNode {
    return new PdfNode(node.__data, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedPdfNode): PdfNode {
    const node = $createPdfNode(serializedNode.data);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedPdfNode {
    return {
      ...super.exportJSON(),
      type: 'pdf',
      data: this.__data,
      version: 1,
    };
  }

  constructor(data: PdfData, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__data = data;
  }

  exportDOM(): DOMExportOutput {
    const { url, id } = this.__data;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', id); 
    a.setAttribute('data-lexical-pdf-url', url);
    a.setAttribute('data-lexical-pdf-id', id);
  
    const span = document.createElement('span');
    
    const parts = url?.split('.');
    const extension = parts[parts.length - 1]?.toLowerCase();
    let urlPart = url.split('/').pop() || 'Open pdf';
    urlPart = urlPart.length > 25 ? urlPart.slice(0, 25) + '...' + extension : urlPart;
    
    span.textContent = urlPart;
    span.setAttribute('title', id);
    span.setAttribute('alt', id);
  
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
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-pdf-url')) {
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
      <PdfComponent
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

export function $createPdfNode(data: PdfData): PdfNode {
  return new PdfNode(data);
}

export function $isPdfNode(
  node: PdfNode | LexicalNode | null | undefined,
): node is PdfNode {
  return node instanceof PdfNode;
}