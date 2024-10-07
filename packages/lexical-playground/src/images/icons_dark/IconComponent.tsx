import * as React from "react";

import { ReactComponent as ArrowClockwise } from "./arrow-clockwise.svg";
import { ReactComponent as ArrowCounterclockwise } from "./arrow-counterclockwise.svg";
import { ReactComponent as BgColor } from "./bg-color.svg";
import { ReactComponent as Camera } from "./camera.svg";
import { ReactComponent as CardChecklist } from "./card-checklist.svg";
import { ReactComponent as CaretRightFill } from "./caret-right-fill.svg";
import { ReactComponent as ChatLeftText } from "./chat-left-text.svg";
import { ReactComponent as ChatRightDots } from "./chat-right-dots.svg";
import { ReactComponent as ChatRightText } from "./chat-right-text.svg";
import { ReactComponent as ChatSquareQuote } from "./chat-square-quote.svg";
import { ReactComponent as ChevronDown } from "./chevron-down.svg";
import { ReactComponent as Clipboard } from "./clipboard.svg";
import { ReactComponent as Close } from "./close.svg";
import { ReactComponent as Code } from "./code.svg";
import { ReactComponent as Comments } from "./comments.svg";
import { ReactComponent as Copy } from "./copy.svg";
import { ReactComponent as Diagram2 } from "./diagram-2.svg";
import { ReactComponent as Download } from "./download.svg";
import { ReactComponent as DraggableBlockMenu } from "./draggable-block-menu.svg";
import { ReactComponent as DropdownMore } from "./dropdown-more.svg";
import { ReactComponent as Figma } from "./figma.svg";
import { ReactComponent as FileEarmarkText } from "./file-earmark-text.svg";
import { ReactComponent as FileImage } from "./file-image.svg";
import { ReactComponent as FiletypeGif } from "./filetype-gif.svg";
import { ReactComponent as FontColor } from "./font-color.svg";
import { ReactComponent as FontFamily } from "./font-family.svg";
import { ReactComponent as Gear } from "./gear.svg";
import { ReactComponent as HorizontalRule } from "./horizontal-rule.svg";
import { ReactComponent as Indent } from "./indent.svg";
import { ReactComponent as JournalCode } from "./journal-code.svg";
import { ReactComponent as JournalText } from "./journal-text.svg";
import { ReactComponent as Justify } from "./justify.svg";
import { ReactComponent as Link } from "./link.svg";
import { ReactComponent as ListOl } from "./list-ol.svg";
import { ReactComponent as ListUl } from "./list-ul.svg";
import { ReactComponent as LockFill } from "./lock-fill.svg";
import { ReactComponent as Markdown } from "./markdown.svg";
import { ReactComponent as Mic } from "./mic.svg";
import { ReactComponent as Outdent } from "./outdent.svg";
import { ReactComponent as PaintBucket } from "./paint-bucket.svg";
import { ReactComponent as Palette } from "./palette.svg";
import { ReactComponent as PencilFill } from "./pencil-fill.svg";
import { ReactComponent as PlugFill } from "./plug-fill.svg";
import { ReactComponent as Plus } from "./plus.svg";
import { ReactComponent as PlusSlashMinus } from "./plus-slash-minus.svg";
import { ReactComponent as Prettier } from "./prettier.svg";
import { ReactComponent as Send } from "./send.svg";
import { ReactComponent as SquareCheck } from "./square-check.svg";
import { ReactComponent as Sticky } from "./sticky.svg";
import { ReactComponent as Success } from "./success.svg";
import { ReactComponent as Table } from "./table.svg";
import { ReactComponent as TextCenter } from "./text-center.svg";
import { ReactComponent as TextLeft } from "./text-left.svg";
import { ReactComponent as TextParagraph } from "./text-paragraph.svg";
import { ReactComponent as TextRight } from "./text-right.svg";
import { ReactComponent as Trash } from "./trash.svg";
import { ReactComponent as Tweet } from "./tweet.svg";
import { ReactComponent as TypeBold } from "./type-bold.svg";
import { ReactComponent as TypeH1 } from "./type-h1.svg";
import { ReactComponent as TypeH2 } from "./type-h2.svg";
import { ReactComponent as TypeH3 } from "./type-h3.svg";
import { ReactComponent as TypeH4 } from "./type-h4.svg";
import { ReactComponent as TypeH5 } from "./type-h5.svg";
import { ReactComponent as TypeH6 } from "./type-h6.svg";
import { ReactComponent as TypeItalic } from "./type-italic.svg";
import { ReactComponent as TypeStrikethrough } from "./type-strikethrough.svg";
import { ReactComponent as TypeSubscript } from "./type-subscript.svg";
import { ReactComponent as TypeSuperscript } from "./type-superscript.svg";
import { ReactComponent as TypeUnderline } from "./type-underline.svg";
import { ReactComponent as Upload } from "./upload.svg";
import { ReactComponent as User } from "./user.svg";
import { ReactComponent as Youtube } from "./youtube.svg";

const iconTypes: { [key: string]: React.FunctionComponent<React.SVGProps<SVGSVGElement>> } = {
  arrowClockwise: ArrowClockwise,
  arrowCounterclockwise: ArrowCounterclockwise,
  bgColor: BgColor,
  camera: Camera,
  cardChecklist: CardChecklist,
  caretRightFill: CaretRightFill,
  chatLeftText: ChatLeftText,
  chatRightDots: ChatRightDots,
  chatRightText: ChatRightText,
  chatSquareQuote: ChatSquareQuote,
  chevronDown: ChevronDown,
  clipboard: Clipboard,
  close: Close,
  code: Code,
  comments: Comments,
  copy: Copy,
  diagram2: Diagram2,
  download: Download,
  draggableBlockMenu: DraggableBlockMenu,
  dropdownMore: DropdownMore,
  figma: Figma,
  fileEarmarkText: FileEarmarkText,
  fileImage: FileImage,
  filetypeGif: FiletypeGif,
  fontColor: FontColor,
  fontFamily: FontFamily,
  gear: Gear,
  horizontalRule: HorizontalRule,
  indent: Indent,
  journalCode: JournalCode,
  journalText: JournalText,
  justify: Justify,
  link: Link,
  listOl: ListOl,
  listUl: ListUl,
  lockFill: LockFill,
  markdown: Markdown,
  mic: Mic,
  outdent: Outdent,
  paintBucket: PaintBucket,
  palette: Palette,
  pencilFill: PencilFill,
  plugFill: PlugFill,
  plus: Plus,
  plusSlashMinus: PlusSlashMinus,
  prettier: Prettier,
  send: Send,
  squareCheck: SquareCheck,
  sticky: Sticky,
  success: Success,
  table: Table,
  textCenter: TextCenter,
  textLeft: TextLeft,
  textParagraph: TextParagraph,
  textRight: TextRight,
  trash: Trash,
  tweet: Tweet,
  typeBold: TypeBold,
  typeH1: TypeH1,
  typeH2: TypeH2,
  typeH3: TypeH3,
  typeH4: TypeH4,
  typeH5: TypeH5,
  typeH6: TypeH6,
  typeItalic: TypeItalic,
  typeStrikethrough: TypeStrikethrough,
  typeSubscript: TypeSubscript,
  typeSuperscript: TypeSuperscript,
  typeUnderline: TypeUnderline,
  upload: Upload,
  user: User,
  youtube: Youtube,
} as const;


type IconName = any;

interface IconComponentProps extends React.SVGProps<SVGSVGElement> {
    name: IconName;
  }
  
const IconComponent: React.FC<IconComponentProps> = ({ name, ...props }) => {
const [isDarkTheme, setIsDarkTheme] = React.useState(false);


React.useEffect(() => {
    const checkTheme = () => {
      const isDark = document.body.classList.contains('theme-dark');
      setIsDarkTheme(isDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);


  const Icon = iconTypes[name];
  if (!Icon) {
    return null; 
  }


  if(isDarkTheme){
    return <Icon {...props}  fill={'#fff'} />;

  }
  
  return <Icon {...props}   />;
};

export default IconComponent;