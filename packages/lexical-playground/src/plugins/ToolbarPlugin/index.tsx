/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ToolbarConfig} from '../toolbarTypes';
import type {LexicalEditor, NodeKey} from 'lexical';
import JsGoogleTranslateFree, { LanguagesCodigoISO639Obj, LanguagesCodigoISO639WhitoutAuto } from "@kreisler/js-google-translate-free";
import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {INSERT_EMBED_COMMAND} from '@lexical/react/LexicalAutoEmbedPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$isDecoratorBlockNode} from '@lexical/react/LexicalDecoratorBlockNode';
import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $selectAll,
  $setBlocksType_experimental,
} from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  DEPRECATED_$isGridSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {useCallback, useEffect, useState} from 'react';
import * as React from 'react';
import {IS_APPLE} from 'shared/environment';

import {useEditorComposerContext} from '../../EditorComposerContext';
import useModal from '../../hooks/useModal';
import {$createStickyNode} from '../../nodes/StickyNode';
import ColorPicker from '../../ui/ColorPicker';
import DropDown, {DropDownItem} from '../../ui/DropDown';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {sanitizeUrl} from '../../utils/url';
import {EmbedConfigs} from '../AutoEmbedPlugin';
import {INSERT_COLLAPSIBLE_COMMAND} from '../CollapsiblePlugin';
import {InsertImageDialog} from '../ImagesPlugin';
import {InsertPollDialog} from '../PollPlugin';
import {InsertTableDialog} from '../TablePlugin';
import {INSERT_TABLE_COMMAND} from 'packages/lexical-table/src';

const SvgIcon: React.FC = () => {
  const bodyElement = document.querySelector('body');

  const isDarkTheme: boolean =
    bodyElement?.classList.contains('theme-dark') || false;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width="16px"
      height="16px"
      className={isDarkTheme ? 'theme-dark-svg' : 'theme-light-svg'}>
      <path
        d="M 7 2 L 7 48 L 43 48 L 43 14.59375 L 42.71875 14.28125 L 30.71875 2.28125 L 30.40625 2 Z M 9 4 L 29 4 L 29 16 L 41 16 L 41 46 L 9 46 Z M 31 5.4375 L 39.5625 14 L 31 14 Z"
        style={{fill: isDarkTheme ? '#171313' : '#0A0303'}}
      />
    </svg>
  );
};

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
];

function dropDownActiveClass(active: boolean) {
  if (active) return 'active dropdowns-item-active';
  else return '';
}

function BlockFormatDropDown({
  editor,
  blockType,
  bit,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  editor: LexicalEditor;
  disabled?: boolean;
  bit?: boolean;
}): JSX.Element {
  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        )
          $setBlocksType_experimental(selection, () => $createParagraphNode());
      });
    }
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType_experimental(selection, () =>
            $createHeadingNode(headingSize),
          );
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType_experimental(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection();

        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          if (selection.isCollapsed()) {
            $setBlocksType_experimental(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection))
              selection.insertRawText(textContent);
          }
        }
      });
    }
  };

  return (
    <DropDown
      bit={bit}
      disabled={disabled}
      buttonClassName="toolbar-item blocks-controls"
      buttonIconClassName={'icon block-type ' + blockType}
      // buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style">
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
        onClick={formatParagraph}>
        <i className="icon paragraph" />
        <span className="text">Normal</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h1')}
        onClick={() => formatHeading('h1')}>
        <i className="icon h1" />

        <span className="text">Heading 1</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h2')}
        onClick={() => formatHeading('h2')}>
        <i className="icon h2" />
        <span className="text">Heading 2</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h3')}
        onClick={() => formatHeading('h3')}>
        <i className="icon h3" />
        <span className="text">Heading 3</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'bullet')}
        onClick={formatBulletList}>
        <i className="icon bullet-list" />
        <span className="text">Bullet List</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'number')}
        onClick={formatNumberedList}>
        <i className="icon numbered-list" />
        <span className="text">Numbered List</span>
      </DropDownItem>
      {/* <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'check')}
        onClick={formatCheckList}>
        <i className="icon check-list" />
        <span className="text">Check List</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'quote')}
        onClick={formatQuote}>
        <i className="icon quote" />
        <span className="text">Quote</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'code')}
        onClick={formatCode}>
        <i className="icon code" />
        <span className="text">Code Block</span>
      </DropDownItem> */}
    </DropDown>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}

function FontDropDown({
  editor,
  value,
  style,
  bit,
  disabled = false,
  options,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  bit?: boolean;
  disabled?: boolean;
  options: [string, string][];
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style],
  );

  const buttonAriaLabel =
    style === 'font-family'
      ? 'Formatting options for font family'
      : 'Formatting options for font size';

  return (
    <>
      {style === 'font-size' ? (
        <DropDown
          bit={bit}
          disabled={disabled}
          buttonClassName={'toolbar-item ' + style}
          // buttonLabel={value}
          buttonIconClassName={'icon block-type font-family'}
          buttonAriaLabel={buttonAriaLabel}>
          {options.map(([option, text]) => (
            <DropDownItem
              className={`item ${dropDownActiveClass(value === option)} ${
                style === 'font-size' ? 'fontsize-item' : ''
              }`}
              onClick={() => handleClick(option)}
              key={option}>
              <span className="text">{text}</span>
            </DropDownItem>
          ))}
        </DropDown>
      ) : (
        <DropDown
          bit={bit}
          disabled={disabled}
          buttonClassName={'toolbar-item ' + style}
          // buttonLabel={value}
          buttonIconClassName={
            style === 'font-family' ? 'icon block-type font-family' : ''
          }
          buttonAriaLabel={buttonAriaLabel}>
          {options.map(([option, text]) => (
            <DropDownItem
              className={`item ${dropDownActiveClass(value === option)} ${
                style === 'font-size' ? 'fontsize-item' : ''
              }`}
              onClick={() => handleClick(option)}
              key={option}>
              <span className="text">{text}</span>
            </DropDownItem>
          ))}
        </DropDown>
      )}
    </>
  );
}

export type ToolbarPluginProps = {
  config: ToolbarConfig;
  handleClick?: ((data: any) => void | undefined | any) | undefined;
  floatingText?: boolean;
  anchorElem?: HTMLElement;
};

type LanguageOption = {
  id: string;
  name: string;
};

export default function ToolbarPlugin({
  config,
  handleClick,
  anchorElem = document.body,
  floatingText,
}: ToolbarPluginProps): JSX.Element {
  const normFontFamilyOption = Array.isArray(config.fontFamilyOptions)
    ? config.fontFamilyOptions
    : FONT_FAMILY_OPTIONS;
  const initFontFamily =
    normFontFamilyOption?.[0]?.[0] ?? FONT_FAMILY_OPTIONS[0][0];
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null,
  );
  const [fontSize, setFontSize] = useState<string>('15px');
  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#fff');
  const [fontFamily, setFontFamily] = useState<string>(initFontFamily);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('');
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [rows, setRows] = useState('5');
  const [columns, setColumns] = useState('5');
  const [selectedLang, setSelectedLang] = useState<string>('english');

  const langs = {
    afrikaans: "af",
    albanian: "sq",
    amharic: "am",
    arabic: "ar",
    armenian: "hy",
    assamese: "as",
    aymara: "ay",
    azerbaijani: "az",
    bambara: "bm",
    basque: "eu",
    belarusian: "be",
    bengali: "bn",
    bhojpuri: "bho",
    bosnian: "bs",
    bulgarian: "bg",
    catalan: "ca",
    cebuano: "ceb",
    chineseSimplified: "zh-CN",
    chineseTraditional: "zh-TW",
    corsican: "co",
    croatian: "hr",
    czech: "cs",
    danish: "da",
    divehi: "dv",
    dogri: "doi",
    dutch: "nl",
    english: "en",
    esperanto: "eo",
    estonian: "et",
    ewe: "ee",
    filipino: "fil",
    finnish: "fi",
    french: "fr",
    frisian: "fy",
    galician: "gl",
    georgian: "ka",
    german: "de",
    greek: "el",
    guarani: "gn",
    gujarati: "gu",
    haitianCreole: "ht",
    hausa: "ha",
    hawaiian: "haw",
    hebrew: "he",
    hindi: "hi",
    hmong: "hmn",
    hungarian: "hu",
    icelandic: "is",
    igbo: "ig",
    ilocano: "ilo",
    indonesian: "id",
    irish: "ga",
    italian: "it",
    japanese: "ja",
    javanese: "jv",
    kannada: "kn",
    kazakh: "kk",
    khmer: "km",
    kinyarwanda: "rw",
    konkani: "gom",
    korean: "ko",
    krio: "kri",
    kurdish: "ku",
    kurdishSorani: "ckb",
    kyrgyz: "ky",
    lao: "lo",
    latin: "la",
    latvian: "lv",
    lingala: "ln",
    lithuanian: "lt",
    luganda: "lg",
    luxembourgish: "lb",
    macedonian: "mk",
    maithili: "mai",
    malagasy: "mg",
    malay: "ms",
    malayalam: "ml",
    maltese: "mt",
    maori: "mi",
    marathi: "mr",
    manipuri: "mni-Mtei",
    mizo: "lus",
    mongolian: "mn",
    myanmar: "my",
    nepali: "ne",
    norwegian: "no",
    nyanja: "ny",
    odia: "or",
    oromo: "om",
    pashto: "ps",
    persian: "fa",
    polish: "pl",
    portuguese: "pt",
    punjabi: "pa",
    quechua: "qu",
    romanian: "ro",
    russian: "ru",
    samoan: "sm",
    sanskrit: "sa",
    scotsGaelic: "gd",
    northernSotho: "nso",
    serbian: "sr",
    sesotho: "st",
    shona: "sn",
    sindhi: "sd",
    sinhala: "si",
    slovak: "sk",
    slovenian: "sl",
    somali: "so",
    spanish: "es",
    sundanese: "su",
    swahili: "sw",
    swedish: "sv",
    tagalog: "tl",
    tajik: "tg",
    tamil: "ta",
    tatar: "tt",
    telugu: "te",
    thai: "th",
    tigrinya: "ti",
    tsonga: "ts",
    turkish: "tr",
    turkmen: "tk",
    twi: "ak",
    ukrainian: "uk",
    urdu: "ur",
    uyghur: "ug",
    uzbek: "uz",
    vietnamese: "vi",
    welsh: "cy",
    xhosa: "xh",
    yiddish: "yi",
    yoruba: "yo",
    zulu: "zu",
}


  const langOptions: LanguageOption[] = Object.entries(langs).map(
    ([id, name]) => ({
      id,
      name,
    }),
  );

  const editorContext = useEditorComposerContext();

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : '',
            );
            return;
          }
        }
      }
      // Handle buttons
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000'),
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff',
        ),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(
          selection,
          'font-family',
          initFontFamily,
        ),
      );
    }
  }, [activeEditor, initFontFamily]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [activeEditor, editor, updateToolbar]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $selectAll(selection);
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            node.setFormat(0);
            node.setStyle('');
            $getNearestBlockElementAncestorOrThrow(node).setFormat('');
          }
          if ($isDecoratorBlockNode(node)) {
            node.setFormat('');
          }
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({color: value});
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string) => {
      applyStyleText({'background-color': value});
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey],
  );

  const applyStyleTexts = useCallback(
    (styles: Record<string, string>, merge: boolean = true) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (merge) {
            const currentStyles = selection
              .getNodes()
              .reduce((styles, node) => {
                if ($isTextNode(node)) {
                  const nodeStyles = node.getStyle();
                  if (nodeStyles) {
                    return {...styles, ...parseStyles(nodeStyles)};
                  }
                }
                return styles;
              }, {});
            $patchStyleText(selection, {...currentStyles, ...styles});
          } else {
            $patchStyleText(selection, styles);
          }
        }
      });
    },
    [activeEditor],
  );

  const parseStyles = (styleString: string) => {
    return styleString
      .split(';')
      .filter((style) => style.trim())
      .reduce((styles, style) => {
        const [property, value] = style.split(':').map((str) => str.trim());
        return {...styles, [property]: value};
      }, {});
  };

  const handleTextTransform = useCallback(
    (transform: 'uppercase' | 'lowercase' | 'capitalize' | 'none') => {
      applyStyleTexts({'text-transform': transform});
    },
    [applyStyleText],
  );

  const onRTLClick = useCallback(() => {
    applyStyleTexts({
      direction: 'rtl',
      'unicode-bidi': 'bidi-override',
      'text-align': 'right',
      display: 'flex',
    });
  }, [applyStyleText]);

  const onLTRClick = useCallback(() => {
    applyStyleText({
      direction: 'ltr',
      'unicode-bidi': 'bidi-override',
      'text-align': 'left',
    });
  }, [applyStyleText]);

  const handleTextTranslibretranslateform = (
      event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
      const selectedValue = event.target.value as LanguagesCodigoISO639WhitoutAuto;
      activeEditor.update(() => {
        const selection = $getSelection();
        setSelectedLang(selectedValue)
        if ($isRangeSelection(selection)) {
          const textContent = selection.getTextContent();
          console.log(textContent);
          handleTranslate(textContent, selectedValue);
        }
      });
    };

  const handleTranslate = async (text: string, targetLang: LanguagesCodigoISO639WhitoutAuto) => {
    try {

      const result = await JsGoogleTranslateFree.translate({ from:"auto", to: targetLang, text });
  
      if (result) {
        activeEditor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText(result);
          }
        });
      }

    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  return (
    <div className="toolbar">
      {floatingText ? (
        <>
          {blockType === 'code' ? (
            <>
              <DropDown
                anchorElem={anchorElem}
                bit={true}
                disabled={!isEditable}
                buttonClassName="toolbar-item code-language"
                buttonLabel={getLanguageFriendlyName(codeLanguage)}
                buttonAriaLabel="Select language">
                {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
                  return (
                    <DropDownItem
                      className={`item ${dropDownActiveClass(
                        value === codeLanguage,
                      )}`}
                      onClick={() => onCodeLanguageSelect(value)}
                      key={value}>
                      <span className="text">{name}</span>
                    </DropDownItem>
                  );
                })}
              </DropDown>
            </>
          ) : (
            <>
              {Boolean(config.fontFamilyOptions) && (
                <FontDropDown
                  bit={true}
                  disabled={!isEditable}
                  style={'font-family'}
                  value={fontFamily}
                  editor={editor}
                  options={normFontFamilyOption}
                />
              )}
              {config.formatBlockOptions &&
                blockType in blockTypeToBlockName &&
                activeEditor === editor && (
                  <>
                    <BlockFormatDropDown
                      bit={true}
                      disabled={!isEditable}
                      blockType={blockType}
                      editor={editor}
                    />
                    {/* <Divider /> */}
                  </>
                )}
              {/* <Divider /> */}
              {config.biu && (
                <>
                  <button
                    disabled={!isEditable}
                    onClick={() => {
                      activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                    }}
                    className={
                      'toolbar-item spaced ' + (isBold ? 'active' : '')
                    }
                    title={IS_APPLE ? 'Bold (⌘B)' : 'Bold (Ctrl+B)'}
                    type="button"
                    aria-label={`Format text as bold. Shortcut: ${
                      IS_APPLE ? '⌘B' : 'Ctrl+B'
                    }`}>
                    <i className="format bold" />
                  </button>

                  <button
                    disabled={!isEditable}
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        'italic',
                      );
                    }}
                    className={
                      'toolbar-item spaced ' + (isItalic ? 'active' : '')
                    }
                    title={IS_APPLE ? 'Italic (⌘I)' : 'Italic (Ctrl+I)'}
                    type="button"
                    aria-label={`Format text as italics. Shortcut: ${
                      IS_APPLE ? '⌘I' : 'Ctrl+I'
                    }`}>
                    <i className="format italic" />
                  </button>
                  <button
                    disabled={!isEditable}
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        'underline',
                      );
                    }}
                    className={
                      'toolbar-item spaced ' + (isUnderline ? 'active' : '')
                    }
                    title={IS_APPLE ? 'Underline (⌘U)' : 'Underline (Ctrl+U)'}
                    type="button"
                    aria-label={`Format text to underlined. Shortcut: ${
                      IS_APPLE ? '⌘U' : 'Ctrl+U'
                    }`}>
                    <i className="format underline" />
                  </button>
                </>
              )}
              {config.codeBlock && (
                <button
                  disabled={!isEditable}
                  onClick={() => {
                    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
                  }}
                  className={'toolbar-item spaced ' + (isCode ? 'active' : '')}
                  title="Insert code block"
                  type="button"
                  aria-label="Insert code block">
                  <i className="format code" />
                </button>
              )}
              {config.link && (
                <button
                  disabled={!isEditable}
                  onClick={insertLink}
                  className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
                  aria-label="Insert link"
                  title="Insert link"
                  type="button">
                  <i className="format link" />
                </button>
              )}

              {config.uppercase && (
                <>
                  <button
                    disabled={!isEditable}
                    onClick={() => handleTextTransform('uppercase')}
                    className={'toolbar-item spaced '}
                    aria-label="Format text as uppercase"
                    title="UPPERCASE"
                    type="button">
                    <i className="format uppercase" />
                  </button>
                </>
              )}

              {config.lowercase && (
                <>
                  <button
                    disabled={!isEditable}
                    onClick={() => handleTextTransform('lowercase')}
                    className={'toolbar-item spaced '}
                    aria-label="Format text as lowercase"
                    title="lowercase"
                    type="button">
                    <i className="format lowercase" />
                  </button>
                </>
              )}

              {config.capitalize && (
                <>
                  <button
                    disabled={!isEditable}
                    onClick={() => handleTextTransform('capitalize')}
                    className={'toolbar-item spaced '}
                    aria-label="Capitalize text"
                    title="Capitalize"
                    type="button">
                    <i className="format capitalize" />
                  </button>
                </>
              )}

              {config.RTL && (
                <button
                  onClick={onRTLClick}
                  className="toolbar-item"
                  title="Right to Left"
                  aria-label="Switch text direction to right to left">
                  <i className="format rtl" />
                </button>
              )}

              {config.LTR && (
                <button
                  onClick={onLTRClick}
                  className="toolbar-item"
                  title="Left to Right"
                  aria-label="Switch text direction to left to right">
                  <i className="format ltr" />
                </button>
              )}

              {config.selectLang && (
                <select
                  value={selectedLang}
                  onChange={handleTextTranslibretranslateform}
                  className="toolbar-item"
                  title="Select Language">
                  {langOptions.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.id}
                    </option>
                  ))}
                </select>
              )}

              {config.textColorPicker && (
                <ColorPicker
                  bit={true}
                  disabled={!isEditable}
                  buttonClassName="toolbar-item color-picker"
                  buttonAriaLabel="Formatting text color"
                  buttonIconClassName="icon font-color"
                  color={fontColor}
                  onChange={onFontColorSelect}
                  title="text color"
                />
              )}
              {config.bgColorPicker && (
                <ColorPicker
                  bit={true}
                  disabled={!isEditable}
                  buttonClassName="toolbar-item color-picker"
                  buttonAriaLabel="Formatting background color"
                  buttonIconClassName="icon bg-color"
                  color={bgColor}
                  onChange={onBgColorSelect}
                  title="bg color"
                />
              )}
            </>
          )}
          {/* <Divider /> */}
          {config.align && (
            <DropDown
              bit={true}
              disabled={!isEditable}
              anchorElem={anchorElem}
              // buttonLabel="Align"
              buttonIconClassName="icon left-align"
              buttonClassName="toolbar-item spaced alignment"
              buttonAriaLabel="Formatting options for text alignment">
              <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                }}
                className="item">
                <i className="icon left-align" />
                <span className="text">Left Align</span>
              </DropDownItem>
              <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(
                    FORMAT_ELEMENT_COMMAND,
                    'center',
                  );
                }}
                className="item">
                <i className="icon center-align" />
                <span className="text">Center Align</span>
              </DropDownItem>
              <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                }}
                className="item">
                <i className="icon right-align" />
                <span className="text">Right Align</span>
              </DropDownItem>
              <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(
                    FORMAT_ELEMENT_COMMAND,
                    'justify',
                  );
                }}
                className="item">
                <i className="icon justify-align" />
                <span className="text">Justify Align</span>
              </DropDownItem>
              <Divider />
              <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(
                    OUTDENT_CONTENT_COMMAND,
                    undefined,
                  );
                }}
                className="item">
                <i className={'icon ' + (isRTL ? 'indent' : 'outdent')} />
                <span className="text">Outdent</span>
              </DropDownItem>
              <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(
                    INDENT_CONTENT_COMMAND,
                    undefined,
                  );
                }}
                className="item">
                <i className={'icon ' + (isRTL ? 'outdent' : 'indent')} />
                <span className="text">Indent</span>
              </DropDownItem>
            </DropDown>
          )}

          {/* {handleClick && (
            <>
              <button type="button" className="toolbar-item spaced">
                <div className="toolbar-item spaced">
                  <label htmlFor="file-upload" className="custom-file-uploads">
                    <SvgIcon />
                  </label>
                  <input
                    id="file-upload"
                    onChange={handleClick}
                    className="textfileupload"
                    type="file"
                    accept="video/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, text/csv"
                  />
                </div>
              </button>
            </>
          )} */}
          {config.fontSizeOptions && (
            <FontDropDown
              bit={true}
              disabled={!isEditable}
              style={'font-size'}
              value={fontSize}
              editor={editor}
              options={FONT_SIZE_OPTIONS}
            />
          )}

          {config.formatTextOptions && (
            <DropDown
              bit={true}
              anchorElem={anchorElem}
              disabled={!isEditable}
              buttonClassName="toolbar-item spaced"
              buttonLabel=""
              buttonAriaLabel="Formatting options for additional text styles"
              buttonIconClassName="icon dropdowns-more">
              <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(
                    FORMAT_TEXT_COMMAND,
                    'strikethrough',
                  );
                }}
                className={'item ' + dropDownActiveClass(isStrikethrough)}
                title="Strikethrough"
                aria-label="Format text with a strikethrough">
                <i className="icon strikethrough" />
                <span className="text">Strikethrough</span>
              </DropDownItem>
              <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(
                    FORMAT_TEXT_COMMAND,
                    'subscript',
                  );
                }}
                className={'item ' + dropDownActiveClass(isSubscript)}
                title="Subscript"
                aria-label="Format text with a subscript">
                <i className="icon subscript" />
                <span className="text">Subscript</span>
              </DropDownItem>
              <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(
                    FORMAT_TEXT_COMMAND,
                    'superscript',
                  );
                }}
                className={'item ' + dropDownActiveClass(isSuperscript)}
                title="Superscript"
                aria-label="Format text with a superscript">
                <i className="icon superscript" />
                <span className="text">Superscript</span>
              </DropDownItem>
              <DropDownItem
                onClick={clearFormatting}
                className="item"
                title="Clear text formatting"
                aria-label="Clear all text formatting">
                <i className="icon clear" />
                <span className="text">Clear Formatting</span>
              </DropDownItem>
            </DropDown>
          )}
        </>
      ) : (
        <>
          {config.undoRedo && (
            <>
              <button
                disabled={!canUndo || !isEditable}
                onClick={() => {
                  activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                title={IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
                type="button"
                className="toolbar-item spaced"
                aria-label="Undo">
                <i className="format undo" />
              </button>
              <button
                disabled={!canRedo || !isEditable}
                onClick={() => {
                  activeEditor.dispatchCommand(REDO_COMMAND, undefined);
                }}
                title={IS_APPLE ? 'Redo (⌘Y)' : 'Redo (Ctrl+Y)'}
                type="button"
                className="toolbar-item"
                aria-label="Redo">
                <i className="format redo" />
              </button>
            </>
          )}
          {/* <Divider /> */}

          {config.editorshow && (
            <>
              {blockType === 'code' ? (
                <>
                  <DropDown
                    anchorElem={anchorElem}
                    disabled={!isEditable}
                    buttonClassName="toolbar-item code-language"
                    buttonLabel={getLanguageFriendlyName(codeLanguage)}
                    buttonAriaLabel="Select language">
                    {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
                      return (
                        <DropDownItem
                          className={`item ${dropDownActiveClass(
                            value === codeLanguage,
                          )}`}
                          onClick={() => onCodeLanguageSelect(value)}
                          key={value}>
                          <span className="text">{name}</span>
                        </DropDownItem>
                      );
                    })}
                  </DropDown>
                </>
              ) : (
                <>
                  {Boolean(config.fontFamilyOptions) && (
                    <FontDropDown
                      disabled={!isEditable}
                      style={'font-family'}
                      value={fontFamily}
                      editor={editor}
                      options={normFontFamilyOption}
                    />
                  )}
                  {config.formatBlockOptions &&
                    blockType in blockTypeToBlockName &&
                    activeEditor === editor && (
                      <>
                        <BlockFormatDropDown
                          disabled={!isEditable}
                          blockType={blockType}
                          editor={editor}
                        />
                        {/* <Divider /> */}
                      </>
                    )}
                  {/* <Divider /> */}
                  {config.biu && (
                    <>
                      <button
                        disabled={!isEditable}
                        onClick={() => {
                          activeEditor.dispatchCommand(
                            FORMAT_TEXT_COMMAND,
                            'bold',
                          );
                        }}
                        className={
                          'toolbar-item spaced ' + (isBold ? 'active' : '')
                        }
                        title={IS_APPLE ? 'Bold (⌘B)' : 'Bold (Ctrl+B)'}
                        type="button"
                        aria-label={`Format text as bold. Shortcut: ${
                          IS_APPLE ? '⌘B' : 'Ctrl+B'
                        }`}>
                        <i className="format bold" />
                      </button>

                      <button
                        disabled={!isEditable}
                        onClick={() => {
                          activeEditor.dispatchCommand(
                            FORMAT_TEXT_COMMAND,
                            'italic',
                          );
                        }}
                        className={
                          'toolbar-item spaced ' + (isItalic ? 'active' : '')
                        }
                        title={IS_APPLE ? 'Italic (⌘I)' : 'Italic (Ctrl+I)'}
                        type="button"
                        aria-label={`Format text as italics. Shortcut: ${
                          IS_APPLE ? '⌘I' : 'Ctrl+I'
                        }`}>
                        <i className="format italic" />
                      </button>
                      <button
                        disabled={!isEditable}
                        onClick={() => {
                          activeEditor.dispatchCommand(
                            FORMAT_TEXT_COMMAND,
                            'underline',
                          );
                        }}
                        className={
                          'toolbar-item spaced ' + (isUnderline ? 'active' : '')
                        }
                        title={
                          IS_APPLE ? 'Underline (⌘U)' : 'Underline (Ctrl+U)'
                        }
                        type="button"
                        aria-label={`Format text to underlined. Shortcut: ${
                          IS_APPLE ? '⌘U' : 'Ctrl+U'
                        }`}>
                        <i className="format underline" />
                      </button>
                    </>
                  )}
                  {config.codeBlock && (
                    <button
                      disabled={!isEditable}
                      onClick={() => {
                        activeEditor.dispatchCommand(
                          FORMAT_TEXT_COMMAND,
                          'code',
                        );
                      }}
                      className={
                        'toolbar-item spaced ' + (isCode ? 'active' : '')
                      }
                      title="Insert code block"
                      type="button"
                      aria-label="Insert code block">
                      <i className="format code" />
                    </button>
                  )}
                  {config.link && (
                    <button
                      disabled={!isEditable}
                      onClick={insertLink}
                      className={
                        'toolbar-item spaced ' + (isLink ? 'active' : '')
                      }
                      aria-label="Insert link"
                      title="Insert link"
                      type="button">
                      <i className="format link" />
                    </button>
                  )}

                  {config.uppercase && (
                    <>
                      <button
                        disabled={!isEditable}
                        onClick={() => handleTextTransform('uppercase')}
                        className={'toolbar-item spaced '}
                        aria-label="Format text as uppercase"
                        title="UPPERCASE"
                        type="button">
                        <i className="format uppercase" />
                      </button>
                    </>
                  )}

                  {config.lowercase && (
                    <>
                      <button
                        disabled={!isEditable}
                        onClick={() => handleTextTransform('lowercase')}
                        className={'toolbar-item spaced '}
                        aria-label="Format text as lowercase"
                        title="lowercase"
                        type="button">
                        <i className="format lowercase" />
                      </button>
                    </>
                  )}

                  {config.capitalize && (
                    <>
                      <button
                        disabled={!isEditable}
                        onClick={() => handleTextTransform('capitalize')}
                        className={'toolbar-item spaced '}
                        aria-label="Capitalize text"
                        title="Capitalize"
                        type="button">
                        <i className="format capitalize" />
                      </button>
                    </>
                  )}

                  {config.RTL && (
                    <button
                      onClick={onRTLClick}
                      className="toolbar-item"
                      title="Right to Left"
                      aria-label="Switch text direction to right to left">
                      <i className="format rtl" />
                    </button>
                  )}

                  {config.LTR && (
                    <button
                      onClick={onLTRClick}
                      className="toolbar-item"
                      title="Left to Right"
                      aria-label="Switch text direction to left to right">
                      <i className="format ltr" />
                    </button>
                  )}

                  {config.textColorPicker && (
                    <ColorPicker
                      disabled={!isEditable}
                      buttonClassName="toolbar-item color-picker"
                      buttonAriaLabel="Formatting text color"
                      buttonIconClassName="icon font-color"
                      color={fontColor}
                      onChange={onFontColorSelect}
                      title="text color"
                    />
                  )}
                  {config.bgColorPicker && (
                    <ColorPicker
                      disabled={!isEditable}
                      buttonClassName="toolbar-item color-picker"
                      buttonAriaLabel="Formatting background color"
                      buttonIconClassName="icon bg-color"
                      color={bgColor}
                      onChange={onBgColorSelect}
                      title="bg color"
                    />
                  )}
                </>
              )}
              {/* <Divider /> */}
              {config.align && (
                <DropDown
                  anchorElem={anchorElem}
                  disabled={!isEditable}
                  // buttonLabel="Align"
                  buttonIconClassName="icon left-align"
                  buttonClassName="toolbar-item spaced alignment"
                  buttonAriaLabel="Formatting options for text alignment">
                  <DropDownItem
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        FORMAT_ELEMENT_COMMAND,
                        'left',
                      );
                    }}
                    className="item">
                    <i className="icon left-align" />
                    <span className="text">Left Align</span>
                  </DropDownItem>
                  <DropDownItem
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        FORMAT_ELEMENT_COMMAND,
                        'center',
                      );
                    }}
                    className="item">
                    <i className="icon center-align" />
                    <span className="text">Center Align</span>
                  </DropDownItem>
                  <DropDownItem
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        FORMAT_ELEMENT_COMMAND,
                        'right',
                      );
                    }}
                    className="item">
                    <i className="icon right-align" />
                    <span className="text">Right Align</span>
                  </DropDownItem>
                  <DropDownItem
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        FORMAT_ELEMENT_COMMAND,
                        'justify',
                      );
                    }}
                    className="item">
                    <i className="icon justify-align" />
                    <span className="text">Justify Align</span>
                  </DropDownItem>
                  <Divider />
                  <DropDownItem
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        OUTDENT_CONTENT_COMMAND,
                        undefined,
                      );
                    }}
                    className="item">
                    <i className={'icon ' + (isRTL ? 'indent' : 'outdent')} />
                    <span className="text">Outdent</span>
                  </DropDownItem>
                  <DropDownItem
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        INDENT_CONTENT_COMMAND,
                        undefined,
                      );
                    }}
                    className="item">
                    <i className={'icon ' + (isRTL ? 'outdent' : 'indent')} />
                    <span className="text">Indent</span>
                  </DropDownItem>
                </DropDown>
              )}

              {config.fontSizeOptions && (
                <FontDropDown
                  disabled={!isEditable}
                  style={'font-size'}
                  value={fontSize}
                  editor={editor}
                  options={FONT_SIZE_OPTIONS}
                />
              )}

              {config?.insertOptions && (
                <DropDown
                  anchorElem={anchorElem}
                  disabled={!isEditable}
                  buttonClassName="toolbar-item spaced"
                  // buttonLabel="Insert"
                  buttonAriaLabel="Insert specialized editor node"
                  buttonIconClassName="icon plus">
                  {/* <DropDownItem
                onClick={() => {
                  activeEditor.dispatchCommand(
                    INSERT_HORIZONTAL_RULE_COMMAND,
                    undefined,
                  );
                }}
                className="item">
                <i className="icon horizontal-rule" />
                <span className="text">Horizontal Rule</span>
              </DropDownItem> */}
                  {handleClick && (
                    <>
                      <DropDownItem
                        onClick={() => {
                          showModal('Upload Document', (onClose) => (
                            <InsertImageDialog
                              activeEditor={activeEditor}
                              onClose={onClose}
                              handleClick={handleClick}
                            />
                          ));
                        }}
                        className="item">
                        <i className="icon image" />
                        <span className="text">Upload Document</span>
                      </DropDownItem>
                    </>
                  )}

                  {/* 
                  <DropDownItem
                    onClick={() => {
                      showModal('Insert Table', (onClose) => (
                        <InsertTableDialog
                          activeEditor={activeEditor}
                          onClose={onClose}
                        />
                      ));
                    }}
                    className="item">
                    <i className="icon table" />
                    <span className="text">Table</span>
                  </DropDownItem> */}

                  {/* <DropDownItem
                onClick={() => {
                  showModal('Insert Poll', (onClose) => (
                    <InsertPollDialog
                      activeEditor={activeEditor}
                      onClose={onClose}
                    />
                  ));
                }}
                className="item">
                <i className="icon poll" />
                <span className="text">Poll</span>
              </DropDownItem> */}
                  {/* <DropDownItem
                onClick={() => {
                  editor.update(() => {
                    const root = $getRoot();
                    const stickyNode = $createStickyNode(0, 0);
                    root.append(stickyNode);
                  });
                }}
                className="item">
                <i className="icon sticky" />
                <span className="text">Sticky Note</span>
              </DropDownItem>
              <DropDownItem
                onClick={() => {
                  editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
                }}
                className="item">
                <i className="icon caret-right" />
                <span className="text">Collapsible container</span>
              </DropDownItem>
              {EmbedConfigs.map((embedConfig) => (
                <DropDownItem
                  key={embedConfig.type}
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      INSERT_EMBED_COMMAND,
                      embedConfig.type,
                    );
                  }}
                  className="item">
                  {embedConfig.icon}
                  <span className="text">{embedConfig.contentName}</span>
                </DropDownItem>
              ))}
              {editorContext.extensions.toolbarInsertsAfter.map(
                ([extName, ExtDropDownItem]) => (
                  <ExtDropDownItem
                    key={extName}
                    showModal={showModal}
                    activeEditor={activeEditor}
                  />
                ),
              )}*/}
                </DropDown>
              )}

              {config.formatTextOptions && (
                <DropDown
                  anchorElem={anchorElem}
                  disabled={!isEditable}
                  buttonClassName="toolbar-item spaced"
                  buttonLabel=""
                  buttonAriaLabel="Formatting options for additional text styles"
                  buttonIconClassName="icon dropdowns-more">
                  <DropDownItem
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        'strikethrough',
                      );
                    }}
                    className={'item ' + dropDownActiveClass(isStrikethrough)}
                    title="Strikethrough"
                    aria-label="Format text with a strikethrough">
                    <i className="icon strikethrough" />
                    <span className="text">Strikethrough</span>
                  </DropDownItem>
                  <DropDownItem
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        'subscript',
                      );
                    }}
                    className={'item ' + dropDownActiveClass(isSubscript)}
                    title="Subscript"
                    aria-label="Format text with a subscript">
                    <i className="icon subscript" />
                    <span className="text">Subscript</span>
                  </DropDownItem>
                  <DropDownItem
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        'superscript',
                      );
                    }}
                    className={'item ' + dropDownActiveClass(isSuperscript)}
                    title="Superscript"
                    aria-label="Format text with a superscript">
                    <i className="icon superscript" />
                    <span className="text">Superscript</span>
                  </DropDownItem>
                  <DropDownItem
                    onClick={clearFormatting}
                    className="item"
                    title="Clear text formatting"
                    aria-label="Clear all text formatting">
                    <i className="icon clear" />
                    <span className="text">Clear Formatting</span>
                  </DropDownItem>
                </DropDown>
              )}
            </>
          )}
        </>
      )}
      {modal}
    </div>
  );
}
