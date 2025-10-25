import { Switch } from "@/components/ui/switch";
import { PhoneCallIcon } from "lucide-react";
import { createRoot } from "react-dom/client";
import { PhoneInput } from "@/components/ui/phone-input"

class PhoneeInput {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = { ...data, label: data?.label ? data?.label : 'Phone', placeholder: data?.placeholder ? data?.placeholder : '', type: "tel" };
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
            <form autoComplete="off" className="relative leading-7 text-md sm:truncate">
                {/* <textarea
                    id="label"
                    defaultValue={this.data.label}
                    onChange={(e) => {
                        this.data.label = e.target.value;
                        this.handleAutoGrow(e);
                    }}
                    onInput={this.handleAutoGrow}
                    className="w-full md:w-1/2 block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent resize-none overflow-hidden"
                    placeholder="Enter Title"
                    rows={1}
                /> */}
                {/* <input
                        required={this.data.required}
                        type="text"
                        defaultValue={this.data.placeholder}
                        className="flex-1 inputDivsinputs focus:outline-none dark:bg-transparent dark:text-gray-500 bg-transparent"
                        placeholder="Enter placeholder text"
                        onChange={(e) => {
                            this.data.placeholder = e.target.value;
                        }}
                    /> */}
                <PhoneInput className="w-full md:w-1/2" defaultCountry={this?.data?.defaultCountryCode} onCountryChange={(e) => {
                    this.data.defaultCountryCode = e
                }} />

                <div
                    onClick={() => this._toggleTune('required')}
                    className="absolute cursor-pointer required-indicator  inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2 flex items-center pr-3 text-2xl opacity-80 text-red-500"
                >
                    {this.data.required ? "*" : ""}
                </div>
            </form>
        );

        const root = createRoot(this.wrapper);
        root.render(toolView);
        return this.wrapper;
    }

    save() {
        return { ...this.data, required: this.data?.required ? this.data?.required : false };
    }

    _conditionalBlock() {
        const index = this.api.blocks.getCurrentBlockIndex();
        let qId =
            "condition" +
            Math.round(Math.random() * 1000);
        this.api.blocks.insert(
            "condition",
            {},
            {},
            index + 1,
            true,
            false,
            qId
        );
        // this.api.blocks.insert(currentBlock?.name, { ...this.data }, currentBlock?.config, index, true);
    }
    renderSettings() {
        const wrapper = document.createElement("div");

        // Condition button
        const conditionButton = (
            <div
                className="w-full flex flex-row items-center bg-transparent text-black justify-between cdx-settings-button"
                onClick={() => this._conditionalBlock()}
            >
                <div className="ce-popover-item__title">Add conditional logic</div>
            </div>
        );

        const requiredButton = (
            <div className="w-full flex flex-row items-center justify-between cdx-settings-button cdx-settings-button">
                <div className="ce-popover-item__title text-black">
                    Required
                </div>
                <Switch
                    onCheckedChange={(e) => {
                        this._toggleTune("required");
                    }}
                    defaultChecked={this.data.required}
                />
            </div>
        );

        const buttons = <div>
            {conditionButton}
            {
                requiredButton
            }
        </div>
        const root = createRoot(wrapper);
        root.render(buttons);

        return wrapper;
    }

    _toggleTune(tune) {
        if (tune === "required") {
            this.data.required = !this.data.required;
            this.wrapper.querySelector('.required-indicator').textContent = this.data.required ? "*" : "";
        }
    }

    static get isReadOnlySupported() {
        return true;
    }

    static get toolbox() {
        return {
            title: 'Phone',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2h10v10H2z"></path></svg>',
        };
    }
}

export default PhoneeInput;
