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
    url : `https://media.truflux.drcsystems.com/uploads/project/117/comment/19532/REC-20241209101112.mp4`,
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
 
  const [html, setHtml] = useState(`<p class="TextEditor__paragraph"><br></p><p><a href="https://media.truflux.drcsystems.com/uploads/project/117/comment/19532/REC-20241209101112.mp4" target="_blank" rel="126548545485465" data-lexical-video-url="https://media.truflux.drcsystems.com/uploads/project/117/comment/19532/REC-20241209101112.mp4" data-lexical-video-id="126548545485465"><span title="126548545485465" alt="126548545485465" style="background-color: rgb(140, 116, 247); border-radius: 8px; color: white; display: inline-block; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; padding: 6px; text-decoration: none; width: 250px; height: 30px;">REC-20241209101112.mp4</span></a><p> </p></p><p class="TextEditor__paragraph"><br></p>`);
  
   React.useEffect(()=>{
    // button hide show
    console.log(html)
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
