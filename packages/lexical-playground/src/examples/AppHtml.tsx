/* eslint-disable header/header */
import * as React from 'react';
import {useState} from 'react';

import {Editor, EditorComposer, useSyncWithInputHtml} from '../index';


const dummyMentionsData = [
  {
    name: 'Aayla Secura',
    email: 'aayla.secura@example.com',
  },
  {
    name: 'Adi Gallia',
    email: 'adi.gallia@example.com',
  },
]


const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const uploadImg = async (file: File) => {
  await delay(500);
  let data = {
    url : `https://media.stage.truflux.drcsystems.ooo/uploads/project/372/DRC-logo.png`,
    id :  126548545485465 
  }
  return data
};



const toolbarConfig ={
  align: true,
  bgColorPicker: true,
  biu: true,
  codeBlock: false,
  fontFamilyOptions: false,
  fontSizeOptions: false,
  formatBlockOptions: true,
  formatTextOptions: true,
  insertOptions: true,
  link: true,
  textColorPicker: true,
  undoRedo: true,
  paragraph: false,      //   / type data 
  heading1: false,
  heading2: false,
  heading3: false,
  table: true,
  numberedList: false,
  bulletedList: false,
  checkList: true,
  embedYoutubeVideo: false,
  embedVideo: false,
  embedPdf: false,
  embedOffice: false,
  UploadDocuments: true,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  alignJustify: false,
  editorshow:true,
}

function App({
  html,
  setHtml,
  userList
}: {
  html: string;
  setHtml: (newHtml: string) => void;
  userList:any;
}): JSX.Element {
  useSyncWithInputHtml(html);

  return (
    <Editor
      isRichText={true}
      onChange={setHtml}
      onUpload={uploadImg}
      onDataSend={uploadImg}
      onChangeMode="html"
      toolbarConfig={toolbarConfig}
      dummyMentionsDatas={userList || []}
    />
  );
}

function validateParagraphs(htmlText: string): boolean {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlText.trim();

  if (tempDiv.querySelectorAll('img').length > 0) {
    return false;
  }

  const paragraphs = tempDiv.querySelectorAll('p');

  if (paragraphs.length === 0) {
      return false;
  }

  let nonEmptyTextCount = 0;

  for (const paragraph of Array.from(paragraphs)) {
      const directTextContent = Array.from(paragraph.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent?.trim())
          .filter(text => text && text !== '');

      if (directTextContent.length > 0) {
          nonEmptyTextCount++;
      }

      const childTextContent = paragraph.textContent?.trim() || '';

      if (childTextContent !== '') {
          nonEmptyTextCount++;
      }
  }

  return nonEmptyTextCount <= 0;
}


export default function PlaygroundApp1(): JSX.Element {
 
  const [html, setHtml] = useState(`<p class="TextEditor__paragraph"><span id="adi.gallia@example.com" data-lexical-mention="adi.gallia@example.com" uemail="adi.gallia@example.com">Adi Gallia</span></p>`);
  
   React.useEffect(()=>{
    // button hide show
    validateParagraphs(html)
   },[html])
  
  return (
    <>
    <EditorComposer>
        <App html={html}  setHtml={setHtml}   userList={dummyMentionsData} />
      </EditorComposer>
    <div dangerouslySetInnerHTML={{__html: html}} />
    </>
  );
}
