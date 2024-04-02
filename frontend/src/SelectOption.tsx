import React, { ChangeEvent } from 'react';

type SelectOptionProps = {
  selectedOption: string;
  handleChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

const SelectOption = ({ selectedOption, handleChange }: SelectOptionProps) => {
  return (
    <select value={selectedOption} onChange={handleChange}>
      <option value="Overlay">Overlay</option>
      <option value="Interstitial">Interstitial</option>
    </select>
  );
}

export default SelectOption;