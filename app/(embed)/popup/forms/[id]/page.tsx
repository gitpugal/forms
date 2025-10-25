"use client";
import React, { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Star } from "lucide-react";
import { TiStarOutline, TiStarFullOutline } from "react-icons/ti";
import { useSession } from "next-auth/react";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FormRenderer = ({ params }: { params: { id: string } }) => {
  const [formData, setFormData]: any = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [errors, setErrors] = useState<any>({});
  const [curForm, setCurFOrm]: any = useState(null);
  const [curTheme, setCurTheme] = useState(curForm?.theme);
  const [customTheme, setCustomTheme]: any = useState(
    curForm?.customTheme ? curForm?.customTheme : null
  );
  const [formJson, setFormJson] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  if (isNotFound) {
    return notFound();
  }
  const fetchData = async () => {
    if (!isFetching) {
      try {
        setIsFetching(true);
        const response = await fetch(
          `https://form-x-eight.vercel.app/api/form?form_id=${params.id}&opened_count=1`
        );
        const data = await response.json();
        if (data?.form == null) {
          setIsNotFound(true);
          setIsFetching(false);
          return;
        }
        console.log(data?.form);
        setFormJson(data?.form);
        setCurFOrm(data?.form);
        setIsFetching(false);
      } catch (error) {
        setIsFetching(false);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);
  const router = useRouter();
  const session: any = useSession();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (curForm?.user_form_cache) {
      let oldDoc =
        JSON.parse(
          localStorage?.getItem(`${curForm?.form_id}-formcache`) || "{}"
        ) || {};
      oldDoc = { ...oldDoc, [name]: value };
      localStorage?.setItem(
        `${curForm?.form_id}-formcache`,
        JSON.stringify(oldDoc)
      );
    }
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const responsePayload = {
      form_id: params.id,
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
        setIsSubmitted(true); // Update state to indicate successful submission
        setTimeout(() => {
          if (curForm?.redirect && curForm?.redirect_url?.length > 0) {
            router.replace(curForm?.redirect_url);
          }
        }, 2000);
      } else {
        console.error("Form submission failed");
        // Handle form submission failure, e.g., show an error message
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error during form submission
    }
    localStorage?.removeItem(`${curForm?.form_id}-formcache`);
  };

  const validatePage = () => {
    const currentFields = curForm?.form_json[currentPage]?.blocks || [];
    const newErrors: any = {};
    currentFields.forEach((field: any) => {
      if (field.data.required && !formData[field.data.label]) {
        newErrors[field.data.label] = `${field.data.label} is required.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: any) => {
    e.preventDefault();
    // if (validatePage()) {
    setCurrentPage((prev) => prev + 1);
    // }
  };

  const handlePrevious = (e: any) => {
    e.preventDefault();
    setCurrentPage((prev) => prev - 1);
  };

  useEffect(() => {
    if (curForm) {
      if (curForm?.user_form_cache) {
        let oldDoc =
          JSON.parse(
            localStorage?.getItem(`${curForm?.form_id}-formcache`) || "{}"
          ) || {};
        console.log(oldDoc);
        setFormData({ ...oldDoc });
      }
    }
  }, [curForm]);

  return (
    <div className="bg-white  rounded-md shadow-2xl h-[40vh] w-[30vw] fixed bottom-5 right-5">
      {isFetching ? (
        <div className="h-fit w-full flex items-center justify-center py-20">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div
          className={`${
            curForm?.theme == "dark" && "dark"
          } w-[30vw] h-[40vh] overflow-y-auto p-5 rounded-md border`}
        >
          {curForm?.closed ? (
            <div
              className={`w-full  mx-auto  dark:bg-black/85 h-screen dark:text-white  p-10  overflow-y-scroll no-scrollbar`}
            >
              <div className="text-center relative top-1/2 -translate-y-1/2">
                <p className="text-3xl font-semibold text-yellow-400">
                  Sorry, submissions to this form is closed currently !
                </p>
                <p className="text-center mt-2 text-black/40">
                  Contact the creator if the form.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`w-full h-fit  mx-auto  dark:bg-black/85 dark:text-white   overflow-y-scroll bg-red-200 no-scrollbar`}
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
                  className="space-y-4 w-full"
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
                  {curForm?.form_json[currentPage]?.blocks?.map(
                    (el: any, index: number) => {
                      const error = errors[el.data.label];
                      const inputClass = `flex-1 focus:outline-none ${
                        error ? "border-red-500" : ""
                      }`;

                      switch (el.type) {
                        case "EmailInput":
                        case "textInput":
                        case "PhoneInput":
                        case "NumberInput":
                          return (
                            <div
                              key={index}
                              className="relative leading-7 text-md sm:truncate"
                            >
                              {/* {curForm?.theme && "Yes"} */}
                              <p className=" block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent">
                                {el?.data?.label}
                              </p>
                              <div
                                className={`flex border px-2 py-2 rounded-md flex-row items-center justify-start gap-2  dark:border-white/30`}
                                style={{
                                  borderColor: customTheme?.color,
                                }}
                              >
                                <input
                                  defaultValue={formData[el?.data?.label]}
                                  name={el?.data?.label}
                                  onChange={handleChange}
                                  required={el?.data?.required}
                                  type={el?.data?.type}
                                  disabled={false}
                                  className={`${inputClass}  bg-transparent dark:text-gray-300 placeholder:text-inherit placeholder:opacity-40`}
                                  placeholder={
                                    el?.data?.placeholder
                                      ? el?.data?.placeholder
                                      : "Enter placeholder text"
                                  }
                                />
                              </div>
                              {/* {error && <p className="text-red-500 mt-1">{error}</p>} */}
                              <div className="absolute cursor-pointer inset-y-0 right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 text-2xl opacity-80 text-red-500">
                                {el?.data?.required ? "*" : ""}
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
                              className="relative font-bold leading-7 text-md sm:truncate"
                            >
                              <p className="w-1/2 block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent">
                                {el?.data?.label}
                              </p>
                              <div className="flex w-1/2 border dark:border-white/30 px-2 py-2 rounded-md flex-row items-center justify-start gap-2">
                                <textarea
                                  name={el?.data?.label}
                                  defaultValue={formData[el?.data?.label]}
                                  onChange={handleChange}
                                  required={el?.data?.required}
                                  // defaultValue={el?.data?.placeholder}
                                  disabled={false}
                                  className={`${inputClass} dark:bg-transparent bg-transparent dark:text-gray-300 dark:border-white/30`}
                                  placeholder={el?.data?.placeholder}
                                />
                              </div>
                              {/* {error && <p className="text-red-500 mt-1">{error}</p>} */}
                              <div className="absolute cursor-pointer inset-y-0 right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 text-2xl opacity-80 text-red-500">
                                {el?.data?.required ? "*" : ""}
                              </div>
                            </div>
                          );
                        case "Heading":
                          return <h1 key={index}>{el?.data?.text}</h1>;
                        case "calendar":
                          return (
                            <div
                              key={index}
                              className="flex flex-col my-10 items-start justify-start gap-2"
                            >
                              <p className="w-full p-0 border-0 border-transparent ring-0 focus:ring-0 dark:bg-transparent dark:text-gray-300 bg-transparent">
                                {el?.data?.label}
                              </p>
                              <Input
                                onChange={handleChange}
                                type="date"
                                name={el?.data?.label}
                                disabled={false}
                                className="rounded-md border w-fit dark:bg-transparent bg-transparent dark:text-gray-300 dark:border-white/30"
                              />
                              {/* {error && <p className="text-red-500 mt-1">{error}</p>} */}
                            </div>
                          );
                        case "select":
                          return (
                            <div
                              key={index}
                              className="flex flex-col my-10 items-start justify-start gap-2"
                            >
                              <p className="w-full block p-0 border-0 border-transparent ring-0 focus:ring-0  dark:bg-transparent dark:text-gray-300 bg-transparent">
                                {el?.data?.label}
                              </p>
                              <Select>
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
                              {/* {error && <p className="text-red-500 mt-1">{error}</p>} */}
                            </div>
                          );
                        case "header":
                          return React.createElement(
                            `h${el?.data?.level}`,
                            { key: index, className: "font-bold mtimportant" },
                            el?.data?.text
                          );
                        case "checkbox":
                          return (
                            <div className="flex flex-row items-center justify-start gap-2">
                              <input
                                defaultValue={formData["checkbox"]}
                                type="checkbox"
                                name="checkbox"
                                onChange={handleChange}
                              />
                              <p>{el.data.label}</p>
                            </div>
                          );
                        case "rating":
                          return (
                            <div>
                              <p className="text-lg">{el?.data?.label}</p>
                              <div className="flex flex-row items-center justify-start gap-2">
                                {formData?.ratings ? (
                                  <>
                                    {Array.from({
                                      length: formData?.ratings,
                                    }).map((_, index) => (
                                      <TiStarFullOutline
                                        onClick={() => {
                                          setFormData((prev: any) => ({
                                            ...prev,
                                            ratings: index + 1,
                                          }));
                                        }}
                                        color="#eab308"
                                        size={35}
                                        className="text-yellow-500 cursor-pointer"
                                      />
                                    ))}
                                    {Array.from({
                                      length: 5 - formData?.ratings,
                                    }).map((_, index) => (
                                      <TiStarOutline
                                        className="cursor-pointer"
                                        onClick={() => {
                                          setFormData((prev: any) => ({
                                            ...prev,
                                            ratings:
                                              formData?.ratings + index + 1,
                                          }));
                                        }}
                                        size={35}
                                      />
                                    ))}
                                  </>
                                ) : (
                                  Array.from({ length: 5 }).map((_, index) => (
                                    <TiStarOutline
                                      className="cursor-pointer"
                                      onClick={() => {
                                        setFormData((prev: any) => ({
                                          ...prev,
                                          ratings: index + 1,
                                        }));
                                      }}
                                      size={35}
                                    />
                                  ))
                                )}
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
                              className="flex flex-col my-10 items-start justify-start gap-2"
                            >
                              <p className="w-full block p-0 focus:outline-none dark:bg-transparent dark:text-gray-300 bg-transparent">
                                {el?.data?.label}
                              </p>
                              <div className="flex flex-col gap-2">
                                {el?.data?.options?.map(
                                  (option: any, idx: number) => (
                                    <label
                                      key={idx}
                                      className={`flex cursor-pointer items-center font-semibold border gap-2 px-3 py-2 rounded-md ${
                                        formData[el?.data?.label] ==
                                          option?.label && "bg-green-400 "
                                      }`}
                                    >
                                      {/* <input
                                  type="radio"
                                  name={el?.data?.label}
                                  value={option.label}
                                  onChange={handleChange}
                                  disabled={false}
                                  className="form-radio dark:bg-transparent dark:border-white/30"
                                /> */}
                                      <span
                                        onClick={() => {
                                          setFormData({
                                            ...formData,
                                            [el?.data?.label]: option.label,
                                          });
                                        }}
                                        className="dark:text-gray-300"
                                      >
                                        {option.label}
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        case "scale":
                          return (
                            <div>
                              <p className="text-lg">{el?.data?.label}</p>
                              <div className="flex flex-row items-center justify-start gap-2">
                                {Array.from({ length: 10 }).map((_, index) => (
                                  <p
                                    onClick={() => {
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        scale: index + 1,
                                      }));
                                    }}
                                    className={`border rounded-md h-10 w-10 cursor-pointer flex items-center justify-center ${
                                      index + 1 == formData?.scale &&
                                      "bg-green-400"
                                    }`}
                                  >
                                    {index + 1}
                                  </p>
                                ))}
                              </div>
                            </div>
                          );
                        default:
                          return null;
                      }
                    }
                  )}
                  <div className="flex flex-row items-center justify-between gap-2 w-fit">
                    {currentPage > 0 && (
                      <Button
                        type="button"
                        disabled={false}
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
                        disabled={false}
                      >
                        Next -
                      </Button>
                    ) : (
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
                        disabled={false}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="text-center relative top-1/2 -translate-y-1/2">
                  <p className="text-3xl font-semibold text-green-600">
                    Form has been submitted!
                  </p>
                  <p className="text-center mt-2">
                    Thank you for your submission
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormRenderer;
