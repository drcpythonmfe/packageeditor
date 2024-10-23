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
 let data = `<p class="TextEditor__paragraph" dir="ltr"><span>sdfsdf</span></p><p class="TextEditor__paragraph" dir="ltr"><span>sdfs</span></p><p class="TextEditor__paragraph" dir="ltr"><span>sdfsdf</span><br><i><b><strong class="TextEditor__textBold TextEditor__textItalic">SDSDF</strong></b></i><br><span>SD</span><br><span>FSDFSD</span><br><span>F</span><br><span style="font-size: 14px;">SdFS</span></p><p class="TextEditor__paragraph" dir="ltr"><span style="font-size: 14px;">adf</span></p><p class="TextEditor__paragraph" dir="ltr"><span style="font-size: 14px;">sd</span></p><p class="TextEditor__paragraph" dir="ltr"><br><span>asdasfdas</span></p><p class="TextEditor__paragraph" dir="ltr"><span>a</span></p><p class="TextEditor__paragraph" dir="ltr"><span>fsdfsdf</span></p>
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
