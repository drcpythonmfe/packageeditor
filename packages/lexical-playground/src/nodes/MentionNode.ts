import type {Spread} from 'lexical';

import {
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  $applyNodeReplacement,
  TextNode,
} from 'lexical';

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    mentionEmail?: string;
    type: 'mention';
    version: 1;
  },
  SerializedTextNode
>;


function extractMentionData(htmlString: HTMLElement) {
  if(htmlString){
    return htmlString.getAttribute('uemail') 
  }
}

function convertMentionElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  
  const data  = extractMentionData(domNode)
  const textContent = domNode.textContent;

  if (textContent !== null) {
    const node = $createMentionNode(textContent,String(data));
    return {
      node,
    };
  }

  return null;
}

const mentionStyle = 'background-color: rgba(24, 119, 232, 0.2)';
export class MentionNode extends TextNode {
  __mention: string;
  __email: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__email, node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.mentionName, 
      serializedNode.mentionEmail || ''
    );
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(mentionName: string, email?: string, text?: string, key?: NodeKey) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
    this.__email = email || '';
  }


  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      mentionEmail: this.__email,
      type: 'mention',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
        const attributes = {
      'id': String(this.__email),
      'data-lexical-mention': String(this.__email),
      'uemail': this.__email,
      'data-mention-name': this.__mention ,
      'data-user-email': this.__email
    };
  
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        dom.setAttribute(key, value);
      }
    });
  
    dom.style.cssText = mentionStyle;
    dom.className = 'mention';
  
    return dom;
  }
  
  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
     
    const attributes = {
      'id': String(this.__email),
      'data-lexical-mention': String(this.__email),
      'uemail': this.__email,
      'data-mention-name': this.__mention,
      'data-user-email': this.__email
    };
  
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        element.setAttribute(key, value);
      }
    });
  
    element.textContent = this.__text;
    element.className = 'mention';
    element.style.cssText = mentionStyle;
  
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-mention')) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createMentionNode(mentionName: string, email?: string): MentionNode {
  const mentionNode = new MentionNode(mentionName, email);
  mentionNode.setMode('segmented').toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(
  node: LexicalNode | null | undefined,
): node is MentionNode {
  return node instanceof MentionNode;
}