import {
    $applyNodeReplacement,
    $isTextNode,
    DOMConversion,
    DOMConversionMap,
    DOMConversionOutput,
    NodeKey,
    TextNode,
    SerializedTextNode,
    LexicalNode
  } from 'lexical';
  
  export class ExtendedTextNode extends TextNode {
    constructor(text: string, key?: NodeKey) {
      super(text, key);
    }

    static getType(): string {
      return 'extended-text';
    }
  
    static clone(node: ExtendedTextNode): ExtendedTextNode {
      return new ExtendedTextNode(node.__text, node.__key);
    }
  
    static importDOM(): DOMConversionMap | null {
      const importers = TextNode.importDOM();
      return {
        ...importers,
        code: () => ({
          conversion: patchStyleConversion(importers?.code),
          priority: 1
        }),
        em: () => ({
          conversion: patchStyleConversion(importers?.em),
          priority: 1
        }),
        span: () => ({
          conversion: patchStyleConversion(importers?.span),
          priority: 1
        }),
        strong: () => ({
          conversion: patchStyleConversion(importers?.strong),
          priority: 1
        }),
        sub: () => ({
          conversion: patchStyleConversion(importers?.sub),
          priority: 1
        }),
        sup: () => ({
          conversion: patchStyleConversion(importers?.sup),
          priority: 1
        }),
      };
    }
  
    static importJSON(serializedNode: SerializedTextNode): TextNode {
      return TextNode.importJSON(serializedNode);
    }
  
    isSimpleText() {
      return this.__type === 'extended-text' && this.__mode === 0;
    }
  
    exportJSON(): SerializedTextNode {
      return {
        ...super.exportJSON(),
        type: 'extended-text',
        version: 1,
        detail: this.getDetail(),
        format: this.getFormat(),
        mode: this.getMode(),
        style: this.getStyle(),
        text: this.getTextContent(),
      }
    }
  }
  
  export function $createExtendedTextNode(text: string): ExtendedTextNode {
    return $applyNodeReplacement(new ExtendedTextNode(text));
  }
  
  export function $isExtendedTextNode(node: LexicalNode | null | undefined): node is ExtendedTextNode {
      return node instanceof ExtendedTextNode;
  }
  
  // function patchStyleConversion(
  //   originalDOMConverter?: (node: HTMLElement) => DOMConversion | null
  // ): (node: HTMLElement) => DOMConversionOutput | null {
  //   return (node) => {
  //     const original = originalDOMConverter?.(node);

  //     if (!original) {
  //       return null;
  //     }

  //     console.log("original",original)
  //     const originalOutput = original.conversion(node);
  
  //     if (!originalOutput) {
  //       return originalOutput;
  //     }
  
  //     const backgroundColor = node.style.backgroundColor;
  //     const color = node.style.color;
  //     const fontFamily = node.style.fontFamily;
  //     const fontWeight = node.style.fontWeight;
  //     const fontSize = node.style.fontSize;
  //     const textDecoration = node.style.textDecoration;
  //     const textalignment =  node.style.alignItems
  //     const display = node.style.display
  //     const height =  node.style.height
  //     const borderRadius = node.style.borderRadius
  //     const padding = node.style.padding
  //     const width = node.style.width

  //     return {
  //       ...originalOutput,
  //       forChild: (lexicalNode, parent) => {
  //         const originalForChild = originalOutput?.forChild ?? ((x) => x);
  //         const result = originalForChild(lexicalNode, parent);
  //         if ($isTextNode(result)) {
  //           const style = [
  //             textalignment ?  `text-align: ${textalignment}` : null,
  //             backgroundColor ? `background-color: ${backgroundColor}` : null,
  //             color ? `color: ${color}` : null,
  //             fontFamily ? `font-family: ${fontFamily}` : null,
  //             fontWeight ? `font-weight: ${fontWeight}` : null,
  //             fontSize ? `font-size: ${fontSize}` : null,
  //             textDecoration ? `text-decoration: ${textDecoration}` : null,
  //             display ?  `display : ${display}` : null,
  //             height ?  `height : ${height}` :null,
  //             borderRadius ? `border-radius :${borderRadius}` :null,
  //             padding ? `padding :${padding}`:null,
  //             width ? `width :${width}`:null,
  //           ]
  //             .filter((value) => value != null)
  //             .join('; ');
  //           if (style.length) {
  //             return result.setStyle(style);
  //           }
  //         }
  //         return result;
  //       }
  //     };
  //   };
  // }


  function patchStyleConversion(
    originalDOMConverter?: (node: HTMLElement) => DOMConversion | null
  ): (node: HTMLElement) => DOMConversionOutput | null {
    return (node) => {
      const original = originalDOMConverter?.(node);
  
      if (!original) {
        return null;
      }
  
      const originalOutput = original.conversion(node);
  
      if (!originalOutput) {
        return originalOutput;
      }
  
      // Get styles from the current node
      const nodeStyles = getNodeStyles(node);
      
      // Get styles from parent elements
      const parentStyles = getParentStyles(node);
      
      // Merge styles, giving priority to current node's styles
      const mergedStyles = { ...parentStyles, ...nodeStyles };
  
      return {
        ...originalOutput,
        forChild: (lexicalNode, parent) => {
          const originalForChild = originalOutput?.forChild ?? ((x) => x);
          const result = originalForChild(lexicalNode, parent);
          if ($isTextNode(result)) {
            const style = generateStyleString(mergedStyles);
            if (style.length) {
              return result.setStyle(style);
            }
          }
          return result;
        }
      };
    };
  }
  
  function getNodeStyles(node: HTMLElement) {
    return {
      backgroundColor: node.style.backgroundColor,
      color: node.style.color,
      fontFamily: node.style.fontFamily,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      textDecoration: node.style.textDecoration,
      textAlign: node.style.textAlign || getComputedTextAlign(node),
      display: node.style.display,
      height: node.style.height,
      borderRadius: node.style.borderRadius,
      padding: node.style.padding,
      width: node.style.width
    };
  }
  
  function getParentStyles(node: HTMLElement) {
    const styles: Record<string, string> = {};
    let parent = node.parentElement;
    
    while (parent && parent.tagName !== 'BODY') {
      // Get inline styles
      if (parent.hasAttribute('style')) {
        const styleAttr = parent.getAttribute('style');
        if (styleAttr) {
          const declarations = styleAttr.split(';').filter(Boolean);
          declarations.forEach(declaration => {
            const [property, value] = declaration.split(':').map(s => s.trim());
            if (property && value && !styles[property]) {
              styles[property] = value;
            }
          });
        }
      }
  
      // Check for text alignment in parent
      if (parent.style.textAlign || parent.hasAttribute('dir')) {
        styles['text-align'] = parent.style.textAlign || 
                              (parent.getAttribute('dir') === 'rtl' ? 'right' : 
                               parent.getAttribute('dir') === 'ltr' ? 'left' : '');
      }
  
      // Check for specific classes
      if (parent.className) {
        if (parent.className.includes('TextEditor__paragraph')) {
          if (!styles['text-align'] && parent.getAttribute('dir') === 'rtl') {
            styles['text-align'] = 'right';
          }
        }
      }
  
      parent = parent.parentElement;
    }
  
    return styles;
  }
  
  function getComputedTextAlign(node: HTMLElement): string {
    // Check direct style
    if (node.style.textAlign) {
      return node.style.textAlign;
    }
  
    // Check dir attribute
    if (node.hasAttribute('dir')) {
      return node.getAttribute('dir') === 'rtl' ? 'right' : 'left';
    }
  
    // Check computed style
    const computed = window.getComputedStyle(node);
    return computed.textAlign;
  }
  
  function generateStyleString(styles: Record<string, string>) {
    const styleEntries = [
      styles['text-align'] ? `text-align: ${styles['text-align']}` : null,
      styles.backgroundColor ? `background-color: ${styles.backgroundColor}` : null,
      styles.color ? `color: ${styles.color}` : null,
      styles.fontFamily ? `font-family: ${styles.fontFamily}` : null,
      styles.fontWeight ? `font-weight: ${styles.fontWeight}` : null,
      styles.fontSize ? `font-size: ${styles.fontSize}` : null,
      styles.textDecoration ? `text-decoration: ${styles.textDecoration}` : null,
      styles.display ? `display: ${styles.display}` : null,
      styles.height ? `height: ${styles.height}` : null,
      styles.borderRadius ? `border-radius: ${styles.borderRadius}` : null,
      styles.padding ? `padding: ${styles.padding}` : null,
      styles.width ? `width: ${styles.width}` : null,
    ].filter(Boolean);
  
    return styleEntries.join('; ');
  }