import React from 'react';
import styles from './MultiSelect.module.css';

const MultiSelect = ({ 
    label, 
    options, 
    value, 
    onChange, 
    placeholder = "Selecione..." 
}) => {
    const handleToggle = (optionValue) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const handleClear = () => {
        onChange([]);
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>
            <div className={styles.selectWrapper}>
                <select
                    multiple
                    value={value}
                    onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        onChange(selectedOptions);
                    }}
                    className={styles.select}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {value.length > 0 && (
                <button 
                    type="button"
                    onClick={handleClear}
                    className={styles.clearButton}
                >
                    Limpar ({value.length})
                </button>
            )}
        </div>
    );
};

export default MultiSelect;
