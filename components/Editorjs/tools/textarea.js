class TextareaTool {
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
    const textarea = document.createElement('textarea');

    textarea.placeholder = 'Enter text...';
    textarea.value = this.data.text || '';

    textarea.addEventListener('input', () => {
      this.data.text = textarea.value;
    });

    this.wrapper.appendChild(textarea);
    return this.wrapper;
  }

  save(blockContent) {
    return {
      text: blockContent.querySelector('textarea').value,
    };
  }

  static get toolbox() {
    return {
      title: 'Textarea',
      icon: '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="2" width="10" height="10"></rect></svg>',
    };
  }
}

export default TextareaTool;
