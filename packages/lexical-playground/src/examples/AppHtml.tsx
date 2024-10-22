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
  return `https://media.stage.truflux.drcsystems.ooo/uploads/project/372/2024-09-16_13-38-11_1.mp4`;
};

const onDataSend = async (file: File) => {
  console.log(file)
  await delay(500);
  // return `https://media.stage.truflux.drcsystems.ooo/uploads/project/372/2024-09-16_13-38-11_1.mp4`;

  return `https://media.stage.truflux.drcsystems.ooo/uploads/project/294/Designs for SectorConnect Requriements _1__6.pptx`;
};

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

  console.log(html)

  return (
    <Editor
      isRichText={true}
      onChange={setHtml}
      onUpload={uploadImg}
      onChangeMode="html"
      onDataSend={onDataSend}
      dummyMentionsDatas={userList || []}
    />
  );
}

export default function PlaygroundApp1(): JSX.Element {
 let data = `<p class="TextEditor__paragraph"><br></p><p><a href="https://media.stage.truflux.drcsystems.ooo/uploads/project/372/2024-09-16_13-38-11_1.mp4" target="_blank" rel="noopener noreferrer" data-lexical-video="https://media.stage.truflux.drcsystems.ooo/uploads/project/372/2024-09-16_13-38-11_1.mp4" allowfullscreen="true"><span style="background-color: rgb(140, 116, 247); border-radius: 8px; color: white; display: inline-block; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; padding: 6px; text-decoration: none; width: auto; height: 30px;">2024-09-16_13-3...mp4</span></a><p> </p></p><p class="TextEditor__paragraph"><br></p>
 `

  const [html, setHtml] = useState(data);
  return (
    <>
      <EditorComposer>
        <App html={html} setHtml={setHtml}   userList={dummyMentionsData} />
      </EditorComposer>
      <div dangerouslySetInnerHTML={{__html: html}} />
    </>
  );
}
