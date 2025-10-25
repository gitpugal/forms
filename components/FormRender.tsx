"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TiStarOutline, TiStarFullOutline } from "react-icons/ti";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCheck,
  CheckCheckIcon,
  CheckCircle,
  CheckCircle2Icon,
  CheckIcon,
  Loader2Icon,
  PhoneCallIcon,
} from "lucide-react";
import { DatePicker } from "./ui/date-picker";
import BasicTimePicker from "@/components/TimePicker";
import dayjs from "dayjs";
import CheckBoxTool from "./Editorjs/tools/checkboxtool";
import { useToast } from "./ui/use-toast";
import { PhoneInput } from "./ui/phone-input";
import ReCAPTCHA from "react-google-recaptcha";

const FormRenderer = ({
  form,
  formId,
  preview,
  cancelPreview,
  fullWidth,
}: any) => {
  const [formData, setFormData]: any = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [errors, setErrors] = useState<any>({});
  const [curForm, setCurFOrm]: any = useState(form);
  const [curTheme, setCurTheme] = useState(curForm?.theme);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [customTheme, setCustomTheme]: any = useState(
    curForm?.customTheme ? curForm?.customTheme : null
  );
  const [isRecaptchaPresent, setisRecaptchaPresent]: any = useState([]);
  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, type, checked, value } = e.target;

    // Determine if it's a checkbox or other input type
    const newValue = type == "checkbox" ? (checked ? "Yes" : "No") : value;

    if (curForm?.user_form_cache) {
      let oldDoc =
        JSON.parse(
          localStorage?.getItem(`${curForm?.form_id}-formcache`) || "{}"
        ) || {};
      console.log(oldDoc);
      if (oldDoc[name] == newValue) {
        oldDoc[name] = null;
      } else {
        oldDoc = { ...oldDoc, [name]: newValue };
      }
      localStorage?.setItem(
        `${curForm?.form_id}-formcache`,
        JSON.stringify(oldDoc)
      );
    }

    setFormData({
      ...formData,
      [name]: formData[name] == newValue ? null : newValue,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const multipleChoiceChangeHandler = (e: any) => {
    const { name, value, multipleChoice } = e.target;

    // Determine if it's a checkbox or other input type
    const newValue = value;

    if (curForm?.user_form_cache) {
      let oldDoc =
        JSON.parse(
          localStorage?.getItem(`${curForm?.form_id}-formcache`) || "{}"
        ) || {};
      if (
        multipleChoice
          ? oldDoc[name]?.includes(newValue)
          : oldDoc[name] == newValue
      ) {
        if (multipleChoice) {
          oldDoc[name] = oldDoc[name]?.filter(
            (option: string) => option != newValue
          );
        } else {
          oldDoc[name] = null;
        }
      } else {
        oldDoc = {
          ...oldDoc,
          [name]: multipleChoice ? [...oldDoc[name], newValue] : newValue,
        };
      }
      localStorage?.setItem(
        `${curForm?.form_id}-formcache`,
        JSON.stringify(oldDoc)
      );
    }

    setFormData({
      ...formData,
      [name]: multipleChoice
        ? formData[name]?.includes(newValue)
          ? formData[name]?.filter((option: string) => option != newValue)
          : [...(formData[name] ? formData[name] : []), newValue]
        : formData[name] == newValue
        ? null
        : newValue,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (validatePage()) {
      setisSubmitting(true);
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
          setisSubmitting(false);

          console.log("Form submitted successfully");
          setIsSubmitted(true); // Update state to indicate successful submission
          setTimeout(() => {
            if (curForm?.redirect && curForm?.redirect_url?.length > 0) {
              router.replace(curForm?.redirect_url);
            }
          }, 2000);
        } else {
          setisSubmitting(false);

          console.error("Form submission failed");
          // Handle form submission failure, e.g., show an error message
        }
      } catch (error) {
        setisSubmitting(false);

        console.error("Error submitting form:", error);
        // Handle error during form submission
      }
      setisSubmitting(false);

      localStorage?.removeItem(`${curForm?.form_id}-formcache`);
    }
  };

  const validatePage = () => {
    const currentFields = curForm?.form_json[currentPage]?.blocks || [];
    const newErrors: any = {};
    currentFields.forEach((field: any, index: number) => {
      if (field.data.required && !formData[field.data.label]) {
        newErrors[field.data.label] = `This field is required.`;
      }
      if (field.type == "recaptcha") {
        if (
          isRecaptchaPresent?.length < currentPage + 1 ||
          (isRecaptchaPresent?.length > currentPage + 1 &&
            isRecaptchaPresent[currentPage] == null) ||
          isRecaptchaPresent[currentPage]?.length == 0
        ) {
          newErrors[
            "recaptcha" + currentPage + "-" + index
          ] = `Complete this captcha to submit this form`;
        }
      }
    });
    console.log(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: any) => {
    e.preventDefault();
    console.log(formData);
    if (validatePage()) {
      let conditoinBlock = curForm?.form_json[currentPage]?.blocks.find(
        (block: any) =>
          block.type === "condition" && block?.data?.action == "Go to page"
      );
      if (
        conditoinBlock &&
        conditoinBlock?.data?.action_value > currentPage &&
        conditoinBlock?.data?.action_value <= curForm?.form_json?.length &&
        formData[
          curForm?.form_json[currentPage]?.blocks.find(
            (block: any) =>
              block.type === "condition" && block?.data?.action == "Go to page"
          )?.data?.text
        ] ==
          curForm?.form_json[currentPage]?.blocks.find(
            (block: any) =>
              block.type === "condition" && block?.data?.action == "Go to page"
          )?.data?.value
      ) {
        setCurrentPage(conditoinBlock?.data?.action_value);
      } else {
        setCurrentPage((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = (e: any) => {
    e.preventDefault();

    // Find the index of the form array that contains a block with type "condition"
    const formIndex = curForm?.form_json?.findIndex((item: any) =>
      item.blocks.some((block: any) => block?.type === "condition")
    );

    // Find the index of the block within the identified form index
    let blockIndex = -1;
    if (formIndex !== -1) {
      blockIndex = curForm?.form_json[formIndex]?.blocks.findIndex(
        (block: any) =>
          block.type === "condition" && block?.data?.action == "Go to page"
      );
    }
    if (formIndex != -1 && blockIndex != -1) {
      if (
        currentPage - 1 > formIndex &&
        currentPage - 1 <
          curForm?.form_json[formIndex]?.blocks[blockIndex]?.data
            ?.action_value &&
        formData[
          curForm?.form_json[formIndex]?.blocks[blockIndex]?.data?.text
        ] == curForm?.form_json[formIndex]?.blocks[blockIndex]?.data?.value
      ) {
        setCurrentPage(formIndex);
      } else {
        setCurrentPage((prev) => prev - 1);
      }
    } else {
      setCurrentPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (curForm && !preview) {
      let wireFrameForm: any = {};
      curForm?.form_json[currentPage]?.blocks?.forEach(
        (el: any, index: number) => {
          switch (el.type) {
            case "EmailInput":
            case "textInput":
            case "PhoneInput":
            case "NumberInput":
              wireFrameForm = {
                ...wireFrameForm,
                [el?.data?.label]: null,
              };
              break;
            case "LongAnswerInput":
              wireFrameForm = {
                ...wireFrameForm,
                [el?.data?.label]: "",
              };
              break;
            case "calendar":
              wireFrameForm = {
                ...wireFrameForm,
                [el?.data?.label || "Calendar"]: "",
              };
              break;
            case "select":
              wireFrameForm = {
                ...wireFrameForm,
                [el?.data?.label]: null,
              };
              break;
            case "checkboc":
              wireFrameForm = {
                ...wireFrameForm,
                [`${el.data.label}(Checkbox)`]: "No",
              };
              break;
            case "rating":
              setFormData((prev: any) => ({
                ...prev,
                [el.data.label + "(Star Rating)"]: 0,
              }));
              wireFrameForm = {
                ...wireFrameForm,
                [el.data.label + "(Star Rating)"]: 0,
              };
              break;
            case "RadioTool":
              wireFrameForm = {
                ...wireFrameForm,
                [el.data.label]: null,
              };
              break;
            case "scale":
              wireFrameForm = {
                ...wireFrameForm,
                [el?.data?.label + "(Number Rating)"]: 0,
              };
              break;
          }
        }
      );
      if (curForm?.user_form_cache) {
        let oldDoc =
          JSON.parse(
            localStorage?.getItem(`${curForm?.form_id}-formcache`) || "{}"
          ) || {};
        let newForm = { ...wireFrameForm, ...oldDoc };
        localStorage?.setItem(
          `${curForm?.form_id}-formcache`,
          JSON.stringify(newForm)
        );
        setFormData(newForm);
      } else {
        localStorage?.removeItem(`${curForm?.form_id}-formcache`);
        setFormData(wireFrameForm);
      }
    }
    console.log(curForm);
  }, [curForm]);

  useEffect(() => {
    setCurFOrm(form);
  }, [form]);

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  return (
    <div
      onClick={() => {
        if (preview) {
          cancelPreview();
        }
      }}
      className={`${
        curForm?.theme == "dark" && "dark"
      } w-full overflow-x-hidden md:pb-0 pb-10  ${
        fullWidth && "overflow-y-hidden group"
      }`}
    >
      {curForm?.closed ? (
        <div
          className={`w-full ${
            fullWidth
              ? "md:w-full rounded-md"
              : preview
              ? "md:w-[70%] border-2 rounded-md"
              : "md:w-1/2"
          }  mx-auto  dark:bg-black/85 h-screen dark:text-white ${
            !fullWidth && "p-5  md:p-10"
          }  overflow-y-scroll no-scrollbar`}
        >
          <div className="text-center relative top-1/2 -translate-y-1/2">
            <p className="text-xl md:text-3xl font-semibold text-yellow-400">
              Sorry, submissions to this form is closed currently !
            </p>
            <p className="text-center mt-2 text-black/40">
              Contact the creator of this form.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`w-[95%] ${
            fullWidth
              ? "w-full rounded-md overflow-hidden"
              : preview
              ? "md:w-[70%] border-2 rounded-md"
              : "md:w-1/2"
          }  mx-auto  dark:bg-black/85 group-hover:scale-105 transition-all duration-300 ease-in-out overflow-x-hidden min-h-screen dark:text-white p-5 md:p-10  overflow-y-scroll bg-red-200 no-scrollbar`}
          style={
            !curTheme
              ? { backgroundColor: "white" }
              : curTheme === "custom"
              ? {
                  backgroundColor:
                    curTheme === "custom" && customTheme?.backgroundcolor
                      ? customTheme.backgroundcolor
                      : "white",
                  color: customTheme?.color ? customTheme?.color : "",
                  fontFamily: customTheme?.fontfamily
                    ? customTheme?.fontfamily
                    : "",
                }
              : curTheme == "light"
              ? { backgroundColor: "white" }
              : {}
          }
        >
          {!isSubmitted ? (
            <form
              className="space-y-4"
              onSubmit={
                currentPage === curForm?.form_json.length - 1
                  ? handleSubmit
                  : handleNext
              }
            >
              {curForm?.bannerUrl && (
                <div className="w-full h-60 mb-20 border-b dark:border-black relative bg-transparent rounded-t-lg">
                  <img
                    src={curForm?.bannerUrl}
                    alt="Banner"
                    className="w-full h-full object-cover shadow-none rounded-t-lg"
                  />

                  {curForm?.logoUrl && (
                    <div className="h-28 w-28 group overflow-hidden absolute rounded-full left-20 -bottom-14 shadow-xl border-4 border-white">
                      <img
                        src={curForm?.logoUrl}
                        alt="Logo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
              {curForm?.form_json[currentPage]?.blocks
                ?.filter((block: any) => {
                  if (
                    curForm?.form_json[currentPage]?.blocks?.find(
                      (inblock: any) =>
                        inblock.type == "condition" &&
                        inblock?.data?.action == "Hide blocks"
                    )
                  ) {
                    if (
                      curForm?.form_json[currentPage]?.blocks
                        ?.find(
                          (inblock: any) =>
                            inblock.type == "condition" &&
                            inblock?.data?.action == "Hide blocks" &&
                            inblock?.data?.value == formData[inblock.data.text]
                        )
                        ?.data?.action_value?.includes(block?.data?.text)
                    ) {
                      return false;
                    } else {
                      return true;
                    }
                  } else {
                    return true;
                  }
                })
                ?.map((el: any, index: number) => {
                  let error = errors[el.data.label];
                  if (el.type == "recaptcha") {
                    error = errors["recaptcha" + currentPage + "-" + index];
                  }
                  const inputClass = `flex-1 focus:outline-none ${
                    error ? "border-red-500" : ""
                  }`;

                  switch (el.type) {
                    case "textInput":
                      return (
                        <div
                          key={index}
                          className="relative leading-7 w-full text-md sm:truncate"
                        >
                          {/* {curForm?.theme && "Yes"} */}
                          {el?.data?.label?.length > 0 && (
                            <p className="w-1/2 block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent">
                              {el?.data?.label}
                            </p>
                          )}
                          {/* {formData[el?.data?.label]} {el?.data?.label} */}
                          <div
                            className={`flex w-full md:w-1/2 border px-2 py-2 rounded-md flex-row items-center justify-start gap-2  dark:border-white/30`}
                            style={{
                              borderColor: customTheme?.color,
                            }}
                          >
                            <input
                              value={formData[el?.data?.label] || ""}
                              name={el?.data?.label}
                              onChange={handleChange}
                              // required={el?.data?.required}
                              type={el?.data?.type}
                              minLength={
                                el?.data?.minLength
                                  ? el?.data?.minLengthValue
                                    ? el?.data?.minLengthValue
                                    : 0
                                  : 0
                              }
                              maxLength={
                                el?.data?.maxLength
                                  ? el?.data?.maxLengthValue
                                    ? el?.data?.maxLengthValue
                                    : ""
                                  : ""
                              }
                              // disabled={preview}
                              className={`${inputClass}  bg-transparent dark:text-gray-300 placeholder:text-inherit placeholder:opacity-40`}
                              placeholder={
                                el?.data?.placeholder
                                  ? el?.data?.placeholder
                                  : "Enter placeholder text"
                              }
                            />
                          </div>
                          {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                          )}
                          <div className="absolute cursor-pointer inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );

                    case "PhoneInput":
                      return (
                        <div
                          key={index}
                          className="relative leading-7 w-full text-md sm:truncate"
                        >
                          {/* {curForm?.theme && "Yes"} */}
                          {el?.data?.label?.length > 0 && (
                            <p className="w-1/2 block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent">
                              {el?.data?.label}
                            </p>
                          )}
                          <PhoneInput
                            defaultValue={formData[el?.data?.label]}
                            name={el?.data?.label}
                            onChange={(e) => {
                              handleChange({
                                target: { name: el?.data?.label, value: e },
                              });
                            }}
                            // required={el?.data?.required}
                            type={el?.data?.type}
                            // disabled={preview}
                            // className={`${inputClass}  bg-transparent dark:text-gray-300 placeholder:text-inherit placeholder:opacity-40`}
                            placeholder={
                              el?.data?.placeholder
                                ? el?.data?.placeholder
                                : "Enter placeholder text"
                            }
                            className="w-full md:w-1/2 bg-transparent"
                            defaultCountry={el?.data?.defaultCountryCode}
                          />
                          {/* <div
                            className={`flex w-full md:w-1/2 border px-2 py-2 rounded-md flex-row items-center justify-start gap-2  dark:border-white/30`}
                            style={{
                              borderColor: customTheme?.color,
                            }}
                          >
                            <input
                              defaultValue={formData[el?.data?.label]}
                              name={el?.data?.label}
                              onChange={handleChange}
                              // required={el?.data?.required}
                              type={el?.data?.type}
                              // disabled={preview}
                              className={`${inputClass}  bg-transparent dark:text-gray-300 placeholder:text-inherit placeholder:opacity-40`}
                              placeholder={
                                el?.data?.placeholder
                                  ? el?.data?.placeholder
                                  : "Enter placeholder text"
                              }
                            />
                          </div> */}
                          {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                          )}
                          <div className="absolute cursor-pointer inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );
                    case "NumberInput":
                      return (
                        <div
                          key={index}
                          className="relative leading-7 w-full text-md sm:truncate"
                        >
                          {/* {curForm?.theme && "Yes"} */}
                          {el?.data?.label?.length > 0 && (
                            <p className="w-1/2 block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent">
                              {el?.data?.label}
                            </p>
                          )}
                          <div
                            className={`flex w-full md:w-1/2 border px-2 py-2 rounded-md flex-row items-center justify-start gap-2  dark:border-white/30`}
                            style={{
                              borderColor: customTheme?.color,
                            }}
                          >
                            <input
                              defaultValue={formData[el?.data?.label]}
                              name={el?.data?.label}
                              onChange={handleChange}
                              // required={el?.data?.required}
                              type={el?.data?.type}
                              min={
                                el?.data?.minLength
                                  ? el?.data?.minLengthValue
                                    ? el?.data?.minLengthValue
                                    : 0
                                  : 0
                              }
                              max={
                                el?.data?.maxLength
                                  ? el?.data?.maxLengthValue
                                    ? el?.data?.maxLengthValue
                                    : ""
                                  : ""
                              }
                              // disabled={preview}
                              className={`${inputClass}  bg-transparent dark:text-gray-300 placeholder:text-inherit placeholder:opacity-40`}
                              placeholder={
                                el?.data?.placeholder
                                  ? el?.data?.placeholder
                                  : "Enter placeholder text"
                              }
                            />
                          </div>
                          {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                          )}
                          <div className="absolute cursor-pointer inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );

                    case "EmailInput":
                      return (
                        <div
                          key={index}
                          className="relative leading-7 w-full text-md sm:truncate"
                        >
                          {/* {curForm?.theme && "Yes"} */}
                          {el?.data?.label?.length > 0 && (
                            <p className="w-1/2 block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent">
                              {el?.data?.label}
                            </p>
                          )}
                          <div
                            className={`flex w-full md:w-1/2 border px-2 py-2 rounded-md flex-row items-center justify-start gap-2  dark:border-white/30`}
                            style={{
                              borderColor: customTheme?.color,
                            }}
                          >
                            <input
                              defaultValue={formData[el?.data?.label]}
                              name={el?.data?.label}
                              onChange={handleChange}
                              // required={el?.data?.required}
                              type={el?.data?.type}
                              // disabled={preview}
                              className={`${inputClass}  bg-transparent dark:text-gray-300 placeholder:text-inherit placeholder:opacity-40`}
                              placeholder={
                                el?.data?.placeholder
                                  ? el?.data?.placeholder
                                  : "Enter placeholder text"
                              }
                            />

                            {el.type == "EmailInput" && (
                              <p className="text-gray-700 mx-2">@</p>
                            )}
                            {el.type == "PhoneInput" && (
                              <PhoneCallIcon className="mx-2 text-gray-500" />
                            )}
                            {el.type == "NumberInput" && (
                              <p className="text-gray-700 mx-2">123</p>
                            )}
                          </div>
                          {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                          )}
                          <div className="absolute cursor-pointer inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );
                    case "BannerImageTool":
                      return (
                        <div key={index}>
                          <img
                            src={el?.data?.url}
                            alt="Banner Image"
                            className="w-full"
                          />
                        </div>
                      );
                    case "LongAnswerInput":
                      return (
                        <div
                          key={index}
                          className="relative leading-7 w-full text-md sm:truncate"
                        >
                          {el?.data?.label?.length > 0 && (
                            <p className="md:w-1/2 block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent">
                              {el?.data?.label}
                            </p>
                          )}
                          <div className="flex w-full border dark:border-white/30 px-2 py-2 rounded-md flex-row items-center justify-start gap-2">
                            <textarea
                              name={el?.data?.label}
                              defaultValue={formData[el?.data?.label]}
                              onChange={handleChange}
                              // required={el?.data?.required}
                              // defaultValue={el?.data?.placeholder}
                              rows={4}
                              // disabled={preview}
                              className={`${inputClass} dark:bg-transparent placeholder:font-normal bg-transparent dark:text-gray-300 dark:border-white/30`}
                              placeholder={el?.data?.placeholder}
                            />
                          </div>
                          {/* {error && <p className="text-red-500 mt-1">{error}</p>} */}
                          {/* <div className="absolute cursor-pointer required-indicator right-0 md:top-0 top-9 flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            {el?.data?.required ? "*" : ""}
                          </div> */}
                          <div className="absolute cursor-pointer  right-0 top-0  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );
                    case "header":
                      return (
                        <p
                          className={`h${el?.data?.level} font-bold mtimportant`}
                          key={index}
                        >
                          {el?.data?.text}
                        </p>
                      );
                    case "calendar":
                      return (
                        <div
                          key={index}
                          className="flex relative flex-col my-10 items-start justify-start gap-2"
                        >
                          <p className="w-full p-0 border-0 border-transparent ring-0 focus:ring-0 dark:bg-transparent dark:text-gray-300 bg-transparent">
                            {el?.data?.label}
                          </p>

                          <DatePicker
                            onChange={handleChange}
                            name={el?.data?.label || "Calendar"}
                            // disabled={preview}
                            value={formData[el?.data?.label || "Calendar"]}
                            // className="rounded-md border text-black md:w-1/2 w-3/4 dark:bg-transparent bg-transparent dark:text-gray-300 dark:border-white/30"
                          />
                          {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                          )}
                          <div className="absolute cursor-pointer inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );
                    case "timer":
                      return (
                        <div
                          key={index}
                          className="flex relative flex-col my-10 items-start justify-start gap-2"
                        >
                          {el.data?.label?.length > 0 && (
                            <p className="w-full p-0 border-0 border-transparent ring-0 focus:ring-0 dark:bg-transparent dark:text-gray-300 bg-transparent">
                              {el?.data?.label}
                            </p>
                          )}

                          <BasicTimePicker
                            onChange={handleChange}
                            name={el?.data?.label || "Timer"}
                            disabled={false}
                            value={dayjs(
                              formData[el?.data?.label || "Select a time"]
                            )}
                            // className="rounded-md border text-black md:w-1/2 w-3/4 dark:bg-transparent bg-transparent dark:text-gray-300 dark:border-white/30"
                          />
                          {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                          )}
                          <div className="absolute cursor-pointer inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );
                    case "select":
                      return (
                        <div
                          key={index}
                          className="flex relative flex-col my-10 items-start justify-start gap-2"
                        >
                          {el?.data?.label?.length > 0 && (
                            <p className="w-full block p-0 border-0 border-transparent ring-0 focus:ring-0  dark:bg-transparent dark:text-gray-300 bg-transparent">
                              {el?.data?.label}
                            </p>
                          )}
                          <Select
                            // required={el?.data?.required}
                            defaultValue={formData[el?.data?.label]}
                            onValueChange={(e) => {
                              handleChange({
                                target: { name: el?.data?.label, value: e },
                              });
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            {el?.data?.options?.length > 0 && (
                              <SelectContent>
                                {el?.data?.options.map(
                                  (option: any, index: any) => (
                                    <SelectItem key={index} value={option}>
                                      {option}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            )}
                          </Select>
                          <div className="absolute cursor-pointer inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );
                    case "checkboc":
                      return (
                        <div className="flex flex-row items-center justify-start gap-2">
                          <input
                            type="checkbox"
                            checked={
                              formData[`${el.data.label}(Checkbox)`] == "Yes"
                                ? true
                                : false || false
                            }
                            name={`${el.data.label}(Checkbox)`}
                            onChange={handleChange}
                          />

                          <p>{el.data.label}</p>
                        </div>
                      );
                    case "rating":
                      return (
                        <div className="relative">
                          <p className="text-lg">{el?.data?.label}</p>
                          <div className="flex flex-row items-center justify-start gap-2">
                            {formData[el.data.label + "(Star Rating)"] ? (
                              <>
                                {Array.from({
                                  length:
                                    formData[el.data.label + "(Star Rating)"],
                                }).map((_, index) => (
                                  <TiStarFullOutline
                                    onClick={() => {
                                      handleChange({
                                        target: {
                                          name: `${el.data.label}(Star Rating)`,
                                          value: index + 1,
                                        },
                                      });
                                    }}
                                    color="#eab308"
                                    size={35}
                                    className="text-yellow-500 cursor-pointer"
                                  />
                                ))}
                                {Array.from({
                                  length:
                                    5 -
                                    formData[`${el.data.label}(Star Rating)`],
                                }).map((_, index) => (
                                  <TiStarOutline
                                    className="cursor-pointer text-gray-400"
                                    onClick={() => {
                                      handleChange({
                                        target: {
                                          name: `${el.data.label}(Star Rating)`,
                                          value:
                                            formData[
                                              `${el.data.label}(Star Rating)`
                                            ] +
                                            index +
                                            1,
                                        },
                                      });
                                    }}
                                    size={35}
                                  />
                                ))}
                              </>
                            ) : (
                              Array.from({ length: 5 }).map((_, index) => (
                                <TiStarOutline
                                  className="cursor-pointer text-gray-400"
                                  onClick={() => {
                                    handleChange({
                                      target: {
                                        name: `${el.data.label}(Star Rating)`,
                                        value: index + 1,
                                      },
                                    });
                                  }}
                                  size={35}
                                />
                              ))
                            )}
                          </div>
                          <div className="absolute cursor-pointer inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );
                    case "paragraph":
                      return (
                        <div
                          dangerouslySetInnerHTML={{ __html: el.data.text }}
                        />
                      );
                    case "RadioTool":
                      return (
                        <div
                          key={index}
                          className="flex relative flex-col my-10 items-start justify-start gap-2"
                        >
                          <p className="w-full block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent">
                            {el?.data?.label}
                          </p>
                          <div className="flex flex-col gap-2">
                            {el?.data?.options
                              ?.filter((opt: any) => opt?.label?.length > 0)
                              ?.map((option: any, idx: number) => (
                                <label
                                  onClick={() => {
                                    multipleChoiceChangeHandler({
                                      target: {
                                        name: el?.data?.label,
                                        value: option.label,
                                        multipleChoice:
                                          el?.data?.multipleChoice,
                                      },
                                    });
                                  }}
                                  key={idx}
                                  className={`flex cursor-pointer  text-sm items-center border gap-2 px-5 py-2 rounded-3xl ${
                                    (el?.data?.multipleChoice
                                      ? formData[el?.data?.label]?.includes(
                                          option?.label
                                        )
                                      : formData[el?.data?.label] ==
                                        option?.label) &&
                                    "bg-green-500  text-white"
                                  }`}
                                >
                                  <span className="dark:text-gray-300">
                                    {(el?.data?.multipleChoice
                                      ? formData[el?.data?.label]?.includes(
                                          option?.label
                                        )
                                      : formData[el?.data?.label] ==
                                        option?.label) && (
                                      <CheckIcon
                                        size={15}
                                        className="inline mr-1"
                                      />
                                    )}{" "}
                                    {option.label}
                                  </span>
                                </label>
                              ))}
                          </div>
                          <div className="absolute cursor-pointer top-0 right-0  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                          {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                          )}
                        </div>
                      );
                    case "scale":
                      return (
                        <div className="relative">
                          <p className="text-lg">{el?.data?.label}</p>
                          <div className="flex flex-row md:mt-0 mt-3 items-center justify-start gap-2">
                            {Array.from({ length: 10 }).map((_, index) => (
                              <p
                                onClick={() => {
                                  handleChange({
                                    target: {
                                      name: `${el?.data?.label}(Number Rating)`,
                                      value: index + 1,
                                    },
                                  });
                                }}
                                className={`border rounded-md h-7 md:h-10 w-7 md:w-10 cursor-pointer flex items-center justify-center ${
                                  index + 1 ==
                                    formData[
                                      el?.data?.label + "(Number Rating)"
                                    ] && "bg-green-400 text-white font-semibold"
                                }`}
                              >
                                {index + 1}
                              </p>
                            ))}
                          </div>
                          <div className="absolute cursor-pointer inset-y-0 right-0 -top-1/2 md:top-1/2 md:-translate-y-1/2  flex items-center pr-3 text-2xl opacity-80 text-red-500">
                            <span className="requiredStar relative">
                              {el?.data?.required ? "*" : ""}
                              <p className=" tooltiptext absolute w-fit text-xs  transition-all duration-200 ease-in-out px-2 py-1 rounded-md bg-gray-800 text-white top-0 -left-36">
                                This field is required
                              </p>
                            </span>
                          </div>
                        </div>
                      );
                    case "list":
                      return (
                        <ol type="1" style={{ listStyleType: "inherit" }}>
                          {el?.data?.items?.map((item: string) => (
                            <li>{item}</li>
                          ))}
                        </ol>
                      );
                    case "recaptcha":
                      return (
                        <div>
                          {/* {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_CODE} */}
                          <ReCAPTCHA
                            sitekey={
                              process.env.NEXT_PUBLIC_RECAPTCHA_SITE_CODE
                            }
                            onChange={(value: any) => {
                              setisRecaptchaPresent((prev: any) => [
                                ...prev,
                                value,
                              ]);
                            }}
                          />
                          {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                          )}
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              <div className="flex flex-row items-center justify-between gap-2 w-fit">
                {currentPage > 0 && (
                  <Button
                    type="button"
                    // disabled={preview}
                    style={{
                      backgroundColor: customTheme?.button
                        ? customTheme?.button
                        : "",
                      color: customTheme?.buttonText
                        ? customTheme?.buttonText
                        : "",
                    }}
                    onClick={handlePrevious}
                  >
                    {"<- "} Previous
                  </Button>
                )}
                {curForm?.form_json.length > 0 &&
                currentPage < curForm?.form_json.length - 1 ? (
                  <Button
                    type="submit"
                    style={{
                      backgroundColor: customTheme?.button
                        ? customTheme?.button
                        : "",
                      color: customTheme?.buttonText
                        ? customTheme?.buttonText
                        : "",
                    }}
                    // disabled={preview}
                  >
                    Next <ArrowRight className="inline ml-1" />
                  </Button>
                ) : form ? (
                  <Button
                    type="submit"
                    style={{
                      backgroundColor: customTheme?.button
                        ? customTheme?.button
                        : "",
                      color: customTheme?.buttonText
                        ? customTheme?.buttonText
                        : "",
                    }}
                    disabled={preview || isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2Icon className="mr-2 animate-spin" />
                    )}{" "}
                    Submit
                  </Button>
                ) : (
                  <></>
                )}
              </div>
            </form>
          ) : (
            <div className="text-center relative top-[50vh] -translate-y-1/2">
              <p className="text-3xl font-semibold text-green-600">
                Form has been submitted!
              </p>
              <p className="text-center mt-2">Thank you for your submission</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormRenderer;
