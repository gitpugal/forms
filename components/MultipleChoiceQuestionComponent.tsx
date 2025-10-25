/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Switch } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { PlusIcon } from "lucide-react";
import { default as React, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./ui/use-toast";

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

const DEFAULT_INITIAL_DATA = {
  label: "Select an option/options",
  help: "",
  required: false,
  multipleChoice: false,
  options: [
    {
      id: uuidv4(),
      label: "Edit Option 1",
    },
    {
      id: uuidv4(),
      label: "Edit Option 2",
    },
  ],
};

const SingleChoiceQuestion = (props: any) => {
  const [choiceData, setChoiceData] = React.useState(
    props.data.options.length > 0 ? props.data : DEFAULT_INITIAL_DATA
  );

  if (!(props?.data?.options?.length > 0)) {
    props.onDataChange(DEFAULT_INITIAL_DATA);
  }
  const optionRefs = useRef<any[]>([]);
  const labelRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (labelRef.current) {
      labelRef.current.style.height = "auto"; // Reset the height
      labelRef.current.style.height = labelRef.current.scrollHeight + "px"; // Set new height based on scroll height
    }
  }, [choiceData.label]);

  const updateData = (newData: any) => {
    setChoiceData(newData);
    if (props.onDataChange) {
      // Inform editorjs about data change
      props.onDataChange(newData);
    }
  };

  const onAddOption = () => {
    const newData = {
      ...choiceData,
    };

    newData.options.push({
      id: uuidv4(),
      label: "",
    });
    updateData(newData);
    setTimeout(() => {
      if (optionRefs.current.length > 0) {
        optionRefs.current[optionRefs.current.length - 1]?.focus();
      }
    }, 500);
  };

  const onDeleteOption = (optionIdx: any) => {
    const newData = {
      ...choiceData,
    };
    newData.options.splice(optionIdx, 1);
    updateData(newData);
  };

  const onInputChange = (fieldName: any) => {
    return (e: any) => {
      const newData = {
        ...choiceData,
      };
      newData[fieldName] = e.currentTarget.value;
      updateData(newData);
    };
  };

  const onOptionChange = (index: any, fieldName: any) => {
    return (e: any) => {
      const newData = {
        ...choiceData,
      };
      newData.options[index][fieldName] = e.currentTarget.value;
      updateData(newData);
    };
  };

  const onOptionKeyPress = (index: number) => (e: any) => {
    console.log(e.key, choiceData.options[index]);
    if (
      e.key == "Enter" &&
      choiceData.options[index].label != "" &&
      choiceData.options[index].label
    ) {
      onAddOption();
    } else if (e.key == "Enter" && choiceData.options[index].label == "") {
      toast({
        title: "Options cannot be empty",
        description: "Please fill this option to add another one.",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  return (
    <form autoComplete="off" className="pb-5">
      <div className="relative  leading-7 text-gray-800 text-md sm:truncate">
        <textarea
          id="label"
          ref={labelRef}
          defaultValue={choiceData.label}
          onBlur={onInputChange("label")}
          rows={1}
          onChange={(e) => {
            const newData = { ...choiceData, label: e.target.value };
            updateData(newData);
          }}
          className="w-full h-auto p-0 border-0 border-transparent ring-0 focus:ring-0 placeholder:text-gray-300 dark:bg-transparent dark:text-gray-300 bg-transparent"
          placeholder="Your Question"
          style={{ overflow: "hidden", resize: "none" }} // Prevent scrollbars and disable manual resizing
        />
      </div>
      <div className="max-w-sm mt-2 space-y-2">
        {choiceData.options.map((option: any, optionIdx: number) => (
          <div
            key={option.id}
            className={classNames("relative flex items-start")}
          >
            <span className="flex items-center text-sm">
              <input
                type="text"
                defaultValue={option.label}
                onChange={onOptionChange(optionIdx, "label")}
                onKeyDown={onOptionKeyPress(optionIdx)}
                ref={(el: any) => (optionRefs.current[optionIdx] = el)}
                className="px-3 py-2 rounded-3xl border ml-3  dark:bg-transparent  dark:text-gray-300 bg-transparent outline-none focus:ring-0 focus:outline-none placeholder:text-gray-300"
                placeholder={`Option ${optionIdx + 1}`}
              />
            </span>
            <div className="flex flex-row absolute p-1 right-3 w-fit items-center justify-between gap-2">
              {choiceData?.options?.length - 1 == optionIdx && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      choiceData.options[optionIdx].label != "" &&
                      choiceData.options[optionIdx].label
                    ) {
                      onAddOption();
                    } else if (choiceData.options[optionIdx].label == "") {
                      toast({
                        title: "Options cannot be empty",
                        description:
                          "Please fill this option to add another one.",
                        duration: 3000,
                        variant: "destructive",
                      });
                      return;
                    }
                  }}
                  className=""
                >
                  <PlusIcon className="w-4 h-4 dark:bg-transparent dark:text-gray-300 bg-transparent" />
                </button>
              )}
              {optionIdx != 0 && optionIdx != 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteOption(optionIdx)}
                  className=""
                >
                  <TrashIcon className="w-4 h-4 dark:bg-transparent dark:text-gray-300 bg-transparent" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <input
        type="text"
        id="help-text"
        defaultValue={choiceData.help}
        onBlur={onInputChange("help")}
        className="block w-full max-w-sm p-0 mt-2 text-sm font-light dark:bg-transparent dark:text-gray-500 bg-transparent border-0 border-transparent ring-0 focus:ring-0 placeholder:text-gray-300"
        placeholder="optional help text"
      />
      <div className="relative z-0 flex mt-2 divide-x divide-gray-200">
        <Switch.Group as="div" className="flex items-center pl-3">
          <Switch
            checked={choiceData.multipleChoice}
            onChange={() => {
              const newData = {
                ...choiceData,
              };
              newData.multipleChoice = !newData.multipleChoice;
              updateData(newData);
            }}
            className={classNames(
              choiceData.multipleChoice ? "bg-red-600" : "bg-gray-200",
              "relative inline-flex flex-shrink-0 h-4 w-7 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            )}
          >
            <span
              aria-hidden="true"
              className={classNames(
                choiceData.multipleChoice ? "translate-x-3" : "translate-x-0",
                "pointer-events-none inline-block h-3 w-3 rounded-full dark:bg-transparent dark:text-gray-300 bg-transparent shadow transform ring-0 transition ease-in-out duration-200"
              )}
            />
          </Switch>
          <Switch.Label as="span" className="ml-3">
            <span className="text-sm font-medium dark:bg-transparent dark:text-gray-700 bg-transparent">
              Multiple Selection{" "}
            </span>
          </Switch.Label>
        </Switch.Group>
      </div>
    </form>
  );
};

export default SingleChoiceQuestion;
