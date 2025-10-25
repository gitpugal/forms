import { createRoot } from "react-dom/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";

class CalendarTool {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = data;
        this.wrapper = null;
        this.readOnly = readOnly;
    }

    static get isReadOnlySupported() {
        return true;
    }

    autoResizeTextarea = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    render() {
        this.wrapper = document.createElement('div');

        let button = (
            <div className="flex flex-col my-10 items-start justify-start gap-2">
                <textarea
                    id="label"
                    defaultValue={this.data.label || 'Calendar Title'}
                    onChange={(e) => {
                        this.data.label = e.target.value;
                        this.autoResizeTextarea(e.target);
                    }}
                    onInput={(e) => this.autoResizeTextarea(e.target)}
                    className="w-full p-0 border-0 border-transparent ring-0 focus:ring-0 bg-transparent dark:text-white resize-none overflow-hidden"
                    placeholder="Calendar Title"
                    rows={1}
                />
                <DatePicker
                    onChange={() => { }}
                    name={"Calendar"}
                    disabled={true}
                    value={""}
                // className="rounded-md border text-black md:w-1/2 w-3/4 dark:bg-transparent bg-transparent dark:text-gray-300 dark:border-white/30"
                />
                <div
                    onClick={() => this._toggleTune('required')}
                    className="absolute cursor-pointer required-indicator  inset-y-0 right-0 md:right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2 flex items-center pr-3 text-2xl opacity-80 text-red-500"
                >
                    {this.data.required ? "*" : ""}
                </div>
            </div>
        );

        const root = createRoot(this.wrapper);
        root.render(button);
        return this.wrapper;
    }


    renderSettings() {
        const wrapper = document.createElement("div");

        const requiredButton = (
            <div className="w-full flex flex-row items-center bg-transparent text-black justify-between cdx-settings-button">
                <div className="ce-popover-item__title">
                    Required
                </div>
                <Switch
                    onCheckedChange={(e) => {
                        this.data.required = e;
                        this.wrapper.querySelector('.required-indicator').textContent = e ? "*" : "";
                    }}
                    defaultChecked={this.data.required}
                />
            </div>
        );

        const duplicateButton = (
            <div
                className="w-full flex flex-row items-center bg-transparent text-black justify-between cdx-settings-button"
                onClick={() => this._duplicateBlock()}
            >
                <div className="ce-popover-item__title">
                    Duplicate
                </div>
            </div>
        );

        const root = createRoot(wrapper);
        root.render(
            <div>
                {requiredButton}
                {duplicateButton}
            </div>
        );

        return wrapper;
    }

    _toggleTune(tune) {
        if (tune === "required") {
            this.data.required = !this.data.required;
            this.wrapper.querySelector('.required-indicator').textContent = this.data.required ? "*" : "";
        }
    }

    _duplicateBlock() {
        const index = this.api.blocks.getBlocksCount() + 1;
        const currentBlock = this.api.blocks.getBlockByIndex(this.api.blocks.getCurrentBlockIndex());
        this.api.blocks.insert(currentBlock?.name, { ...this.data }, currentBlock?.config, index, true);
    }


    save() {
        return this.data;
    }

    static get toolbox() {
        return {
            title: 'Calendar',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="5" width="10" height="4"></rect></svg>',
        };
    }
}

export default CalendarTool;
