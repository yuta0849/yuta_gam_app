import React from 'react';

interface SelectOptionProps {
  selectedOption: string;
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

function SelectOption({ selectedOption, handleChange }: SelectOptionProps) {
  return (
    <select value={selectedOption} onChange={handleChange}>
      <option value="Overlay">Overlay</option>
      <option value="Interstitial">Interstitial</option>
    </select>
  );
}

export default SelectOption;