import EmojiPicker from 'emoji-picker-react';
import { SmilePlus, X } from 'lucide-react';
import { useState } from 'react';

export default function EmojiPickerPopup({ icon, onSelected }) {
    const [isOpen, setIsOpen] = useState(false);

    function handleEmojiPicker(emoji) {
        onSelected(emoji?.imageUrl);
        setIsOpen(false);
    }

    return (
        <div className="flex flex-col md:flew-row items-start gap-5 mb-6">
            <div
                onClick={() => setIsOpen(true)}
                className='flex items-center gap-3 cursor-pointer group'
            >
                <div
                    className="
                        glass-subtle
                        w-11 h-11 rounded-xl
                        flex items-center justify-center
                        transition-all duration-200
                        group-hover:bg-brand-teal/10
                        group-hover:border-brand-teal/30
                        group-hover:shadow-md
                    "
                >
                    {icon ? (
                        <img 
                            src={icon} 
                            alt="selected-icon" 
                            className="w-9 h-9 object-contain"
                        />
                    ) : (
                        <SmilePlus
                            size={22}
                            className="
                                text-(--text-secondary)
                                transition-colors duration-200
                                group-hover:text-brand-teal
                            "
                        />
                    )}
                </div>

                <p
                    className="
                        text-sm font-[Basic] text-(--text-secondary)
                        transition-colors duration-200
                        group-hover:text-income
                    "
                >
                    {icon ? 'Change icon' : 'Pick icon'}
                </p>
            </div>

            {isOpen && (
                <div className='relative z-50'>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close emoji picker"
                        className="absolute -top-2 -right-2 z-50 close-btn"
                    >
                        <X size={16} />
                    </button>

                    <div
                        className="
                            glass
                            rounded-2xl
                            overflow-hidden
                        "
                    >
                        <EmojiPicker
                            open={isOpen}
                            onEmojiClick={handleEmojiPicker}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}