import { createRoot } from "react-dom/client";
import { useState } from "react";
import ColorPicker from 'react-best-gradient-color-picker'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
class BannerTool {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = { ...data, title: 'Banner Title', backColor: '#FFFFFF', textColor: '#000000' };
        this.wrapper = null;
        this.readOnly = readOnly;
    }

    static get isReadOnlySupported() {
        return true;
    }

    render() {
        this.wrapper = document.createElement('div');
        const BannerComponent = () => {
            const [data, setData] = useState({
                backColor: this.data.backColor,
                textColor: this.data.textColor,
                title: this.data.title,
            });

            const handleBackColorChange = (newColor) => {
                setData((prev) => ({ ...prev, backColor: newColor }));
                this.data.backColor = newColor;
            };

            const handleTextColorChange = (e) => {
                const newColor = e.target.value;
                setData((prev) => ({ ...prev, textColor: newColor }));
                this.data.textColor = newColor;
            };

            const handleTitleChange = (e) => {
                const newTitle = e.target.innerText;
                setData((prev) => ({ ...prev, title: newTitle }));
                this.data.title = newTitle;
            };

            const getContrastColor = (hexColor) => {
                const r = parseInt(hexColor.slice(1, 3), 16);
                const g = parseInt(hexColor.slice(3, 5), 16);
                const b = parseInt(hexColor.slice(5, 7), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                return brightness > 128 ? '#000000' : '#FFFFFF';
            };

            const borderColor = getContrastColor(data.backColor);

            return (
                <div
                    className="flex relative border-y flex-col my-10 w-full min-h-[254px] items-center justify-center gap-2 p-4 rounded"
                    style={{
                        backgroundImage: data.backColor.includes('gradient') ? data.backColor : 'none',
                        backgroundColor: data.backColor.includes('gradient') ? 'transparent' : data.backColor,
                    }}
                >
                    <div
                        contentEditable
                        suppressContentEditableWarning={true}
                        onInput={handleTitleChange}
                        className="text-2xl md:text-6xl font-extrabold"
                        style={{ color: data.textColor }}
                    >
                        {data.title}
                    </div>

                    <div className="absolute right-5 bottom-5 flex gap-2">

                        <Popover>
                            <PopoverTrigger>
                                <div className="rounded-full h-12 w-12 overflow-hidden border-4 shadow-lg" style={{ borderColor, backgroundColor: data.backColor }}>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="min-w-[294px]">
                                <ColorPicker value={data.backColor}
                                    width={275}
                                    onChange={handleBackColorChange}
                                    className={"custom-colorpicker"}
                                />
                            </PopoverContent>
                        </Popover>

                        <div className="rounded-full h-12 w-12 overflow-hidden border-4 shadow-lg" style={{ borderColor }}>
                            <input
                                type="color"
                                id="textColor"
                                value={data.textColor}
                                onChange={handleTextColorChange}
                                className="rounded-md border w-full h-full scale-150 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            );
        };

        const root = createRoot(this.wrapper);
        root.render(<BannerComponent />);
        return this.wrapper;
    }

    save() {
        return this.data;
    }

    static get toolbox() {
        return {
            title: 'Title Banner',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="5" width="10" height="4"></rect></svg>',
        };
    }
}

export default BannerTool;
