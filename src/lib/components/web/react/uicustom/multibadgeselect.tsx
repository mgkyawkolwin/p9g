import { useState, useEffect } from "react";

interface MultiBadgeSelectProps {
  items: string[];
  value?: string; // Format: "A801, A802, A803"
  onChange?: (value: string) => void; // Returns "A801, A802, A803"
}

const MultiBadgeSelect = ({ items, value = "", onChange }: MultiBadgeSelectProps) => {
  // Convert string value to array
  const stringToArray = (str: string): string[] => {
    if (!str) return [];
    return str.split(',').map(item => item.trim()).filter(Boolean);
  };

  // Convert array to string
  const arrayToString = (arr: string[]): string => {
    return arr.join(', ');
  };

  const [selectedItems, setSelectedItems] = useState<string[]>(stringToArray(value));
  const [isOpen, setIsOpen] = useState(false);

  // Update internal state only when external value changes (controlled component behavior)
  useEffect(() => {
    setSelectedItems(stringToArray(value));
  }, [value]);

  // Get available items (items not yet selected)
  const availableItems = items.filter(item => !selectedItems.includes(item));

  const addItem = (item: string) => {
    const newSelectedItems = [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    // Notify parent immediately when item is added
    if (onChange) {
      onChange(arrayToString(newSelectedItems));
    }
    setIsOpen(false);
  };

  const removeItem = (itemToRemove: string) => {
    const newSelectedItems = selectedItems.filter(item => item !== itemToRemove);
    setSelectedItems(newSelectedItems);
    // Notify parent immediately when item is removed
    if (onChange) {
      onChange(arrayToString(newSelectedItems));
    }
  };

  return (
    <div className="relative w-full">
      {/* Selected items as badges */}
      <div 
        className="border border-gray-300 rounded-md p-2 min-h-[40px] min-w-[400px] cursor-pointer bg-white flex flex-wrap gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedItems.length === 0 ? (
          <span className="text-gray-500">Select rooms...</span>
        ) : (
          selectedItems.map(item => (
            <span
              key={item}
              className="bg-blue-100 text-blue-800 text-[12pt] px-2 py-0 rounded-full flex items-center gap-1"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-bold"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && availableItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {availableItems.map(item => (
            <div
              key={item}
              className="px-3 py-2 hover:bg-gray-100 text-black text-[12pt] cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => addItem(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default MultiBadgeSelect;