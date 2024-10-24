/* eslint-disable header/header */
import * as React from 'react';
import {useState} from 'react';

import {
  Editor,
  EditorComposer,
  EditorProps,
  SerializedEditorState,
  useSyncWithInputJson,
} from '../index';


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
  json,
  setJson,
  userList
}: {
  json?: SerializedEditorState;
  setJson: (newJson: SerializedEditorState) => void;
  userList:any;
}): JSX.Element {
  useSyncWithInputJson(json);

  const handleOnChange: EditorProps['onChange'] = (jsonString, editorState) => {
    setJson(editorState.toJSON());
  };

  return <Editor isRichText={true} onChange={handleOnChange} onDataSend={onDataSend}
  dummyMentionsDatas={userList || []} onUpload={uploadImg} />;
}

export default function PlaygroundApp3(): JSX.Element {
  const [json, setJson] = useState<SerializedEditorState>({
    root: {
      children: [{type: 'paragraph', version: 1}],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  });
  return (
    <>
      <EditorComposer>
        <App json={json} setJson={setJson} userList={dummyMentionsData} />
      </EditorComposer>
      <div dangerouslySetInnerHTML={{__html: JSON.stringify(json)}} />
    </>
  );
}
