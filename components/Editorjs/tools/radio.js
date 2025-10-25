import MultipleChoiceQuestionComponent from "@/components/MultipleChoiceQuestionComponent";
import { Switch } from "@/components/ui/switch";
import { createRoot } from "react-dom/client";

class RadioTool {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = {
            label: data.label || "",
            help: data.help || "",
            options: data.options || [],
            required: data.required || false,
            multipleChoice: data.multipleChoice || false,
        };
        this.wrapper = null;
        this.readOnly = readOnly;
    }

    static get isReadOnlySupported() {
        return true;
    }

    /**
 * Allow pressing Enter inside the CodeTool textarea
 *
 * @returns {boolean}
 * @public
 */
    static get enableLineBreaks() {
        return true;
    }
    render() {
        this.wrapper = document.createElement('div');
        const onDataChange = (newData) => {
            console.log(newData)
            this.data = {
                ...newData,
            };
        };

        let select = (
            <div className="relative">
                <MultipleChoiceQuestionComponent
                    onDataChange={onDataChange}
                    readOnly={this.readOnly}
                    data={this.data}
                />
                <div
                    onClick={() => this._toggleTune('required')}
                    className="absolute cursor-pointer required-indicator  top-0 right-0 flex items-center pr-3 text-2xl opacity-80 text-red-500"
                >
                    {this.data.required ? "*" : ""}
                </div>
            </div>
        )
        const root = createRoot(this.wrapper)
        root.render(select)
        return this.wrapper;
    }

    _toggleTune(tune) {
        if (tune === "required") {
            this.data.required = !this.data.required;
            this.wrapper.querySelector('.required-indicator').textContent = this.data.required ? "*" : "";
        }
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

        const root = createRoot(wrapper);
        root.render(requiredButton);

        return wrapper;
    }

    save() {
        return this.data;
    }

    static get toolbox() {
        return {
            title: 'Multiple choice',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5"></circle></svg>',
        };
    }
}

export default RadioTool;
