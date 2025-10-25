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


// Select the button element
const button = document.getElementById('openFormButton');

// Get the value of the data-form-id attribute
const formId = button.getAttribute('data-form-id');

// Log the value to the console

const notFound = () => {
  document.getElementById('formContainer').innerHTML = 'Form not found';
};

const fetchData = async () => {
  if (!isFetching) {
    try {
      isFetching = true;
      const response = await fetch(`https://form-x-eight.vercel.app/api/form?form_id=${formId}&opened_count=1`);
      const data = await response.json();
      if (data?.form == null) {
        isNotFound = true;
        isFetching = false;
        notFound();
        return;
      }
      console.log(data?.form);
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
  const responsePayload = {
    form_id: formId,
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
  setCurrentPage((prev) => prev + 1);
};

const handlePrevious = (e) => {
  e.preventDefault();
  setCurrentPage((prev) => prev - 1);
};

const renderForm = () => {
  if (isNotFound) {
    notFound();
    return;
  }

  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = '';

  if (isFetching) {
    const loader = document.createElement('div');
    loader.className = 'h-fit w-full flex items-center justify-center py-20 animate-spin';
    formContainer.appendChild(loader);
    return;
  }

  if (curForm?.closed) {
    formContainer.innerHTML = `
            <div class="w-full mx-auto dark:bg-black/85 h-screen dark:text-white p-10 overflow-y-scroll no-scrollbar">
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
        inputElement.defaultValue = formData[el?.data?.label];
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
    nextButton.textContent = 'Next -';
    formActions.appendChild(nextButton);
  } else {
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    formActions.appendChild(submitButton);
  }

  formElement.appendChild(formActions);
  formContainer.appendChild(formElement);
};
