import { Switch } from "@/components/ui/switch";
import { createRoot } from "react-dom/client";

class CheckBoxTool {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = { ...data, label: data?.label ? data?.label : 'Check box title' };
        this.wrapper = null;
        this.readOnly = readOnly;
    }

    handleAutoGrow = (event) => {
        event.target.style.height = 'auto'; // Reset height to auto
        event.target.style.height = event.target.scrollHeight + 'px'; // Set height to scroll height
    };

    render() {
        this.wrapper = document.createElement('div');

        let toolView = (
            <form autoComplete="off" className="relative w-full leading-7 text-md sm:truncate">
                <div className="flex items-center w-full">
                    <input
                        id="checkbox"
                        type="checkbox"
                        checked={this.data.checked}
                        onChange={(e) => {
                            this.data.checked = e.target.checked;
                        }}
                        className="mr-2"
                    />
                    <textarea
                        defaultValue={this.data.label}
                        onChange={(e) => {
                            this.data.label = e.target.value;
                            this.handleAutoGrow(e);
                        }}
                        onInput={this.handleAutoGrow}
                        className="block p-0 focus:outline-none w-full dark:bg-transparent dark:text-gray-300 bg-transparent resize-none overflow-hidden"
                        placeholder="Enter Title"
                        rows={1}
                    />
                    <div
                        onClick={() => this._toggleTune()}
                        className="absolute cursor-pointer inset-y-0 right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 text-2xl opacity-80 text-red-500"
                    >
                    </div>
                </div>
            </form>
        );

        const root = createRoot(this.wrapper);
        root.render(toolView);
        return this.wrapper;
    }

    save() {
        return { ...this.data };
    }

    renderSettings() {
        const wrapper = document.createElement("div");

        const requiredButton = (
            <div className="w-full flex flex-row items-center bg-transparent justify-between cdx-settings-button">
                <div className="ce-popover-item__title text-black">
                    Required
                </div>
                <Switch
                    onCheckedChange={(e) => {
                        this._toggleTune();
                    }}
                    defaultChecked={this.data.required}
                />
            </div>
        );

        const root = createRoot(wrapper);
        root.render(requiredButton);

        return wrapper;
    }

    _toggleTune() {
        this.data.required = !this.data.required;

        const labelElement = this.wrapper.querySelector('textarea');
        if (labelElement) {
            labelElement.style.height = 'auto';
            labelElement.style.height = labelElement.scrollHeight + 'px';
        }
    }

    static get isReadOnlySupported() {
        return true;
    }

    static get toolbox() {
        return {
            title: 'Checkbox Input',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2h10v10H2z"></path></svg>',
        };
    }
}

export default CheckBoxTool;
