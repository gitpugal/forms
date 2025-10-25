class LabelTool {
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
    const label = document.createElement('label');

    label.textContent = this.data.text || 'Label';
    label.contentEditable = true;


    label.addEventListener('input', () => {
      this.data.text = label.textContent;
    });

    this.wrapper.appendChild(label);
    return this.wrapper;
  }

  save(blockContent) {
    return {
      text: blockContent.querySelector('label').textContent,
    };
  }

  static get toolbox() {
    return {
      title: 'Label',
      icon: '<svg width="14" height="14" viewBox="0 0 14 14"><text x="2" y="10" font-size="10">L</text></svg>',
    };
  }
}

export default LabelTool;
