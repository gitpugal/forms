import { Button } from "@/components/ui/button";
import { createRoot } from "react-dom/client";

class ButtonTool {
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
      <Button
        contentEditable
        onInput={(e) => {
          console.log(e)
          this.data.text = e;
        }}>{this.data.text || 'Button'}</Button>
    )
    const root = createRoot(this.wrapper);
    root.render(button)
    return this.wrapper;
  }

  save(blockContent) {
    return {
      text: blockContent.querySelector('button').textContent,
    };
  }

  static get toolbox() {
    return {
      title: 'Button',
      icon: '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="5" width="10" height="4"></rect></svg>',
    };
  }
}

export default ButtonTool;
