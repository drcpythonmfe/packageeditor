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

// Define VideoData type
type VideoData = {
  url: string;
  id: string;
};

type VideoComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  data: VideoData;
}>;

function VideoComponent({
  className,
  format,
  nodeKey,
  data,
}: VideoComponentProps) {
  const { url, id } = data;
  const parts = url?.split('.');
  const extension = parts[parts.length - 1]?.toLowerCase();

  let fileName = url.split('/').pop() || 'Open Video'; 
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
        <a href={url} target="_blank" rel={id}>
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

export type SerializedVideoNode = Spread<
  {
    data: VideoData;
    type: 'video';
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

function convertVideoElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const url = domNode.getAttribute('data-lexical-video-url');
  const id = domNode.getAttribute('data-lexical-video-id');
  if (url && id) {
    const node = $createVideoNode({ url, id });
    return {node};
  }
  return null;
}

export class VideoNode extends DecoratorBlockNode {
  __data: VideoData;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__data, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const node = $createVideoNode(serializedNode.data);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedVideoNode {
    return {
      ...super.exportJSON(),
      type: 'video',
      data: this.__data,
      version: 1,
    };
  }

  constructor(data: VideoData, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__data = data;
  }

  exportDOM(): DOMExportOutput {
    const { url, id } = this.__data;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', id); 
    a.setAttribute('data-lexical-video-url', url);
    a.setAttribute('data-lexical-video-id', id);
  
    const span = document.createElement('span');
    
    const parts = url?.split('.');
    const extension = parts[parts.length - 1]?.toLowerCase();
    let urlPart = url.split('/').pop() || 'Open Video';
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
        if (!domNode.hasAttribute('data-lexical-video-url')) {
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
      <VideoComponent
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

export function $createVideoNode(data: VideoData): VideoNode {
  return new VideoNode(data);
}

export function $isVideoNode(
  node: VideoNode | LexicalNode | null | undefined,
): node is VideoNode {
  return node instanceof VideoNode;
}