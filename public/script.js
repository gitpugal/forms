
document.getElementById('openFormButton').addEventListener('click', function () {
  document.getElementById('formContainer').classList.remove('hidden');
  fetchData();
});

let formData = {};
let isSubmitted = false;
let currentPage = 0;
let errors = {};
let curForm = null;
let curTheme = null;
let customTheme = null;
let formJson = null;
let isFetching = false;
let isNotFound = false;

const notFound = () => {
  document.getElementById('formContainer').innerHTML = 'Form not found';
};

const fetchData = async () => {
  if (!isFetching) {
    try {
      isFetching = true;
      renderForm();
      const response = await fetch('https://form-x-eight.vercel.app/api/form?form_id=835913d9-4594-4a79-90f8-1c4d6258e177&opened_count=1');
      const data = await response.json();
      if (data?.form == null) {
        isNotFound = true;
        isFetching = false;
        notFound();
        return;
      }
      formJson = data?.form;
      curForm = data?.form;
      curTheme = curForm?.theme;
      customTheme = curForm?.customTheme ? curForm?.customTheme : null;
      isFetching = false;
      renderForm();
    } catch (error) {
      isFetching = false;
      console.log(error);
    }
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;
  if (curForm?.user_form_cache) {
    let oldDoc = JSON.parse(localStorage?.getItem(`${curForm?.form_id}-formcache`) || "{}") || {};
    oldDoc = { ...oldDoc, [name]: value };
    localStorage?.setItem(`${curForm?.form_id}-formcache`, JSON.stringify(oldDoc));
  }
  formData = { ...formData, [name]: value };
  errors = { ...errors, [name]: "" };
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  const responsePayload = {
    form_id: '835913d9-4594-4a79-90f8-1c4d6258e177',
    submitted_at: new Date().toISOString(),
    responses: formData,
  };

  try {
    const response = await fetch("/api/form_responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responsePayload),
    });

    if (response.ok) {
      console.log("Form submitted successfully");
      isSubmitted = true;
      setTimeout(() => {
        if (curForm?.redirect && curForm?.redirect_url?.length > 0) {
          window.location.replace(curForm?.redirect_url);
        }
      }, 2000);
    } else {
      console.error("Form submission failed");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
  localStorage?.removeItem(`${curForm?.form_id}-formcache`);
};

const validatePage = () => {
  const currentFields = curForm?.form_json[currentPage]?.blocks || [];
  const newErrors = {};
  currentFields.forEach((field) => {
    if (field.data.required && !formData[field.data.label]) {
      newErrors[field.data.label] = `${field.data.label} is required.`;
    }
  });
  errors = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleNext = (e) => {
  e.preventDefault();
  currentPage += 1;
  renderForm();
};

const handlePrevious = (e) => {
  e.preventDefault();
  currentPage -= 1;
  renderForm();
};

const closeForm = () => {
  const formContainer = document.getElementById('formContainer');
  formContainer.classList.add('hidden');
  formContainer.innerHTML = '';
};

const renderForm = () => {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = '';
  // Apply styles to formContainer
  formContainer.style.width = '30vw';
  formContainer.style.margin = 'auto';
  formContainer.style.padding = '30px 15px';
  formContainer.style.backgroundColor = 'white';
  formContainer.style.border = '2px solid #ccc';
  formContainer.style.borderRadius = '8px';
  formContainer.style.overflowY = 'auto';
  formContainer.style.height = '70vh';
  formContainer.style.bottom = '20px';
  formContainer.style.right = '20px';
  formContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  formContainer.style.zIndex = '1000';
  formContainer.style.position = 'fixed';
  // Create the anchor element
  const anchor = document.createElement('a');
  anchor.href = "https://form-x-eight.vercel.app";
  anchor.style.display = "flex";
  anchor.style.flexDirection = "row";
  anchor.style.position = "fixed";
  anchor.style.right = "30px"; // Equivalent to Tailwind's right-5
  anchor.style.bottom = "30px"; // Equivalent to Tailwind's bottom-5
  anchor.style.color = "white"; // Tailwind text-white
  anchor.style.justifyContent = "center"; // Tailwind justify-between
  anchor.style.gap = "0.25rem"; // Tailwind gap-1
  anchor.style.alignItems = 'center'
  anchor.style.padding = "0.25rem 0.75rem"; // Tailwind px-3 py-1
  anchor.style.borderRadius = "0.375rem"; // Tailwind rounded-md
  anchor.style.backgroundColor = "#14b8a6"; // Tailwind bg-teal-500

  // Create the first paragraph element
  const firstParagraph = document.createElement('p');
  firstParagraph.style.fontWeight = "300"; // Tailwind font-light
  firstParagraph.style.fontSize = "0.75rem"; // Tailwind text-xs
  firstParagraph.textContent = "powered by";

  // Create the second paragraph element
  const secondParagraph = document.createElement('p');
  secondParagraph.style.fontWeight = "200"; // Tailwind font-extralight
  secondParagraph.style.fontFamily = "sans-serif"; // Tailwind font-sans
  secondParagraph.style.color = "rgba(255, 255, 255, 0.5)"; // Tailwind dark:text-white/50
  secondParagraph.style.fontSize = "0.875rem"; // Tailwind text-sm
  secondParagraph.innerHTML = 'Form <span style="font-family: serif; font-style: italic; position: relative; right: 0.5rem; font-size: 1.125rem;">flow</span>';

  // Append the paragraphs to the anchor element
  anchor.appendChild(firstParagraph);
  anchor.appendChild(secondParagraph);

  // Append the anchor element to the body or another container
  formContainer.appendChild(anchor);


  if (isFetching) {
    const loader = document.createElement('div');
    loader.style.border = "5px solid #000000";
    loader.style.borderRadius = "50%";
    loader.style.borderTop = "5px solid #ffffff";
    loader.style.width = "50px";
    loader.style.height = "50px";
    loader.style.animation = "rotate 2s linear infinite";
    loader.style.top = "50%";
    loader.style.left = "50%";
    loader.style.position = 'relative';
    loader.style.transform = " translate(-50%, -50%)";
    formContainer.appendChild(loader);
    return;
  }

  if (isNotFound) {
    notFound();
    return;
  }

  if (curForm?.closed) {
    formContainer.innerHTML = `
            <div class="form-container">
                <div class="text-center relative top-1/2 -translate-y-1/2">
                    <p class="text-3xl font-semibold text-yellow-400">
                        Sorry, submissions to this form is closed currently!
                    </p>
                    <p class="text-center mt-2 text-black/40">Contact the creator if the form.</p>
                </div>
            </div>
        `;
    return;
  }

  const formElement = document.createElement('form');
  formElement.className = 'space-y-4 w-full';
  formElement.onsubmit = currentPage === curForm?.form_json.length - 1 ? handleSubmit : handleNext;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = 'x';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.background = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = closeForm;

  formContainer.appendChild(closeButton);

  curForm?.form_json[currentPage]?.blocks?.forEach((el, index) => {
    const error = errors[el.data.label];
    const inputClass = `flex-1 focus:outline-none ${error ? 'border-red-500' : ''}`;

    switch (el.type) {
      case 'EmailInput':
      case 'textInput':
      case 'PhoneInput':
      case 'NumberInput':
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'relative leading-7 text-md sm:truncate';

        const inputLabel = document.createElement('p');
        inputLabel.className = 'block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent';
        inputLabel.textContent = el?.data?.label;

        const inputContainer = document.createElement('div');
        inputContainer.className = 'flex border px-2 py-2 rounded-md flex-row items-center justify-start gap-2 dark:border-white/30';
        inputContainer.style.borderColor = customTheme?.color;

        const inputElement = document.createElement('input');
        inputElement.defaultValue = formData[el?.data?.label] || '';
        inputElement.name = el?.data?.label;
        inputElement.onchange = handleChange;
        inputElement.required = el?.data?.required;
        inputElement.type = el?.data?.type;
        inputElement.disabled = false;
        inputElement.className = `${inputClass} bg-transparent dark:text-gray-300 placeholder:text-inherit placeholder:opacity-40`;
        inputElement.placeholder = el?.data?.placeholder ? el?.data?.placeholder : 'Enter placeholder text';

        inputContainer.appendChild(inputElement);

        const requiredIndicator = document.createElement('div');
        requiredIndicator.className = 'absolute cursor-pointer inset-y-0 right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 text-2xl opacity-80 text-red-500';
        requiredIndicator.textContent = el?.data?.required ? '*' : '';

        inputWrapper.appendChild(inputLabel);
        inputWrapper.appendChild(inputContainer);
        inputWrapper.appendChild(requiredIndicator);
        formElement.appendChild(inputWrapper);
        break;

      // Add more cases for other input types (e.g., LongAnswerInput, BannerImageTool, etc.)

      default:
        break;
    }
  });

  const formActions = document.createElement('div');
  formActions.className = 'flex flex-row items-center justify-between gap-2 w-fit';

  if (currentPage > 0) {
    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.textContent = '<- Previous';
    prevButton.onclick = handlePrevious;
    formActions.appendChild(prevButton);
  }

  if (curForm?.form_json.length > 0 && currentPage < curForm?.form_json.length - 1) {
    const nextButton = document.createElement('button');
    nextButton.type = 'submit';
    nextButton.textContent = 'Next ->';
    formActions.appendChild(nextButton);
  } else {
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    submitButton.style.background = "black";
    submitButton.style.padding = "7px 15px";
    submitButton.style.borderRadius = "7px";
    submitButton.style.color = "white";

    formActions.appendChild(submitButton);
  }

  formElement.appendChild(formActions);
  formContainer.appendChild(formElement);



};