import { Switch } from "@/components/ui/switch";
import { createRoot } from "react-dom/client";

class LongAnswerInput {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = { ...data, label: data?.label ? data?.label : 'Your Answer', placeholder: data?.placeholder ? data?.placeholder : '', type: "textarea" };
        this.wrapper = null;
        this.readOnly = readOnly;
    }

    render() {
        this.wrapper = document.createElement('div');
        const updateLabel = (e) => {
            this.data.label = e.target.value;
            autoResizeTextarea(e.target);
        };

        const autoResizeTextarea = (element) => {
            element.style.height = "auto";
            element.style.height = element.scrollHeight + "px";
        };
        let toolView = (
            <form autoComplete="off" className="relative leading-7 text-md sm:truncate">
                {/* <textarea
                    id="label"
                    defaultValue={this.data.label || "Select Title"}
                    onChange={(e) => {
                        this.data.label = e.target.value;
                        updateLabel(e);
                    }}
                    className="w-full block p-0 border-0 border-transparent ring-0 focus:ring-0  dark:bg-transparent dark:text-gray-500 bg-transparent resize-none overflow-hidden"
                    placeholder="Enter Title"
                    rows={1}
                /> */}
                <div className="flex w-full inputdiv border dark:border-white/30 px-2 py-2 rounded-md flex-row items-center justify-start gap-2">
                    <textarea
                        required={this.data.required}
                        type="text"
                        defaultValue={this.data.placeholder}
                        className="flex-1 inputDivsinputs h-fit focus:outline-none dark:bg-transparent dark:text-gray-500 bg-transparent"
                        placeholder="Enter placeholder text"
                        rows={4}
                        onChange={(e) => {
                            this.data.placeholder = e.target.value;
                        }}
                    />
                </div>
                <div
                    onClick={() => this._toggleTune('required')}
                    className="absolute cursor-pointer required-indicator right-0 md:top-0 top-9  flex items-center pr-3 text-2xl opacity-80 text-red-500"
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
        const wrapper = document.createElement("div")

        const requiredButton = (
            <div className="w-full flex flex-row items-center justify-between cdx-settings-button cdx-settings-button">
                <div className="ce-popover-item__title text-black ">
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


        // Condition button
        const conditionButton = (
            <div
                className="w-full flex flex-row items-center bg-transparent text-black justify-between cdx-settings-button"
                onClick={() => this._conditionalBlock()}
            >
                <div className="ce-popover-item__title">Add conditional logic</div>
            </div>
        );

        const buttons = (
            <div>
                {conditionButton}
                {requiredButton}
            </div>
        )


        const root = createRoot(wrapper);
        root.render(buttons);

        return wrapper;
    }

    _toggleTune(tune) {

        if (tune === "required") {
            this.data.required = !this.data.required;
            this.wrapper.childNodes[0].childNodes[2].textContent = this.data.required ? "*" : "";
        }
    }

    static get isReadOnlySupported() {
        return true;
    }

    static get toolbox() {
        return {
            title: 'Long Answer',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2h10v10H2z"></path></svg>',
        };
    }
}

export default LongAnswerInput;
