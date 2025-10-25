export default class SimpleImage {
    static get toolbox() {
        return {
            title: 'Image',
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
        };
    }

    constructor({ data }) {
        this.data = data;
        this.wrapper = undefined;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('simple-image');

        if (this.data && this.data.url) {
            this._createImage(this.data.url, this.data.caption);
            return this.wrapper;
        }

        const input = document.createElement('input');
        input.placeholder = 'Paste an image URL...';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        input.addEventListener('paste', (event) => {
            this._createImage(event.clipboardData.getData('text'));
        });

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                const url = await this._uploadImage(file);
                this._createImage(url);
            }
        });

        this.wrapper.appendChild(input);
        this.wrapper.appendChild(fileInput);

        return this.wrapper;
    }

    async _uploadImage(file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "sys3hurw"); // Replace with your upload preset
        formData.append("cloud_name", "dpgzkxcud");

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/dpgzkxcud/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();
        return data.secure_url; // Assuming response has secure_url property
    }

    _createImage(url, captionText) {
        const image = document.createElement('img');
        const caption = document.createElement('input');

        image.src = url;
        caption.placeholder = 'Caption...';
        caption.value = captionText || '';

        this.wrapper.innerHTML = '';
        this.wrapper.appendChild(image);
        this.wrapper.appendChild(caption);
    }

    save(blockContent) {
        const image = blockContent.querySelector('img');
        const caption = blockContent.querySelector('input');

        return {
            url: image?.src,
            caption: caption?.value
        };
    }
    static get toolbox() {
        return {
            title: 'Banner Image',
            icon: '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="5" width="10" height="4"></rect></svg>',
        };
    }
}
