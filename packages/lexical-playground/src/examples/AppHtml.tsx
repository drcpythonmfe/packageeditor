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
 let data = `<div><ul class="TextEditor__ul"><li value="1" class="TextEditor__listItem"><span>asdfsdfsf</span></li><li value="2" class="TextEditor__listItem"><span>adfdf</span></li><li value="3" class="TextEditor__listItem"><span>sdf</span></li><li value="4" class="TextEditor__listItem"><span>sdf</span></li><li value="5" class="TextEditor__listItem"><span>sdf</span></li><li value="6" class="TextEditor__listItem"></li></ul><p class="TextEditor__paragraph" dir="ltr"><span>sdf</span></p><p class="TextEditor__paragraph" dir="ltr"><span>sd</span></p><p class="TextEditor__paragraph" dir="ltr"><span>f</span></p><p class="TextEditor__paragraph" dir="ltr"><span>sf</span></p><p class="TextEditor__paragraph" dir="ltr"><span>s</span></p><p class="TextEditor__paragraph" dir="ltr"><span>fs</span></p><p class="TextEditor__paragraph" dir="ltr"><span>df</span></p><p class="TextEditor__paragraph" dir="ltr"><span>s</span></p><p class="TextEditor__paragraph" dir="ltr"><span>f</span></p><p class="TextEditor__paragraph" dir="ltr"><span>df</span></p><p class="TextEditor__paragraph" dir="ltr" style="text-align: right;"><span>fsdf</span></p></div>`

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
