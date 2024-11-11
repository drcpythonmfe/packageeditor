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
    url : `https://commondatastorage.googleapis.com/codeskulptor-assets/lathrop/nebula_blue.s2014.png`,
    id :  126548545485465 
  }
  return data
};

const onDataSend = async (file: File) => {
  console.log(file)
  await delay(500);

  let data = {
    url : `http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
    id :  Math.random() 
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

  embedVideo: true,
  embedPdf: true,
  embedOffice: true,
  
  image: true,
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
      onDataSend={onDataSend}
      dummyMentionsDatas={userList || []}
    />
  );
}

export default function PlaygroundApp1(): JSX.Element {
 

  let data = `<div><p class="TextEditor__paragraph" dir="ltr"><span style="text-align: left;">asdadasdad</span></p><p><a href="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" target="_blank" rel="0.7138092931844775" data-lexical-video-url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" data-lexical-video-id="0.7138092931844775"><span title="0.7138092931844775" alt="0.7138092931844775" style="background-color: rgb(140, 116, 247); border-radius: 8px; color: white; display: inline-block; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; padding: 6px; text-decoration: none; width: 250px; height: 30px;">BigBuckBunny.mp4</span></a></p><p> </p><p></p><p class="TextEditor__paragraph"><br></p></div>`
  const [html, setHtml] = useState(data);
  
  return (
    <>
    <EditorComposer>
        <App html={html}  setHtml={setHtml}   userList={dummyMentionsData} />
      </EditorComposer>
      <div dangerouslySetInnerHTML={{__html: html}} />
    </>
  );
}
