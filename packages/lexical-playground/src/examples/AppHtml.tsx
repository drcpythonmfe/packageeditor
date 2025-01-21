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
    url : `https://www.drcsystems.com/wp-content/uploads/2023/07/shams-logo.png`,
    id :  126548545485465 
  }
  return data
};


const uploadImgFile = async (file: File) => {
  await delay(500);
  let data = {
    url : `https://media.truflux.drcsystems.com/uploads/project/117/comment/19532/REC-20241209101112.mp4`,
    id :  126548545485465 
  }
  return data
};

const handleAIData = async (data: string): Promise<any> => {
  await delay(500);  // api call
  return "AI Data";
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
  uppercase:true,
  lowercase:true,
  capitalize:true,
  selectLang:true,
  ai:true  // handleAIData
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
      onDataSend={uploadImgFile}
      onChangeMode="html"
      handleAIData={handleAIData}
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

  if (tempDiv.querySelectorAll('table').length > 0) {
    return false;
  }

  if (tempDiv.querySelectorAll('h1').length > 0) {
    return false;
  }

  if (tempDiv.querySelectorAll('h2').length > 0) {
    return false;
  }

  if (tempDiv.querySelectorAll('h3').length > 0) {
    return false;
  }

  if (tempDiv.querySelectorAll('li').length > 0) {
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
 
  const [html, setHtml] = useState(``);
  
   React.useEffect(()=>{
    validateParagraphs(html)
   },[html])
   
   return (
    <>
    <EditorComposer>
        <App html={html}  setHtml={setHtml}   userList={dummyMentionsData} />
      </EditorComposer>
      <button disabled={ validateParagraphs(html)}> Button </button>
      <div dangerouslySetInnerHTML={{__html: html}} />
    </>
  );
}
