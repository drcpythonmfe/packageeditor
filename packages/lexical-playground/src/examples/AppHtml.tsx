/* eslint-disable header/header */
import * as React from 'react';
import {useState} from 'react';

import {Editor, EditorComposer, useSyncWithInputHtml} from '../index';


const dummyMentionsData = [
  'Aayla Secura',
  'Adi Gallia',
  'Admiral Dodd Rancit',
  'Admiral Firmus Piett',
  'Admiral Gial Ackbar',
  'Admiral Ozzel',
  'Admiral Raddus',
  'Admiral Terrinald Screed',
  'Admiral Trench',
  'Walrus Man',
  'Warok',
  'Wat Tambor',
  'Watto',
  'Wedge Antilles',
  'Wes Janson',
  'Wicket W. Warrick',
  'Wilhuff Tarkin',
];

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const uploadImg = async (file: File, altText: string) => {
  console.log("file",file)
  await delay(500);
  let data = {
    url : `http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
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
      onChangeMode="html"
      toolbarConfig={toolbarConfig}
      dummyMentionsDatas={userList || []}
    />
  );
}

export default function PlaygroundApp1(): JSX.Element {
 
  const [html, setHtml] = useState(``);
  
  return (
    <>
    <EditorComposer>
        <App html={html}  setHtml={setHtml}   userList={dummyMentionsData} />
      </EditorComposer>
      <div dangerouslySetInnerHTML={{__html: html}} />
    </>
  );
}
