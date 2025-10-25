
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/mutli-select";
import { Icons } from "@/components/icons";

class ConditionTool {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = data || { text: '', options: [] };
        this.wrapper = null;
        this.root = null;
        this.readOnly = readOnly;
        let prevPagelocalstvalue = 0;
        console.log(this.api)
        try {
            prevPagelocalstvalue = JSON.parse(localStorage?.getItem("formflowformpagescount"))?.pages
        } catch (error) {
            console.log(error)
        }
        this.options = [{ name: "Go to page", values: prevPagelocalstvalue }, {
            name: "Hide blocks", values: []
        }]

    }



    static get isReadOnlySupported() {
        return true;
    }

    // async getAllblockData() {
    //     const count = await this.api.blocks.getBlocksCount();
    //     console.log(count)
    //     const blocks = [];
    //     for (let index = 0; index < count; index++) {
    //         const block = await this.api.blocks.getBlockByIndex(index).save();
    //         console.log(block)
    //         blocks.push(block);
    //     }
    //     console.log(blocks);
    // }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('select-tool');

        const FunctionalSelectComponent = () => {
            console.log(this.data)
            const [options, setOptions] = useState(this.data.options);
            const [label, setLabel] = useState(this.data.text);
            const [action, setAction] = useState(this.data.action);
            const [block, setBlocks] = useState([]);
            const getAllblockData = async () => {
                const count = await this.api.blocks.getBlocksCount();
                console.log(count)
                const blocks = [];
                for (let index = 0; index < count; index++) {
                    const block = await this.api.blocks.getBlockByIndex(index).save();
                    console.log(block)
                    blocks.push(block);
                }
                setBlocks(blocks)
                this.options = this.options.map((option) => {
                    if (option.name == "Hide blocks") {
                        option.values = blocks;
                        console.log(blocks)
                    }
                    return option
                })
                console.log(blocks)

                console.log(this.options.find((o) => o.name === "Hide blocks"))
            }
            // This effect ensures that the state updates when `this.data` changes
            useEffect(() => {
                setOptions(this.data.options);
                setLabel(this.data.text);
                setAction(this.data.action);
                console.log(this.data);
                getAllblockData()
            }, [this.data]);

            const getEditorData = async () => {
                // const editorData = await this.api.saver.save()
                // console.log(editorData)
            }

            useEffect(() => {
                const handleStorageChange = async (event) => {
                    if (event.key === "formflowformpagescount") {
                        this.options = [{ name: "Go to page", values: event.newValue }, { name: "Hide blocks", values: event.newValue }]
                        console.log(this.options)
                        this.render()
                    } else if (event.key === "formflowformeditorchanged") {
                        getEditorData();
                    }
                    getAllblockData()
                };

                getEditorData();

                window.addEventListener("storage", handleStorageChange);
            }, [])

            const removeOption = (optionToRemove) => {
                const newOptions = options.filter(option => option !== optionToRemove);
                setOptions(newOptions);
                this.data.options = newOptions;
            };

            return (
                <div className="relative my-10 w-fit">
                    <div className="flex flex-row items-center justify-between w-fit gap-2">
                        <p>When</p>
                        <Select
                            defaultValue={this.data?.option}
                            disabled>
                            <SelectTrigger className="w-[180px] inputdiv dark:bg-transparent bg-transparent">
                                <SelectValue placeholder={label} />
                            </SelectTrigger>
                            {options?.length > 0 && (
                                <SelectContent className="dark:bg-transparent bg-white">
                                    {options.map((option, index) => (
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
                        <p>Is</p>
                        <Input
                            defaultValue={this.data.value}
                            className="w-fit" onChange={(e) => {
                                e.preventDefault();
                                this.data.value = e.target.value
                            }} />
                    </div>
                    <div className="flex relative left-5 flex-row mt-3 items-center justify-between w-fit gap-2">
                        <p>Do</p>
                        <Select
                            defaultValue={this.data?.action}
                            onValueChange={(val) => {
                                setAction(val);
                                this.data.action = val;
                            }}>
                            <SelectTrigger className="w-[180px] inputdiv dark:bg-transparent bg-transparent">
                                <SelectValue placeholder={"select an action"} />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-transparent bg-white">
                                {this.options.map((option, index) => (
                                    <SelectItem key={index} value={option.name}>{option.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p>To</p>


                        {action == "Hide blocks" ?
                            <MultiSelect
                                options={this.options.find((o) => o.name === "Hide blocks")?.values?.map((option) => ({ label: `${option.data.text || option.data.label} (${option.tool})`, value: option.data.label }))}
                                onValueChange={(e) => {
                                    this.data.action_value = e;
                                }}
                                defaultValue={[]}
                                placeholder="Select options"
                                variant="inverted"
                                animation={2}
                                maxCount={3}
                            />
                            : <Select
                                defaultValue={this.data?.action_value}
                                onValueChange={(e) => {
                                    this.data.action_value = e;
                                }}
                            >
                                <SelectTrigger className="w-[180px] inputdiv dark:bg-transparent bg-transparent">
                                    <SelectValue placeholder={"select an action"} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-transparent bg-white">

                                    {Array.from({ length: this.options.find((o) => o.name === action)?.values })?.map((_, index) => (
                                        <SelectItem key={index} value={index}>Page {index + 1}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>}
                    </div>
                    <div
                        onClick={() => this._toggleTune('required')}
                        className="absolute cursor-pointer required-indicator inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2 flex items-center pr-3 text-2xl opacity-80 text-red-500"
                    >
                        {this.data.required ? "*" : ""}
                    </div>
                </div>
            );
        };

        if (!this.root) {
            this.root = createRoot(this.wrapper);
        }

        this.root.render(<FunctionalSelectComponent />);

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
            title: 'Condition block',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="5" width="10" height="4"></rect></svg>',
        };
    }
}

export default ConditionTool;
