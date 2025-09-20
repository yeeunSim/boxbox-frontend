'use client';

// 옵션의 형태를 정의 (값과 라벨)
interface Option<T extends string> {
    value: T;
    label: string;
}

// 제네릭(Generic)을 사용해 어떤 종류의 옵션 값이든 받을 수 있도록 함
interface DropdownProps<T extends string> {
    options: readonly Option<T>[];
    selected: T;
    onSelect: (value: T) => void;
    widthClass?: string;
}

const Dropdown = <T extends string>({ options, selected, onSelect, widthClass = 'w-30' }: DropdownProps<T>) => {
    return (
        <div className={`absolute right-0 mt-2 ${widthClass} bg-[#2A2833] rounded-[15px] p-2 z-30`}>
            {options.map((option, index) => (
                <button
                    key={option.value}
                    onClick={() => onSelect(option.value)}
                    className={`w-full h-[35px] rounded-[10px] flex items-center justify-center text-sm ${
                        index > 0 ? 'mt-1' : ''
                    } ${selected === option.value ? 'bg-[#02F5D033] text-[#02F5D0]' : 'text-[#6f707e]'}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default Dropdown;
