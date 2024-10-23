/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './Input.css';

import * as React from 'react';

type Props = Readonly<{
  'data-test-id'?: string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
  type?: string;
}>;

export default function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  'data-test-id': dataTestId,
}: Props): JSX.Element {
  return (
    <>
      {type == 'number' ? (
        <div className="Input__wrapper">
          <label className="Input__label">{label}</label>
          <input
            type="number"
            max="5"
            min="1"
            className="Input__input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            data-test-id={dataTestId}
          />
        </div>
      ) : (
        <div className="Input__wrapper">
          <label className="Input__label">{label}</label>
          <input
            type={type}
            className="Input__input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            data-test-id={dataTestId}
          />
        </div>
      )}
    </>
  );
}
