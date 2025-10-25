import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";
import { createRoot } from "react-dom/client";

class StarratingTool {
  constructor({ data, api, readOnly }) {
    this.api = api;
    this.data = {
      ...data,
      label: data?.label ? data?.label : "Check box title",
    };
    this.wrapper = null;
    this.readOnly = readOnly;
  }

  render() {
    this.wrapper = document.createElement("div");
    const updateLabel = (e) => {
      this.data.label = e.target.value;
      autoResizeTextarea(e.target);
    };

    const autoResizeTextarea = (element) => {
      element.style.height = "auto";
      element.style.height = element.scrollHeight + "px";
    };
    let toolView = (
      <form
        autoComplete="off"
        className="relative w-full leading-7 text-md sm:truncate"
      >
        <textarea
          id="label"
          defaultValue={this.data.label || "Select Title"}
          onChange={(e) => {
            this.data.label = e.target.value;
            updateLabel(e);
          }}
          className="w-full block p-0 border-0 border-transparent ring-0 focus:ring-0  dark:bg-transparent dark:text-gray-500 bg-transparent resize-none overflow-hidden"
          placeholder="Select Title"
          rows={1}
        />
        <div className="flex items-center">
          <div className="flex flex-row items-center justify-start gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star className="text-gray-800"/>
            ))}
          </div>
          <div
            onClick={() => this._toggleTune()}
            className="absolute cursor-pointer required-indicator inset-y-0 right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 text-2xl opacity-80 text-red-500"
          >

            {this.data.required ? "*" : ""}

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
      <div className="w-full flex flex-row items-center bg-transparent  justify-between cdx-settings-button cdx-settings-button">
        <div className="ce-popover-item__title text-black">Required</div>
        <Switch
          onCheckedChange={(e) => {
            console.log(e);
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
    this.wrapper.querySelector('.required-indicator').textContent = this.data.required ? "*" : "";

  }

  static get isReadOnlySupported() {
    return true;
  }

  static get toolbox() {
    return {
      title: "Rating",
      icon: '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2h10v10H2z"></path></svg>',
    };
  }
}

export default StarratingTool;
