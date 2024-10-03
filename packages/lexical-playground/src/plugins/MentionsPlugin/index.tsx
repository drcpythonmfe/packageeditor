/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  QueryMatch,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import {TextNode} from 'lexical';
import {useCallback, useEffect, useMemo, useState} from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {$createMentionNode} from '../../nodes/MentionNode';

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const CapitalizedNameMentionsRegex = new RegExp(
  '(^|[^#])((?:' + DocumentMentionsRegex.NAME + '{' + 1 + ',})$)',
);

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ['@'].join('');

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]';

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')';

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    VALID_JOINS +
    '){0,' +
    LENGTH_LIMIT +
    '})' +
    ')$',
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$',
);

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5;

const mentionsCache = new Map();

const dummyMentionsData = [
  "Aagi Ajay",
  "Aakash Mehta",
  "Aatif Shekh",
  "Adil Kadiyawala",
  "Aditi Das",
  "Aditya Kaneriya",
  "Aditya Kumar Upadhyay",
  "Aditya Upadhyay",
  "Ajay Kori",
  "Ajit Thakor",
  "Akhil Lakhlani",
  "Akshar Vora",
  "Akshay Panchal",
  "Alok Kumar",
  "Alpesh Desai",
  "Amit Gosalia",
  "Amit Namdeo",
  "Anjan Aghera",
  "Ankit Gandhi",
  "Ankit Padiya",
  "Anoop Tamhaney",
  "Anshul Shukla",
  "Archana Patel",
  "Arjun Kurungot",
  "Arpan Patel",
  "Aslam Ansari",
  "Avani Thakkar",
  "Ayush Shah",
  "Bhakti Patel",
  "Bharat Panjwani",
  "Bhavik Panchal",
  "Bhavin Thumar",
  "Bhumit Patel",
  "Brijesh Makwana",
  "Brijesh Padsala",
  "Charmi Parikh",
  "Chetan Patel",
  "Chinmay Sahu",
  "Chintamani Bhosale",
  "Chintan Machhi",
  "Chintan Shah",
  "Chirag Bhoi",
  "Chirag Dhorajia",
  "Chirag Modi",
  "Darsh Modi",
  "Darshan Shah",
  "Deepshikha Makwana",
  "Devarshi Patel",
  "Dharm Solanki",
  "Dharmesh Patel",
  "Dharmik Maru",
  "Dharmik Patel",
  "Dhaval Patel",
  "Dhaval Travadi",
  "Dhiraj Jethwani",
  "Dhrumil Bhalala",
  "Dhrupad Patel",
  "Dhruv Kadia",
  "Dhruvin Patel",
  "Digesh Prajapati",
  "Dinesh Vasitha",
  "Dipak Chavda",
  "Dipak External",
  "Dipesh Shah",
  "Dipesh Shah",
  "Dipesh Shah(External)",
  "Divyesh Gol",
  "Dody Tank",
  "Drashti Mehta",
  "Durgesh Yadav",
  "Durgesh Yadav",
  "Farouk Susulan",
  "Fenil Panseriya",
  "Fulabhai Desai",
  "Gaurang Vyas",
  "Gauri Sabhadiya",
  "Ghanshyam Bhava",
  "Gopal Jaiswal",
  "Govind Rajput",
  "Gowtham Nagaraj",
  "Hardik Davariya",
  "Harikrushna Parmar",
  "Harsh Desai",
  "Harsh Patel",
  "Harshil Thakkar",
  "Harshvardhan Makwana",
  "Hemant Nandaniya",
  "Het Patel",
  "Hiten Barchha",
  "Hitesh Kava",
  "Hitesh Patel",
  "Honey Kawade",
  "Jahnavi Thakkar",
  "Jalpa Panchal",
  "Janmaya Pandya",
  "Jarna Prajapati",
  "Jay Jani",
  "Jay Kansara",
  "Jay Patel",
  "Jay Thakkar",
  "Jaydeep Ladva",
  "Jaydeep Modi",
  "Jaydevsinh Gohil",
  "Jaydip Patel",
  "Jayesh Chopda",
  "Jayesh Prajapati",
  "Jayram Nai",
  "Jigar Rami",
  "Jignesh Prajapati",
  "Jinal patel",
  "Jisha Patel",
  "Jitendra Yadav",
  "Jitendrasinh Bhadoriya",
  "Kadam",
  "Kalim Shaikh",
  "Kamalnayan Parmar",
  "Kamlesh Helaiya",
  "Kaushik Ambaliya",
  "Kaverimanian T",
  "Ketaki Brahmane",
  "Keyur Chokshi",
  "Khushi Kamat",
  "Khushi Kathrotia",
  "Kinshuk Sarabhai",
  "Kiran Chauhan",
  "Komal Prajapati",
  "Komal Raval",
  "Krupali Joshi",
  "Kruti Trivedi",
  "Kshama Parmar",
  "Kush Patel",
  "Kush Patel",
  "Kushal Shah",
  "Laksh Joshi",
  "Madhavesh Gohel",
  "Maitri Trivedi",
  "Malay Thakkar",
  "Manan Prajapati",
  "Manan Vadher",
  "Mansi Chavda",
  "Mansi Patel",
  "Manthan Bhanushali",
  "Margi Patel",
  "Maulik Lakhnotra",
  "Meet Boghani",
  "Meet Parikh",
  "Meet Patel",
  "Meet Rachhadiya",
  "Mehul Bukeliya",
  "Mehul Vishroliya",
  "Mihir Trivedi",
  "Milan Trivedi",
  "Miral Chauhan",
  "Mittal Shah",
  "N D Acharya",
  "N D Acharya",
  "Namrata Gosai",
  "Nandini Joshi",
  "Nayan Valmiya",
  "Neel Thakkar",
  "Nidhi Patel",
  "Nidhi Patel",
  "Nilay Patel",
  "Nilesh Dataniya",
  "Niraj Mamtora",
  "Nirali Maheshwari",
  "Nirali Patel",
  "Nirmal Bhavsar",
  "Nishant Goradiya",
  "Nishith Zaveri",
  "Niyati Raval",
  "Pankaj Bhatia",
  "Paras Pitroda",
  "Parth Kher",
  "Patel Vrushi",
  "Payal Patel",
  "Piyush Mehra",
  "Pooja Kolhe",
  "Pooja Patel",
  "Pooja Thakkar",
  "Poonam Shah",
  "Poonam Singh",
  "Poornima Meena",
  "Prakhar Gupta",
  "Prashant U",
  "Pratik Ahir",
  "Pratik Kelkar",
  "Pravin Ratanpara",
  "Princy Patel",
  "Priya Patel",
  "Priyam Gadhvi",
  "Priyesh Doshi",
  "Rahul Sharma",
  "Raj Cementwala",
  "Raj Chauhan",
  "Raj Patel",
  "Raj Shah",
  "Rajan Rajgor",
  "Rajendra Borisagar",
  "Rajesh Kumar",
  "Raju Makwana",
  "Ravi Sachaniya",
  "Ravishankar Patel",
  "Rohan Pansara",
  "Rohan Saraogi",
  "Ronak Pandya",
  "Rupal Manvar",
  "Rupal Patoliya",
  "Saharsh Modi",
  "Sakshi Shah",
  "Samir Parikh",
  "Sanjana Daki",
  "Sanjay Prajapati",
  "Sanket Patel",
  "Saurav Shailendra",
  "Savan Barbhaya",
  "Savan Pansuriya",
  "Sayma Masoom",
  "Setu Patel",
  "setu patel",
  "Sharda",
  "Shivani Joshi",
  "Shraddha Pathak",
  "Shrenik Shah",
  "Shubh Trivedi",
  "Siddharth Kundu",
  "Smit Patel",
  "Solomon Thirumurugan",
  "Sonia Shah",
  "Sourabh Gaonshindhe",
  "Sudhir Parmar",
  "Surabhi Kacha",
  "Surbhi Panchal",
  "Surojit Sarkar",
  "Swapna KS",
  "Tarak Kadiya",
  "Teja Satyanarayana",
  "Tinu Taral",
  "Ujjval Patdiya",
  "Umang Bhadja",
  "Umesh Tank",
  "Urvesh Joshi",
  "Utsav Kachchhi",
  "Uttam Sharma",
  "Vaibhavi Prajapati",
  "Vaishali maru",
  "Vaishnavi Dulala",
  "Varshil Patel",
  "Vatsal Shah",
  "Vignesh Kumar",
  "Vijay Prajapati",
  "Viral Patel",
  "Viram Shah",
  "Vishal Amipara",
  "Vishwa Kadivar",
  "Vishwas Bhimani",
  "Vrushi Patel",
  "Yash Bhide",
  "Yash Panchal",
  "Yash Thakar",
  "Yogesh Asanani",
  "Yogesh Panchani"
]

const dummyLookupService = {
  search(string: string, callback: (results: Array<string>) => void): void {
    setTimeout(() => {
      const results = dummyMentionsData.filter((mention) =>
        mention.toLowerCase().includes(string.toLowerCase()),
      );
      callback(results);
    }, 500);
  },
};

function useMentionLookupService(mentionString: string | null) {
  const [results, setResults] = useState<Array<string>>([]);

  useEffect(() => {
    const cachedResults = mentionsCache.get(mentionString);

    if (mentionString == null) {
      setResults([]);
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    mentionsCache.set(mentionString, null);
    dummyLookupService.search(mentionString, (newResults) => {
      mentionsCache.set(mentionString, newResults);
      setResults(newResults);
    });
  }, [mentionString]);

  return results;
}

function checkForCapitalizedNameMentions(
  text: string,
  minMatchLength: number,
): QueryMatch | null {
  const match = CapitalizedNameMentionsRegex.exec(text);
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[2];
    if (matchingString != null && matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: matchingString,
      };
    }
  }
  return null;
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number,
): QueryMatch | null {
  let match = AtSignMentionsRegex.exec(text);

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text);
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }
  return null;
}

function getPossibleQueryMatch(text: string): QueryMatch | null {
  const match = checkForAtSignMentions(text, 1);
  return match === null ? checkForCapitalizedNameMentions(text, 3) : match;
}

class MentionTypeaheadOption extends TypeaheadOption {
  name: string;
  picture: JSX.Element;

  constructor(name: string, picture: JSX.Element) {
    super(name);
    this.name = name;
    this.picture = picture;
  }
}

function MentionsTypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: MentionTypeaheadOption;
}) {
  let className = 'item';
  if (isSelected) {
    className += ' selected';
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}>
      {option.picture}
      <span className="text">{option.name}</span>
    </li>
  );
}

export default function NewMentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const results = useMentionLookupService(queryString);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map(
          (result) =>
            new MentionTypeaheadOption(result, <i className="icon user" />),
        )
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results],
  );

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(selectedOption.name);
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();
        closeMenu();
      });
    },
    [editor],
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const mentionMatch = getPossibleQueryMatch(text);
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      return !slashMatch && mentionMatch ? mentionMatch : null;
    },
    [checkForSlashTriggerMatch, editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        {selectedIndex, selectOptionAndCleanUp, setHighlightedIndex},
      ) =>
        anchorElementRef.current && results.length
          ? ReactDOM.createPortal(
              <div className="typeahead-popover mentions-menu">
                <ul>
                  {options.map((option, i: number) => (
                    <MentionsTypeaheadMenuItem
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i);
                      }}
                      key={option.key}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current,
            )
          : null
      }
    />
  );
}
