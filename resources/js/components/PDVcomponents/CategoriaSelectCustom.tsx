import Select from 'react-select';

export interface CategoriaOption {
    value: string;
    label: string;
}

interface CategoriaSelectCustomProps {
    categorias: CategoriaOption[];
    value: CategoriaOption | null;
    onChange: (option: CategoriaOption | null) => void;
    isDisabled?: boolean;
    placeholder?: string;
}

const customStyles = {
    control: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: 'var(--bs-secondary-bg)',
        color: 'var(--bs-body-color)',
        borderColor: state.isFocused ? 'var(--bs-primary)' : 'var(--bs-border-color)',
        boxShadow: state.isFocused ? '0 0 0 0.2rem var(--bs-primary-bg-subtle)' : 'none',
        minHeight: '38px',
        borderRadius: '0.375rem',
        fontSize: '1rem',
        paddingLeft: '0.75rem',
        paddingRight: '0.75rem',
        paddingTop: '0.375rem',
        paddingBottom: '0.375rem',
        fontFamily: 'inherit',
        transition: 'border-color .15s ease-in-out,box-shadow .15s ease-in-out',
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: 'var(--bs-secondary-bg)',
        color: 'var(--bs-body-color)',
        zIndex: 9999,
        borderRadius: '0.375rem',
        fontSize: '1rem',
        fontFamily: 'inherit',
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isFocused ? 'var(--bs-primary-bg-subtle)' : 'var(--bs-secondary-bg)',
        color: 'var(--bs-body-color)',
        cursor: 'pointer',
        fontSize: '1rem',
        fontFamily: 'inherit',
        padding: '0.375rem 0.75rem',
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: 'var(--bs-body-color)',
        fontSize: '1rem',
        fontFamily: 'inherit',
    }),
};

export default function CategoriaSelectCustom({ categorias, value, onChange, isDisabled, placeholder }: CategoriaSelectCustomProps) {
    return (
        <Select
            options={categorias}
            value={value}
            onChange={onChange}
            isDisabled={isDisabled}
            placeholder={placeholder || 'Selecione ou busque uma categoria'}
            isClearable
            isSearchable
            styles={customStyles}
            theme={(theme: any) => ({
                ...theme,
                borderRadius: 6,
                colors: {
                    ...theme.colors,
                    primary: 'var(--bs-primary)',
                    neutral0: 'var(--bs-body-bg)',
                    neutral80: 'var(--bs-body-color)',
                },
            })}
            noOptionsMessage={() => 'Nenhuma categoria encontrada'}
        />
    );
}
