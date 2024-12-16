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
];

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const uploadImg = async (file: File) => {
  await delay(500);
  let data = {
    url: `https://media.stage.truflux.drcsystems.ooo/uploads/project/372/DRC-logo.png`,
    id: 126548545485465,
  };
  return data;
};

const toolbarConfig = {
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
  paragraph: false, //   / type data
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
  editorshow: true,
};

function App({
  html,
  setHtml,
  userList,
}: {
  html: string;
  setHtml: (newHtml: string) => void;
  userList: any;
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

const addTextData = (html: any) => {
  const JSONDATA =
    JSON.stringify(html) ==
    JSON.stringify(`<p class="TextEditor__paragraph"><br></p>`);
  if (JSONDATA) {
    return true;
  } else {
    return false;
  }
};

export default function PlaygroundApp1(): JSX.Element {
  const [html, setHtml] = useState(``);
  const [bit ,setBit] =useState(true)

  React.useEffect(() => {
    console.log("html",html)
    console.log(addTextData(html));
    setBit(addTextData(html))
  }, [html]);

  return (
    <>
      <EditorComposer>
        <App html={html} setHtml={setHtml} userList={dummyMentionsData} />
      </EditorComposer>
      <div dangerouslySetInnerHTML={{__html: html}} />
      <button disabled={bit}>hello js</button>
    </>
  );
}
