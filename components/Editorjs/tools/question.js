import { createRoot } from "react-dom/client";

class QuestionTool {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = data;
        this.wrapper = null;
        this.readOnly = readOnly;
    }


    static get isReadOnlySupported() {
        return true;
    }
    render() {
        this.wrapper = document.createElement('div');

        let button = (
            <input
                className="font-normal text-base border-none focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                defaultValue={this.data?.text}
                placeholder="Enter the question?"
                onChange={(e) => {
                    this.data.text = e?.target?.value
                }}
                type="text"
            />
        )
        const root = createRoot(this.wrapper);
        root.render(button)
        return this.wrapper;
    }

    save() {
        return {
            text: this.data.text,
        };
    }

    static get toolbox() {
        return {
            title: 'Question',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="5" width="10" height="4"></rect></svg>',
        };
    }
}

export default QuestionTool;
