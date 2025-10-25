import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

class SimpleImage {
    constructor({ data, api, readOnly }) {
        this.api = api;
        this.data = {
            ...data,
            url: data?.url || '',
            caption: data?.caption || '',
        };
        this.wrapper = null;
        this.readOnly = readOnly;
    }

    static get toolbox() {
        return {
            title: 'Image',
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
        };
    }

    render() {
        this.wrapper = document.createElement('div');

        const SimpleImageComponent = () => {
            const [data, setData] = useState({
                url: this.data.url,
                caption: this.data.caption,
            });
            const [isUploading, setIsUploading] = useState(false);

            const handlePaste = (event) => {
                const url = event.clipboardData.getData('text');
                setData((prev) => ({ ...prev, url }));
                this.data.url = url;
            };

            const handleFileChange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    setIsUploading(true);
                    const url = await uploadImage(file);
                    setData((prev) => ({ ...prev, url }));
                    this.data.url = url;
                    setIsUploading(false);
                }
            };

            const handleCaptionChange = (event) => {
                const caption = event.target.value;
                setData((prev) => ({ ...prev, caption }));
                this.data.caption = caption;
            };

            const uploadImage = async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'sys3hurw'); // Replace with your upload preset
                formData.append('cloud_name', 'dpgzkxcud');

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/dpgzkxcud/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                const data = await response.json();
                return data.secure_url; // Assuming response has secure_url property
            };

            return (
                <div className="simple-image">
                    {data.url && <img src={data.url} alt="Uploaded" />}
                    <div className='w-full grid grid-cols-2 gap-3 '>
                        <input
                            type="text"
                            placeholder="Paste an image URL..."
                            onPaste={handlePaste}
                            disabled={isUploading || this.readOnly}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading || this.readOnly}
                        />
                    </div>
                    {isUploading && <div className="loader">Uploading...</div>}
                </div>
            );
        };

        const root = createRoot(this.wrapper);
        root.render(<SimpleImageComponent />);
        return this.wrapper;
    }

    save() {
        return this.data;
    }
}

export default SimpleImage;
