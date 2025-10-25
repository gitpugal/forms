import { createRoot } from "react-dom/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea"


class SelectTool {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = data || { label: '', options: [] };
        this.wrapper = null;
        this.root = null; // Store the root
        this.readOnly = readOnly;
        this.defaultOptions = ""
        this.data.options?.forEach((option) => {
            this.defaultOptions += (option + "\n")
        })
        this.data.defaultOptions = this.defaultOptions;
    }

    static get isReadOnlySupported() {
        return true;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('select-tool');

        const updateLabel = (e) => {
            this.data.label = e.target.value;
            autoResizeTextarea(e.target);
        };

        const autoResizeTextarea = (element) => {
            element.style.height = 'auto';
            element.style.height = (element.scrollHeight) + 'px';
        };

        const addOption = () => {
            const newOption = this?.wrapper?.childNodes[0]?.childNodes[1]?.childNodes[0]?.value.trim();
            if (newOption) {
                if (!this.data.options) {
                    this.data.options = [];
                }
                if (!this.data.options.includes(newOption)) {
                    this.data.options.push(newOption);
                    this.wrapper.childNodes[0].childNodes[1].childNodes[0].value = '';
                    this.renderSelectComponent();  // Re-render the entire Select component
                }
            }
        };

        const removeOption = (optionToRemove) => {
            this.data.options = this.data.options.filter(option => option !== optionToRemove);
            this.renderSelectComponent();  // Re-render the entire Select component
        };

        const handleOptionInputKeyPress = (e) => {
            if (e.key === 'Enter') {
                addOption();
            }
        };

        this.renderSelectComponent = () => {
            const selectComponent = (
                <div className="flex flex-col  items-start justify-start gap-2">


                    <Select >
                        <SelectTrigger className="w-[180px] inputdiv dark:bg-transparent  bg-transparent">
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        {this.data?.options?.length > 0 && (
                            <SelectContent className="dark:bg-transparent  bg-white">
                                {this.data.options.map((option, index) => (
                                    <div key={index} className="flex items-center">
                                        <SelectItem value={option}>{option}</SelectItem>
                                        <button
                                            onClick={() => removeOption(option)}
                                            className="ml-1 text-red-500"
                                        >
                                            <TrashIcon size={15} />
                                        </button>
                                    </div>
                                ))}
                            </SelectContent>
                        )}
                    </Select>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            id={`optionInput`}
                            className="p-1 border border-gray-300 bg-transparent rounded"
                            placeholder="Add option"
                            onKeyPress={handleOptionInputKeyPress}

                        />
                        <button
                            onClick={addOption}
                            className="p-1 dark:bg-transparent bg-transparent px-4 text-black rounded"
                        >
                            Add
                        </button>
                    </div>
                    <div
                        onClick={() => this._toggleTune('required')}
                        className="absolute cursor-pointer required-indicator  inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2 flex items-center pr-3 text-2xl opacity-80 text-red-500"
                    >
                        {this.data.required ? "*" : ""}
                    </div>
                </div>
            );

            this.root.render(selectComponent);
        };

        if (!this.root) {
            this.root = createRoot(this.wrapper);
        }

        this.renderSelectComponent();

        return this.wrapper;
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
        const BulkInsertButton = (

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">Bulk insert</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Bulk insert</DialogTitle>
                    </DialogHeader>
                    <div className="">
                        <Label htmlFor="name" >
                            Enter each option in a new line.
                        </Label>
                        <Textarea
                            defaultValue={this.data.defaultOptions || ""}
                            onChange={(e) => {
                                this.data.bulkoption = e.target.value
                            }} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button id="shadncnselectclosebutton" type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                        <Button type="button"
                            onClick={() => {
                                this.data.options = this.data.bulkoption?.split("\n");
                                this.renderSelectComponent();
                                this.defaultOptions = "";
                                this.data.options?.forEach((option) => {
                                    this.defaultOptions += (option + "\n")
                                })
                                this.data.defaultOptions = this.defaultOptions;
                                const closeButton = document?.getElementById("shadncnselectclosebutton");
                                if (closeButton) {
                                    closeButton?.click()
                                }
                                console.log(this.data)
                            }}
                        >Insert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        const root = createRoot(wrapper);
        root.render(
            <div>
                {requiredButton}
                {conditionButton}
                {duplicateButton}
                {BulkInsertButton}
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
    save() {
        return this.data;
    }

    static get toolbox() {
        return {
            title: 'Dropdown',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="5" width="10" height="4"></rect></svg>',
        };
    }
}

export default SelectTool;
