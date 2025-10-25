import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createRoot } from "react-dom/client";

class TextInputTool {
  constructor({ data, api, readOnly }) {
    this.api = api;
    this.data = {
      ...data,
      label: data?.label ? data?.label : 'Your Answer',
      placeholder: data?.placeholder ? data?.placeholder : '',
      type: "text"
    };
    this.wrapper = null;
    this.readOnly = readOnly;
    if (this.data.minLength == null) {
      this.data.minLength = false;
    }
    if (this.data.maxLength == null) {
      this.data.maxLength = false;
    }
  }

  handleAutoGrow = (event) => {
    event.target.style.height = 'auto'; // Reset height to auto
    event.target.style.height = event.target.scrollHeight + 'px'; // Set height to scroll height
  };

  render() {
    this.wrapper = document.createElement('div');

    let toolView = (
      <form autoComplete="off" className="relative leading-7 focus:bg-red-600 text-md sm:truncate">
        <div className="flex w-full inputdiv md:w-1/2 border dark:border-white/30 px-2 py-2 rounded-md flex-row items-center justify-start gap-2">
          <input
            required={this.data.required}
            type="text"
            defaultValue={this.data.placeholder}
            className="flex-1 inputDivsinputs focus:outline-none dark:bg-transparent dark:text-gray-500 bg-transparent"
            placeholder="Enter placeholder text"
            onChange={(e) => {
              this.data.placeholder = e.target.value;
            }}
          />
        </div>
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
  renderSettings = () => {
    // Create a new wrapper for the settings
    this.wrapper = document.createElement("div");
    // Function to create a new div and append it to the wrapper
    const appendToWrapper = (element) => {
      const container = document.createElement("div");
      this.wrapper.appendChild(container);
      const root = createRoot(container);
      root.render(element);
    };

    // Required button
    const requiredButton = (
      <div className="w-full flex flex-row items-center bg-transparent text-black justify-between cdx-settings-button">
        <div className="ce-popover-item__title">Required</div>
        <Switch
          onCheckedChange={(e) => {
            this.data.required = e;
            this.wrapper.querySelector(".required-indicator").textContent = e ? "*" : "";
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

    // Duplicate button
    const duplicateButton = (
      <div
        className="w-full flex flex-row items-center bg-transparent text-black justify-between cdx-settings-button"
        onClick={() => this._duplicateBlock()}
      >
        <div className="ce-popover-item__title">Duplicate</div>
      </div>
    );

    // Min length settings
    const MinLength = (
      <div className="">
        <div className="w-full flex flex-row items-center bg-transparent text-black justify-between cdx-settings-button">
          <div className="ce-popover-item__title">Min length</div>
          <Switch
            onCheckedChange={(e) => {
              this.data.minLength = e;
              this.wrapper.querySelector(".minlengthinput")?.classList?.toggle("hidden");
            }}
            defaultChecked={this.data.minLength}
          />
        </div>
        <div className="minlengthinput hidden mt-1">
          <Input
            defaultValue={this.data.minLengthValue}
            onChange={(e) => {
              this.data.minLengthValue = e?.target?.value;
            }}
            type="number"
          />
        </div>
      </div>
    );

    // Max length settings
    const MaxLength = (
      <div className="">
        <div className="w-full flex flex-row items-center bg-transparent text-black justify-between cdx-settings-button">
          <div className="ce-popover-item__title">Max length</div>
          <Switch
            onCheckedChange={(e) => {
              this.data.maxLength = e;
              this.wrapper.querySelector(".maxlengthinput")?.classList?.toggle("hidden");
            }}
            defaultChecked={this.data.maxLength}
          />
        </div>
        <div className="maxlengthinput hidden mt-1">
          <Input
            defaultValue={this.data.maxLengthValue}
            onChange={(e) => {
              this.data.maxLengthValue = e?.target?.value;
            }}
            type="number"
          />
        </div>
      </div>
    );

    // Append each element to the wrapper
    appendToWrapper(requiredButton);
    appendToWrapper(duplicateButton);
    appendToWrapper(conditionButton);
    appendToWrapper(MinLength);
    appendToWrapper(MaxLength);

    return this.wrapper;
  };


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
      index+1,
      true,
      false,
      qId
    );
    // this.api.blocks.insert(currentBlock?.name, { ...this.data }, currentBlock?.config, index, true);
  }

  static get isReadOnlySupported() {
    return true;
  }

  static get toolbox() {
    return {
      title: 'Text Input',
      icon: '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2h10v10H2z"></path></svg>',
    };
  }
}

export default TextInputTool;
