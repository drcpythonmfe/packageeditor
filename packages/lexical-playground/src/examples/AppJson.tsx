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
import PlaygroundApp1 from './AppHtml';


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

  let data  =`{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"background-color: #f8e71c;","text":"adsdasdasdasd","type":"text","version":1}],"direction":"ltr","format":"right","type":"paragraph","version":1},{"children":[{"detail":0,"format":1,"mode":"normal","style":"background-color: #f8e71c;","text":"sd","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":1,"mode":"normal","style":"background-color: #f8e71c;","text":"fs","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":1,"mode":"normal","style":"background-color: #f8e71c;","text":"adsfdsfsdfsdfsd","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"format":"","type":"office","version":1,"url":"https://media.stage.truflux.drcsystems.ooo/uploads/project/294/Designs for SectorConnect Requriements _1__6.pptx"},{"children":[{"detail":0,"format":1,"mode":"normal","style":"background-color: #f8e71c;","text":"df","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`
  const [json, setJson] = useState<SerializedEditorState>(JSON.parse(JSON.stringify(data)));

  return (
    <>
      <EditorComposer>
        <App json={json} setJson={setJson} userList={dummyMentionsData} />
      </EditorComposer>
      <div dangerouslySetInnerHTML={{__html: JSON.stringify(json)}} />

      <PlaygroundApp1 />
    </>
  );
}
