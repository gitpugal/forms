"use client";
import React, { useEffect, useRef, useState } from "react";
import EditorJS, { API, EditorConfig } from "@editorjs/editorjs";
import { v4 as uuidv4 } from "uuid";
import TextInputTool from "./tools/input";
import RadioTool from "./tools/radio";
import LabelTool from "./tools/label";
import ButtonTool from "./tools/button";
import Header from "@editorjs/header";
import SimpleImage from "./tools/simpleimage.js";
import CalendarTool from "./tools/Calendar";
import SelectTool from "./tools/Select";
import EmailInput from "./tools/email";
import PhoneInput from "./tools/phone";
import NumberInput from "./tools/number";
import LongAnswerInput from "./tools/longAnswer";
import AttachesTool from "@editorjs/attaches";
import BannerTool from "./tools/TitleBanner";
import CheckBoxTool from "./tools/checkboxtool";
import NumberRatingBlock from "./tools/NumberRatingBlock";
import TimerTool from "./tools/Timepicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ColorPlugin from "@/components/Editorjs/color-plugin/index";
import QuestionTool from "./tools/question";
import Recaptcha from "./tools/recaptcha";
import ConditionalTool from "./tools/ConditionBlock";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import StarratingTool from "./tools/StarRatingblock";

// @ts-ignore
import List from "@editorjs/list";
import "./styles.css";
import { Button } from "../ui/button";
// @ts-ignore
import DragDrop from "editorjs-drag-drop";
// @ts-ignore
import Undo from "editorjs-undo";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import {
  EyeIcon,
  GripHorizontal,
  Moon,
  Settings2,
  Sun,
  TimerIcon,
  Trash2Icon,
} from "lucide-react";
import { useToast } from "../ui/use-toast";
import { Input } from "../ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fonts = [
  { Anton: "anton" },
  { "Archivo Black": "archivo" },
  { Cabin: "cabin" },
  { Caveat: "caveat" },
  { "DM Sans": "dmsans" },
  { "DM Serif Display": "dmserif" },
  { "Dancing Script": "dancing" },
  { Dosis: "dosis" },
  { Inter: "inter" },
  { Lato: "lato" },
  { Merriweather: "merriweather" },
  { Montserrat: "montserrat" },
  { "Open Sans": "opensans" },
  { Oswald: "oswald" },
  { Poppins: "poppins" },
  { "Roboto Slab": "robotoslab" },
  { Roboto: "roboto" },
  { Ubuntu: "ubuntu" },
];

interface Page {
  id: string;
  blocks: Array<{
    id?: string;
    type: string;
    data: {
      text: string;
    };
  }>;
}

interface EditorInstance {
  save: () => Promise<any>;
  destroy?: () => void;
}

import { Link } from "lucide-react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import FormRenderer from "../FormRender";
import { useRouter } from "next/navigation";

export type FormResponse = {
  id: string;
  name: string;
  email: string;
  callFirebase: any;
  message: string;
};

const Editor = ({
  form,
  json,
  cancelPreview,
  curform,
  workspace,
  callFirebase,
}: {
  form: any;
  json: any;
  cancelPreview: () => void;
  curform: any;
  workspace: any;
  callFirebase: any;
}) => {
  const session: any = useSession();
  const [pages, setPages] = useState<Page[]>([]);
  const pagesRef = useRef<any>(null);
  const editorInstancesRef = useRef<any>(null);
  const [theme, setTheme] = useState(form?.theme == "dark" ? true : false);
  const [curTheme, setCurTheme] = useState(form?.theme);
  const [customTheme, setCustomTheme]: any = useState(form?.customTheme);
  const [isPreviewing, setisPreviewing] = useState(false);
  const { toast } = useToast();
  const [currentWorkspace, setcurrentWorkspace]: any = useState(workspace);
  const [editorInstances, setEditorInstances] = useState<
    Record<string, EditorInstance>
  >({});
  const [isFetchingTemplates, setisFetchingTemplates] = useState(false);
  const [isPreviewDialogOpen, setisPreviewDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewForm, setPreviewForm] = useState(null);
  const router = useRouter();
  const [isAPIcopied, setisAPIcopied] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [templateData, setTemplateData] = useState<any>(
    form?.form_json ? form?.form_json : null
  );
  const [forms, setForms]: any = useState(null);
  const [templeForm, setTempleForm]: any = useState({
    curForm: null,
    open: false,
  });
  const logoRef: any = useRef(null);
  const bannerRef: any = useRef(null);

  const savebuttonref = useRef<HTMLButtonElement>(null);
  const [bannerUrl, setBannerUrl] = useState<string>(
    form?.bannerUrl ? form?.bannerUrl : ""
  );
  const [logoUrl, setLogoUrl] = useState<string>(
    form?.logoUrl ? form?.logoUrl : ""
  );
  const [bannerVisible, setBannerVisible] = useState(
    form?.bannerUrl ? true : false
  );
  const [isWorkspaceDialogOpen, setisWorkspaceDialogOpen] = useState(false);

  useEffect(() => {
    if (currentForm) {
      setcurrentForm((prev: any) => ({ ...prev, customTheme }));
    }
    if (customTheme != form?.customTheme) {
      setIsEdited(true);
    }
  }, [customTheme]);
  useEffect(() => {
    if (curform) {
      setcurrentForm(curform);
    }
  }, curform);

  useEffect(() => {
    if (workspace) {
      setcurrentWorkspace(workspace);
    }
  }, workspace);

  useEffect(() => {
    if (editorInstances) {
      editorInstancesRef.current = editorInstances;
    }
  }, [editorInstances]);

  const saveAutomatically = async () => {
    const template: any = [];
    Promise.all(
      pagesRef.current?.map((page: any) =>
        editorInstancesRef.current[page.id]?.save().then((outputData: any) => {
          return { pageId: page.id, outputData };
        })
      )
    ).then(async (results) => {
      results.forEach((result) => {
        if (result) {
          template.push(result.outputData);
        }
      });
    });
    console.log(template);
    if (savebuttonref && savebuttonref?.current && !curform?.published) {
      savebuttonref?.current?.click();
    }
  };

  useEffect(() => {
    if (form) {
      setTemplateData(form?.form_json ? form?.form_json : null);
      setBannerUrl(form?.bannerUrl ? form?.bannerUrl : "");
      setLogoUrl(form?.logoUrl ? form?.logoUrl : "");
      setBannerVisible(form?.bannerUrl ? true : false);
      setCustomTheme(form?.customTheme);
      setCurTheme(form?.theme);
      console.log(form);
    }
  }, [form]);

  useEffect(() => {
    console.log(form);
  }, []);

  // Step 2: Add the debounce utility function
  const debounceFunction = (func: Function, delay: number) => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    return (...args: any) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSave = debounceFunction(() => {
    saveAutomatically();
  }, 3000);

  // Step 3: Modify the createEditorInstance function
  const createEditorInstance = (pageId: string): EditorInstance => {
    if (!editorInstances[pageId]) {
      let editorInstance: EditorJS = new EditorJS({
        holder: `editor-${pageId}`,
        tools: {
          Color: {
            class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
            config: {
              colorCollections: [
                "#EC7878",
                "#9C27B0",
                "#673AB7",
                "#3F51B5",
                "#0070FF",
                "#03A9F4",
                "#00BCD4",
                "#4CAF50",
                "#8BC34A",
                "#CDDC39",
                "#FFF",
              ],
              defaultColor: "#FF1300",
              type: "text",
              customPicker: true, // add a button to allow selecting any colour
            },
          },
          Marker: {
            class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
            config: {
              defaultColor: "#FFBF00",
              type: "marker",
              icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`,
            },
          },
          textInput: TextInputTool,
          RadioTool,
          LabelTool,
          ButtonTool,
          // BannerImageTool,
          EmailInput,
          PhoneInput,
          NumberInput,
          LongAnswerInput,
          title: BannerTool,
          rating: StarratingTool,
          scale: NumberRatingBlock,
          timer: TimerTool,
          // condition: ConditionalTool,
          recaptcha: Recaptcha,
          question: QuestionTool,
          header: {
            class: Header,
            config: {
              placeholder: "Enter a header",
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 1,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          image: {
            //@ts-ignore
            class: SimpleImage,
            inlineToolbar: true,
          },
          calendar: CalendarTool,
          select: SelectTool,
          checkboc: CheckBoxTool,
          attaches: {
            class: AttachesTool,
            config: {
              uploader: {
                uploadByFile: async (file: any) => {
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
                  return {
                    success: 1,
                    file: {
                      url: data.secure_url, // Assuming response has secure_url property
                    },
                  };
                },
              },
            },
          },
        },
        data: { blocks: pages.find((page) => page.id == pageId)?.blocks || [] },
        autofocus: true,
        placeholder: "Let`s create an awesome form!",
        onReady: () => {
          try {
            new Undo({ editor: editorInstance });
            new DragDrop(editorInstance);
          } catch (error) {
            console.log(error);
          }
        },
        onChange: async (api: API, event: any) => {
          debouncedSave();
          console.log(event);
        
          if (Array.isArray(event)) {
            if (event?.find((eve: any) => eve?.type == "block-added")) {
              if (
                [
                  "textInput",
                  "EmailInput",
                  "PhoneInput",
                  "NumberInput",
                  "LongAnswerInput",
                  "select",
                ].includes(
                  event?.find((eve: any) => eve?.type == "block-added")?.detail
                    ?.target?.name
                )
              ) {
                let qId =
                  "question" +
                  event?.find((eve: any) => eve?.type == "block-added")?.detail
                    ?.target?.id +
                  Math.round(Math.random() * 1000);
                api.blocks.insert(
                  "question",
                  {},
                  {},
                  event?.find((eve: any) => eve?.type == "block-added")?.detail
                    ?.index,
                  true,
                  false,
                  qId
                );
                setTimeout(() => {
                  const qElement: any = document.querySelector(
                    `[data-id="${qId}"]`
                  );
                  if (qElement) {
                    if (qElement.querySelector("input")) {
                      qElement.querySelector("input")?.focus();
                      qElement.querySelector("input")?.click();
                    }
                  }
                }, 500);
              } else if (
                event?.find((eve: any) => eve?.type == "block-added")?.detail
                  ?.target?.name == "condition" &&
                event?.find((eve: any) => eve?.type == "block-added")?.detail
                  ?.index -
                  2 >=
                  0
              ) {
                const previosQuestionBlock = await api.blocks
                  .getBlockByIndex(
                    event?.find((eve: any) => eve?.type == "block-added")
                      ?.detail?.index - 2
                  )
                  ?.save();
                api.blocks.update(
                  event?.find((eve: any) => eve?.type == "block-added")?.detail
                    ?.target?.id,
                  previosQuestionBlock?.data || {}
                );
              }
              setIsEdited(true);
            } else if (
              event?.find((eve: any) => eve?.type == "block-changed") &&
              event?.find((eve: any) => eve?.type == "block-changed")?.detail
                .target.name == "question"
            ) {
              const conditionBlock = api.blocks.getBlockByIndex(
                event?.find((eve: any) => eve?.type == "block-changed")?.detail
                  ?.index + 2
              );
              console.log(conditionBlock);
              if (conditionBlock && conditionBlock?.name == "condition") {
                api.blocks.update(conditionBlock.id, {
                  state: { label: "updated" },
                });
              }
            } else {
              console.log(event);
              setIsEdited(true);
            }
          } else {
            if (event?.type == "block-added") {
              if (
                [
                  "textInput",
                  "EmailInput",
                  "PhoneInput",
                  "NumberInput",
                  "LongAnswerInput",
                  "select",
                ].includes(event?.detail?.target?.name)
              ) {
                let qId =
                  "question" +
                  event?.detail?.target?.id +
                  Math.round(Math.random() * 1000);
                api.blocks.insert(
                  "question",
                  {},
                  {},
                  event?.detail?.index,
                  true,
                  false,
                  qId
                );
                setTimeout(() => {
                  const qElement: any = document.querySelector(
                    `[data-id="${qId}"]`
                  );
                  if (qElement) {
                    if (qElement.querySelector("input")) {
                      qElement.querySelector("input")?.focus();
                      qElement.querySelector("input")?.click();
                    }
                  }
                }, 500);
              } else if (
                event?.detail?.target?.name == "condition" &&
                event?.detail?.index - 2 >= 0
              ) {
                const previosQuestionBlock = await api.blocks
                  .getBlockByIndex(event?.detail?.index - 2)
                  ?.save();
                api.blocks.update(
                  event?.target?.id,
                  previosQuestionBlock?.data || {}
                );
              }
              setIsEdited(true);
            } else if (
              event?.type == "block-changed" &&
              event?.detail.target.name == "question"
            ) {
              const data = await api.blocks
                .getById(event?.detail?.target?.id)
                ?.save();
              console.log(data);
              const conditionBlock = api.blocks.getBlockByIndex(
                event?.detail?.index + 2
              );
              console.log(conditionBlock);
              if (conditionBlock && conditionBlock?.name == "condition") {
                api.blocks.update(conditionBlock.id, data?.data || {});
              }
            } else {
              console.log(event);
              setIsEdited(true);
            }
          }
          setIsEdited(true);
        },
      });

      return editorInstance;
    }
    return editorInstances[pageId];
  };

  useEffect(() => {
    if (pages.length === 0) {
      // If pages are empty, load the template data if available
      if (templateData && templateData?.length > 0) {
        loadTemplates();
      } else {
        // Initialize with a default page if no template data is available
        addNewPage();
      }
    }
  }, []);

  useEffect(() => {
    // If pages are empty, load the template data if available
    if (templateData && templateData?.length > 0) {
      console.log("indis etome");
      loadTemplates();
    }
    console.log(templateData);
  }, [templateData]);

  useEffect(() => {
    const pageId = pages[currentPage]?.id;
    if (pageId && !editorInstances[pageId]) {
      if (
        !editorInstances[pageId] &&
        !pages.find((page) => page.id == pageId)
      ) {
        console.log(editorInstances[pageId]);
        const newInstance: any = createEditorInstance(pageId);
        setEditorInstances((prev) => ({ ...prev, [pageId]: newInstance }));
      }
    }
  }, [currentPage, pages]);

  useEffect(() => {
    pages.forEach((page) => {
      if (!editorInstances[page.id]) {
        const newInstance = createEditorInstance(page.id);
        setEditorInstances((prev) => ({ ...prev, [page.id]: newInstance }));
      }
    });
    pagesRef.current = pages;
  }, [pages]);

  const addNewPage = () => {
    const newId = uuidv4();
    const newPages = [
      ...pages,
      {
        id: newId,
        blocks: [],
      },
    ];
    setPages(newPages);
    setCurrentPage(newPages.length - 1);
  };

  const removePage = (id: string) => {
    if (pages?.length == 1) {
      toast({
        title: "There must be one page",
        description: "There must atleast on page in the form.",
        variant: "destructive",
        duration: 2000,
      });
    } else {
      const newPages = pages.filter((page) => page.id !== id);
      setPages(newPages);
      if (currentPage >= newPages.length) {
        setCurrentPage(newPages.length - 1);
      }
      setTimeout(() => {
        saveTemplates(false);
      }, 3000);
    }
  };

  const renderTemplates = async () => {
    const template: any = [];
    Promise.all(
      pages.map((page) =>
        editorInstancesRef.current[page.id]?.save().then((outputData: any) => {
          return { pageId: page.id, outputData };
        })
      )
    ).then(async (results) => {
      results.forEach((result) => {
        result?.outputData?.blocks?.forEach((block: any, index: number) => {
          if (
            index > 0 &&
            [
              "textInput",
              "EmailInput",
              "PhoneInput",
              "NumberInput",
              "LongAnswerInput",
              "select",
            ].includes(block?.type)
          ) {
            if (result?.outputData?.blocks[index - 1]?.type == "question") {
              block.data.label =
                result?.outputData?.blocks[index - 1]?.data?.text;
            } else {
              block.data.label = "";
            }
          }
        });
        console.log(result.outputData);
        template.push(result.outputData);
      });
      if (template?.length == 1 && template[0]?.blocks?.length == 0) {
        toast({
          title: "There must be atleast one block in the form to save it.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      template?.forEach((editor: any) => {
        editor?.blocks?.forEach((block: any) => {
          if (block?.type == "RadioTool") {
            if (
              block?.data?.label?.length <= 0 ||
              block?.data?.options?.length < 1
            ) {
              toast({
                title:
                  "Please fill the details fully in multiple choice block or remove the block if not needed.",
                variant: "destructive",
                duration: 5000,
              });
              return;
            }
          }
        });
      });
    });
    return template;
  };

  const saveTemplates = async (published: boolean) => {
    console.log(form);
    if (form && form?.form_id) {
      const template: any = [];
      Promise.all(
        pagesRef.current?.map((page: any) =>
          editorInstances[page.id]?.save().then((outputData) => {
            return { pageId: page.id, outputData };
          })
        )
      ).then(async (results) => {
        results.forEach((result) => {
          if (result?.outputData?.blocks?.length > 0) {
            result?.outputData?.blocks?.forEach((block: any, index: number) => {
              if (
                index > 0 &&
                [
                  "textInput",
                  "EmailInput",
                  "PhoneInput",
                  "NumberInput",
                  "LongAnswerInput",
                ].includes(block?.type)
              ) {
                if (result?.outputData?.blocks[index - 1]?.type == "question") {
                  block.data.label =
                    result?.outputData?.blocks[index - 1]?.data?.text;
                } else {
                  block.data.label = "";
                }
              }
            });
            console.log(result.outputData);
            template.push(result.outputData);
          }
        });
        if (
          template?.length == 1 &&
          template[0]?.blocks?.length == 0 &&
          curform?.published
        ) {
          toast({
            title: "There must be atleast one block in the form to save it.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        } else {
          template?.forEach((editor: any) => {
            editor?.blocks?.forEach((block: any) => {
              if (block?.type == "RadioTool") {
                if (
                  block?.data?.label?.length <= 0 ||
                  block?.data?.options?.length < 2
                ) {
                  toast({
                    title:
                      "Please fill the details fully in multiple choice block or remove the block if not needed.",
                    variant: "destructive",
                    duration: 5000,
                  });
                  return;
                }
              }
            });
          });
          try {
            const response = await fetch("https://form-x-eight.vercel.app/api/saveForm", {
              method: "POST",
              body: JSON.stringify({
                form_id: form?.form_id,
                json: template,
                bannerUrl,
                logoUrl,
                theme: curTheme,
                customTheme: customTheme,
                published: published,
              }),
            });
            if (response.ok) {
              setcurrentForm((prev: any) => ({ ...prev, form_json: template }));
              if (published) {
                toast({
                  title: "Sucess",
                  description: "Form changes saved successfully!",
                  duration: 5000,
                });
                setIsEdited(currentForm?.published ? false : true);
                setTemplateData(template);
                if (!currentForm?.published) {
                  setcurrentForm((prev: any) => ({ ...prev, published: true }));
                  localStorage?.setItem("formflowsettingstab", "response");
                  router.push(
                    `https://form-x-eight.vercel.app/form/${currentForm?.form_id}`
                  );
                } else {
                  localStorage?.setItem("formflowsettingstab", "settings");
                  router.push(
                    `https://form-x-eight.vercel.app/form/${currentForm?.form_id}`
                  );
                }
              }
            }
          } catch (error) {
            console.log("catch err: ", error);
            toast({
              title: "Error",
              description:
                "Uh oh, an error occured while saving the form, Try again.",
              variant: "destructive",
              duration: 5000,
            });
          }
        }
        if (published) {
          setisPreviewDialogOpen(false);
        }
      });
    }
  };

  const loadTemplates = () => {
    if (templateData && templateData?.length > 0) {
      const loadedPages = templateData?.map((data: any) => ({
        id: uuidv4(),
        blocks: data.blocks,
      }));
      setPages(loadedPages);
      setCurrentPage(0);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setImageUrl: (url: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "sys3hurw");
      formData.append("cloud_name", "dpgzkxcud");

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dpgzkxcud/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        setImageUrl(data.secure_url);
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while uploading the image.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  useEffect(() => {
    if (isEdited) {
      callFirebase("on");
    } else {
      callFirebase("off");
    }
  }, [isEdited]);

  useEffect(() => {
    // Fetch invitations received for the current user
    const fetchInvitations = async () => {
      setisFetchingTemplates(true);
      try {
        const response = await fetch(
          `/api/templates?user_id=${session.data?.user?.user_id}`
        );
        const data = await response.json();
        setForms(data?.templates);
      } catch (error) {
        setisFetchingTemplates(false);
        console.error("Error fetching invitations:", error);
      }
      setisFetchingTemplates(false);
    };
    if (session?.data) {
      if (!isFetchingTemplates && !forms) {
        fetchInvitations();
      }
    }
  }, [session]);

  useEffect(() => {
    loadTemplates();
  }, [templateData]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedPages = Array.from(pages);
    const [removed] = reorderedPages.splice(result.source.index, 1);
    reorderedPages.splice(result.destination.index, 0, removed);

    setPages(reorderedPages);
    setCurrentPage(result.destination.index);
  };
  useEffect(() => {
    const observer = new MutationObserver(() => {
      pages.forEach((page) => {
        const editorDiv = document.getElementById(`editor-${page.id}`);
        if (editorDiv) {
          const divs = editorDiv.querySelectorAll(".inputdiv");
          const inputs = editorDiv.querySelectorAll(".inputDivsinputs");
          inputs?.forEach((input: any) => {
            const cutomcolor = customTheme?.color;
            // Not working
            let placeholder = `placeholder:text-inherit`;
            input?.classList?.add(placeholder);

            // working
            input?.classList?.add(`placeholder:opacity-40`);
          });
          divs?.forEach((input: any) => {
            input.style.borderColor = customTheme?.color || "";
          });
        }
      });
    });

    pages.forEach((page) => {
      const editorDiv = document.getElementById(`editor-${page.id}`);
      if (editorDiv) {
        observer.observe(editorDiv, { childList: true, subtree: true });
      }
    });

    localStorage?.setItem(
      "formflowformpagescount",
      JSON.stringify({ pages: pages?.length })
    );

    const event: any = new Event("storage");
    event.key = "formflowformpagescount";
    event.newValue = pages?.length;
    window.dispatchEvent(event);
    return () => {
      observer.disconnect();
    };
  }, [pages]);
  const copyToClipBoard = (text: string) => {
    if (text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setTimeout(() => {
            setCopied(false);
            setisAPIcopied(false);
          }, 2000);
          toast({
            title: "link copied to clip board",
            duration: 2000,
          });
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };
  const [currentForm, setcurrentForm]: any = useState(curform);
  const formatTimeAgo = (updated_at: string) => {
    const now: any = new Date();
    const updatedDate: any = new Date(updated_at);
    const diffMs = now - updatedDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return updatedDate.toLocaleDateString();
    }
  };
  return (
    <div className="w-full relative flex-1 flex  flex-col bg-[#f4f4f5] h-full  overflow-y-auto overflow-x-hidden apple-scrollbar  md:custom-scrollbar  pt-5 p-0 border rounded-lg shadow-sm items-start justify-start gap-5">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <button
          className="fixed hidden"
          onClick={() => saveTemplates(false)}
          ref={savebuttonref}
        ></button>
        <div className="flex flex-col-reverse md:px-0 px-2 gap-3 md:flex-row  items-end md:w-[70%] w-full mx-auto md:items-center justify-between">
          <div className="flex   items-center justify-between gap-2">
            <Button
              className={`${
                isAPIcopied
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-white text-gray-500 hover:bg-slate-100"
              } border p-2 rounded-md cursor-pointer  `}
              disabled={
                (currentWorkspace && !currentForm?.api_enabled) ||
                !currentWorkspace?.collaborators?.find(
                  (collab: any) =>
                    collab.role == "admin" &&
                    collab?.users?.collaborator_id == session?.data?.user?.id
                )
              }
              onClick={() => {
                setisAPIcopied(true);
                copyToClipBoard(
                  `curl --location 'https://form-x-eight.vercel.app/api/addformresponse/${currentForm?.form_id}?api_key=${currentForm?.api_key}' \n
                  --header 'Content-Type: application/json' \n
                  --data-raw '{\n
                      "field-name": "field value",\n
                    }'`
                );
              }}
            >
              Curl code
              <Link className="inline ml-2" />
            </Button>
            {((curform &&
              !curform?.published &&
              (curform?.form_json?.length == 0 ||
                curform?.form_json[0]?.blocks?.length == 0) &&
              currentForm?.form_json?.length == 0) ||
              currentForm?.form_json[0]?.blocks?.length == 0) && (
              <Button
                className=""
                onClick={() => {
                  setisWorkspaceDialogOpen(true);
                }}
              >
                Use templates
              </Button>
            )}
          </div>
          <div className="flex  items-center justify-between gap-2">
            {curform && !curform?.published && (
              <Button className="bg-gray-200 text-gray-500" disabled={true}>
                draft
              </Button>
            )}
            <Link
              className={`${
                copied ? "bg-green-600 text-white" : "bg-white text-gray-500"
              } ${
                !currentForm?.published ? "opacity-40" : "cursor-pointer "
              } border p-2 rounded-md h-10 w-10 `}
              onClick={() => {
                if (currentForm?.published) {
                  setCopied(true);
                  copyToClipBoard(
                    `https://form-x-eight.vercel.app/forms/${currentForm?.form_id}`
                  );
                }
              }}
            />
            <Button
              disabled={
                !currentWorkspace?.collaborators?.find(
                  (collab: any) =>
                    collab.role == "admin" &&
                    collab?.users?.collaborator_id == session?.data?.user?.id
                ) ||
                (currentForm?.published
                  ? !isEdited
                  : Object.keys(currentForm?.form_json)?.length > 0
                  ? false
                  : true)
              }
              onClick={async () => {
                let formtemplate = await renderTemplates();

                let newForm = {
                  ...currentForm,
                  form_json: formtemplate,
                  theme: curTheme,
                  customTheme: customTheme,
                };
                setPreviewForm(newForm);
                setTimeout(() => {
                  setisPreviewDialogOpen(true);
                }, 500);
              }}
              className={`flex-1 bg-blue-500 hover:bg-blue-600 font-semibold ${
                !(
                  !currentWorkspace?.collaborators?.find(
                    (collab: any) =>
                      collab.role == "admin" &&
                      collab?.users?.collaborator_id == session?.data?.user?.id
                  ) ||
                  (currentForm?.published
                    ? !isEdited
                    : Object.keys(currentForm?.form_json)?.length > 0
                    ? false
                    : true)
                ) && "animate-pulse duration-[1.35s]"
              } hover:animate-none`}
            >
              Publish
            </Button>
            <Dialog
              open={isPreviewDialogOpen}
              onOpenChange={(e) => {
                setisPreviewDialogOpen(e);
                if (e == false) {
                  setPreviewForm(null);
                }
              }}
            >
              <DialogContent className="min-w-[95vw] h-[95vh] overflow-y-auto md:p-5 p-3">
                <DialogHeader>
                  <div className="flex flex-col md:flex-row py-5 items-start justify-between gap-5">
                    <div className="flex flex-col  items-start justify-start ">
                      <p className="font-semibold">Preview form and save</p>
                      <p className="text-xs">
                        This is a preview of the unpublished form
                      </p>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-3">
                      <Button
                        variant={"outline"}
                        onClick={() => setisPreviewDialogOpen(false)}
                        className=""
                      >
                        close preview
                      </Button>
                      <Button onClick={() => saveTemplates(true)}>
                        Publish form
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                <div className="w-full h-fit ">
                  {isPreviewDialogOpen && previewForm && (
                    <FormRenderer
                      preview={true}
                      formId={curform?.form_id}
                      form={previewForm}
                      cancelPreview={() => {}}
                      fullWidth={false}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div
          className={`w-full mx-auto relative md:w-[70%] ${
            theme ? "dark" : ""
          } ${curTheme == "custom" ? "custom" : ""}`}
        >
          {isPreviewing && (
            <div
              onClick={() => {
                setisPreviewing((prev) => !prev);
              }}
              className="w-full h-full bg-transparent z-50 absolute top-0 left-0"
            ></div>
          )}
          <div
            className={`w-full p-3 md:px-10 px-1 md:p-10 shadow-md dark:bg-black/85 ${
              curTheme === "custom" ? "" : "bg-white"
            }`}
            style={{
              backgroundColor:
                curTheme == "custom" && customTheme?.backgroundcolor
                  ? customTheme.backgroundcolor
                  : "",
              color: customTheme?.color ? customTheme?.color : "",
              fontFamily: customTheme?.fontfamily
                ? customTheme?.fontfamily
                : "",
            }}
          >
            {bannerVisible && (
              <div className=" w-full h-60   border-b dark:border-black relative  bg-transparent rounded-t-lg">
                {bannerUrl && (
                  <img
                    src={bannerUrl}
                    alt="Banner"
                    className="w-full  h-full object-cover shadow-none rounded-t-lg"
                  />
                )}
                {logoUrl && (
                  <div className="h-28 w-28 group overflow-hidden absolute rounded-full left-20 -bottom-14 shadow-xl border-4 border-white">
                    <div
                      onClick={() => {
                        setLogoUrl("");
                      }}
                      className="h-full  items-center justify-center w-full bg-red-500/50 rounded-full  group-hover:flex hidden cursor-pointer absolute top-0 left-0"
                    >
                      <Trash2Icon color="white" />
                    </div>
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className=" h-full w-full object-cover "
                    />
                  </div>
                )}

                <div className="rounded-lg font-sans absolute md:right-4 dark:text-white px-1 md:px-0 top-4 md:bottom-4 w-fit grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    className=" border border-white text-xs px-2"
                    onClick={() => {
                      if (bannerRef.current) {
                        bannerRef?.current.click();
                      }
                    }}
                  >
                    Change Banner
                  </Button>
                  <Button
                    className=" border border-white  text-xs px-2"
                    onClick={() => {
                      if (logoRef.current) {
                        logoRef?.current.click();
                      }
                    }}
                  >
                    Change Logo
                  </Button>
                  <Button
                    className="text-xs px-2 border border-white"
                    onClick={() => {
                      setBannerVisible(false);
                    }}
                    variant="outline"
                  >
                    Remove Banner
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        style={{
                          backgroundColor: customTheme?.button
                            ? customTheme?.button
                            : "",
                          color: customTheme?.buttonText
                            ? customTheme?.buttonText
                            : "",
                        }}
                        className="mx-2"
                      >
                        Design
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      id="hideOverlay"
                      className="h-screen overflow-y-scroll apple-scrollbar md:p-5 p-2"
                    >
                      <SheetHeader>
                        <SheetTitle>Edit theme</SheetTitle>
                        <SheetDescription>
                          Modify theme of the form
                        </SheetDescription>
                      </SheetHeader>
                      <div className="grid grid-cols-3 mt-10 gap-1 md:gap-3">
                        <div
                          onClick={() => {
                            setTheme(false);
                            setCurTheme("light");
                            setCustomTheme(null);
                          }}
                          className={`p-3 md:p-5 rounded-md border shadow-lg cursor-pointer flex justify-center flex-col items-center ${
                            curTheme == "light" &&
                            "border-blue-600  text-blue-600"
                          }`}
                        >
                          <Sun />
                          <p className="opacity-70">light</p>
                        </div>
                        <div
                          onClick={() => {
                            setTheme(true);
                            setCurTheme("dark");
                            setCustomTheme(null);
                          }}
                          className={`p-3 md:p-5 rounded-md border shadow-lg cursor-pointer flex justify-center flex-col items-center ${
                            curTheme == "dark" &&
                            "border-blue-600  text-blue-600"
                          }`}
                        >
                          <Moon />
                          <p className="">dark</p>
                        </div>
                        <div
                          onClick={() => {
                            setTheme(false);
                            setCurTheme("custom");
                            setCustomTheme((prev: any) => ({
                              ...prev,
                              backgroundcolor: "white",
                            }));
                          }}
                          className={`p-3 md:p-5 rounded-md border shadow-lg cursor-pointer flex justify-center flex-col items-center ${
                            curTheme == "custom" &&
                            "border-blue-600  text-blue-600"
                          }`}
                        >
                          <Settings2 />
                          <p className="opacity-70">custom</p>
                        </div>
                      </div>
                      {curTheme == "custom" && (
                        <div className="w-full font-sans flex flex-col items-start justify-start gap-3 md:p-5 mt-10">
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">Background</p>
                            <Input
                              type="color"
                              value={customTheme?.backgroundcolor}
                              onChange={(e) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  backgroundcolor: e.target.value,
                                }));
                              }}
                            />
                          </div>
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">Text color</p>
                            <Input
                              type="color"
                              value={customTheme?.color}
                              onChange={(e) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  color: e.target.value,
                                }));
                              }}
                            />
                          </div>
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">
                              Button Backgorund color
                            </p>
                            <Input
                              type="color"
                              value={customTheme?.button}
                              onChange={(e) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  button: e.target.value,
                                }));
                              }}
                            />
                          </div>
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">Button text color</p>
                            <Input
                              value={customTheme?.buttonText}
                              type="color"
                              onChange={(e) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  buttonText: e.target.value,
                                }));
                              }}
                            />
                          </div>
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">Font family</p>
                            <Select
                              onValueChange={(font: string) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  fontfamily: font,
                                }));
                              }}
                              value={customTheme?.fontfamily}
                            >
                              <SelectTrigger className="">
                                <SelectValue placeholder="Select a font" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Fonts</SelectLabel>
                                  {fonts.map((font: any, index: number) => {
                                    const fontName: string =
                                      Object.keys(font)[0];
                                    const fontValue = font[fontName];
                                    return (
                                      <SelectItem
                                        className="cursor-pointer hover:bg-black/5"
                                        style={{ fontFamily: fontValue }}
                                        key={index}
                                        value={fontValue}
                                      >
                                        {fontName}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      {/* <SheetFooter>
                    <SheetClose asChild>
                       <Button 
        style={{
                  backgroundColor: customTheme?.button ? customTheme?.button : "",
                }} type="submit">Save changes</Button>
                    </SheetClose>
                  </SheetFooter> */}
                    </SheetContent>
                  </Sheet>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={bannerRef}
                    onChange={(event) => handleFileUpload(event, setBannerUrl)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={logoRef}
                    onChange={(event) => handleFileUpload(event, setLogoUrl)}
                  />
                </div>
              </div>
            )}

            {/* Banner and logo div */}
            <div
              className={`w-full dark:bg-transparent ${
                curTheme == "custom" ? "bg-transparent" : "bg-white"
              } ${bannerVisible && "pt-20"}`}
            >
              {/* {bannerUrl && <img src={bannerUrl} alt="Banner" />}
        {logoUrl && <img src={logoUrl} alt="Logo" />} */}
              {!bannerVisible && (
                <div className="p-3 md:p-10 dark:bg-transparent font-sans bg-transparent">
                  <Button
                    style={{
                      backgroundColor: customTheme?.button
                        ? customTheme?.button
                        : "",
                      color: customTheme?.buttonText
                        ? customTheme?.buttonText
                        : "",
                    }}
                    onClick={() => setBannerVisible(true)}
                  >
                    Add banner
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        style={{
                          backgroundColor: customTheme?.button
                            ? customTheme?.button
                            : "",
                          color: customTheme?.buttonText
                            ? customTheme?.buttonText
                            : "",
                        }}
                        className="mx-2"
                      >
                        Design
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      id="hideOverlay"
                      className="h-screen overflow-y-scroll apple-scrollbar md:p-5 p-2"
                    >
                      <SheetHeader>
                        <SheetTitle>Edit theme</SheetTitle>
                        <SheetDescription>
                          Modify theme of the form
                        </SheetDescription>
                      </SheetHeader>
                      <div className="grid grid-cols-3 mt-10 gap-1 md:gap-3">
                        <div
                          onClick={() => {
                            setTheme(false);
                            setCurTheme("light");
                            setCustomTheme(null);
                          }}
                          className={`p-3 md:p-5 rounded-md border shadow-lg cursor-pointer flex justify-center flex-col items-center ${
                            curTheme == "light" &&
                            "border-blue-600  text-blue-600"
                          }`}
                        >
                          <Sun />
                          <p className="opacity-70">light</p>
                        </div>
                        <div
                          onClick={() => {
                            setTheme(true);
                            setCurTheme("dark");
                            setCustomTheme(null);
                          }}
                          className={`p-3 md:p-5 rounded-md border shadow-lg cursor-pointer flex justify-center flex-col items-center ${
                            curTheme == "dark" &&
                            "border-blue-600  text-blue-600"
                          }`}
                        >
                          <Moon />
                          <p className="">dark</p>
                        </div>
                        <div
                          onClick={() => {
                            setTheme(false);
                            setCurTheme("custom");
                            setCustomTheme((prev: any) => ({
                              ...prev,
                              backgroundcolor: "white",
                            }));
                          }}
                          className={`p-3 md:p-5 rounded-md border shadow-lg cursor-pointer flex justify-center flex-col items-center ${
                            curTheme == "custom" &&
                            "border-blue-600  text-blue-600"
                          }`}
                        >
                          <Settings2 />
                          <p className="opacity-70">custom</p>
                        </div>
                      </div>
                      {curTheme == "custom" && (
                        <div className="w-full font-sans flex flex-col items-start justify-start gap-3 md:p-5 mt-10">
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">Background</p>
                            <Input
                              type="color"
                              value={customTheme?.backgroundcolor}
                              onChange={(e) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  backgroundcolor: e.target.value,
                                }));
                              }}
                            />
                          </div>
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">Text color</p>
                            <Input
                              type="color"
                              value={customTheme?.color}
                              onChange={(e) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  color: e.target.value,
                                }));
                              }}
                            />
                          </div>
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">
                              Button Backgorund color
                            </p>
                            <Input
                              type="color"
                              value={customTheme?.button}
                              onChange={(e) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  button: e.target.value,
                                }));
                              }}
                            />
                          </div>
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">Button text color</p>
                            <Input
                              value={customTheme?.buttonText}
                              type="color"
                              onChange={(e) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  buttonText: e.target.value,
                                }));
                              }}
                            />
                          </div>
                          <div className="grid md:mb-0 md-2 grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                            <p className="opacity-70">Font family</p>
                            <Select
                              onValueChange={(font: string) => {
                                setCustomTheme((prev: any) => ({
                                  ...(prev ? prev : {}),
                                  fontfamily: font,
                                }));
                              }}
                              value={customTheme?.fontfamily}
                            >
                              <SelectTrigger className="">
                                <SelectValue placeholder="Select a font" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Fonts</SelectLabel>
                                  {fonts.map((font: any, index: number) => {
                                    const fontName: string =
                                      Object.keys(font)[0];
                                    const fontValue = font[fontName];
                                    return (
                                      <SelectItem
                                        className="cursor-pointer hover:bg-black/5"
                                        style={{ fontFamily: fontValue }}
                                        key={index}
                                        value={fontValue}
                                      >
                                        {fontName}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      {/* <SheetFooter>
                    <SheetClose asChild>
                       <Button 
        style={{
                  backgroundColor: customTheme?.button ? customTheme?.button : "",
                }} type="submit">Save changes</Button>
                    </SheetClose>
                  </SheetFooter> */}
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="pages">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {pages.map((page, index) => (
                        <Draggable
                          key={page.id}
                          draggableId={page.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`w-full ${theme && " dark "} mb-10`}
                            >
                              <div
                                className={`relative w-full flex  border-b dark:border-white/20 pb-10 flex-col items-start justify-start editorjs-container dark:bg-transparent bg-transparent`}
                              >
                                {/* <h4 className="mb-3 font-normal text-gray-400">
                        Page {index + 1}
                      </h4> */}
                                <div
                                  id={`editor-${page.id}`}
                                  className="editorjs dark:bg-transparent dark:text-white bg-transparent w-full "
                                ></div>
                                <Button
                                  style={{
                                    backgroundColor: customTheme?.button
                                      ? customTheme?.button
                                      : "",
                                    color: customTheme?.buttonText
                                      ? customTheme?.buttonText
                                      : "",
                                  }}
                                  contentEditable
                                  className={`mt-3 ml-7  dark:bg-white `}
                                >
                                  {pages.length > 0 && index < pages.length - 1
                                    ? "Next ->"
                                    : "Submit ->"}
                                </Button>
                                <div
                                  className="absolute z-50 top-0 right-2 font-sans flex items-center justify-center text-[10px] md:text-xs cursor-pointer rounded-md px-2 py-1 bg-red-500 text-white"
                                  onClick={() => {
                                    removePage(page.id);
                                  }}
                                >
                                  Remove page
                                </div>
                                <div
                                  className="drag-handle flex-col absolute bottom-5 left-0 w-full h-fit  text-gray-500 font-semibold flex items-center justify-center cursor-move"
                                  {...provided.dragHandleProps}
                                >
                                  <p className="font-light">
                                    {" "}
                                    Page {index + 1}
                                  </p>
                                  <GripHorizontal />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
          {!isPreviewing && (
            <div className="text-center my-5 mb-10 flex flex-row items-center justify-center gap-3">
              <Button onClick={addNewPage}>+ New Page</Button>
            </div>
          )}
        </div>
      </LocalizationProvider>

      <Dialog
        open={isWorkspaceDialogOpen}
        onOpenChange={(state: boolean) => {
          setisWorkspaceDialogOpen(state);
        }}
      >
        <DialogContent className="min-w-[95vw] h-[95vh] custom-scrollbar overflow-y-auto md:p-5 p-3">
          <DialogHeader>
            <div className="flex flex-col w-full mx-auto  py-5 items-start justify-between gap-5">
              <div className="flex flex-col   items-start justify-start ">
                <p className="font-semibold">Use Template</p>
                <p className="text-xs">select any of the template.</p>
              </div>
              {/* <div className="flex flex-row items-center justify-between gap-3">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setisWorkspaceDialogOpen(false);
                  }}
                  className=""
                >
                  close
                </Button>
                <Button
                  onClick={() => {
                    // useTemplate();
                  }}
                >
                  Use this template
                </Button>
              </div> */}
            </div>
          </DialogHeader>
          <div className="w-full h-fit grid grid-cols-2 gap-5">
            {forms && forms.length == 0 ? (
              <p className="font-light w-full text-center my-auto">
                No forms in the trash
              </p>
            ) : (
              forms?.map((workspace: any) => (
                <div
                  className="border w-full h-fit rounded-xl overflow-hidden relative md:rounded-2xl  bg-[#f5f5f5]  flex flex-col gap-5 items-start justify-between"
                  key={workspace.form_id}
                  onClick={(e: any) => {}}
                >
                  <div
                    onClick={() => {
                      setTempleForm({
                        open: true,
                        curForm: workspace,
                      });
                      console.log(workspace);
                    }}
                    className="w-full cursor-pointer h-[40vh] md:h-[50vh] md:rounded-none rounded-md overflow-hidden p-1 md:p-5"
                  >
                    <FormRenderer
                      preview={true}
                      formId={workspace?.form_id}
                      form={workspace}
                      cancelPreview={() => {}}
                      fullWidth={true}
                    />
                  </div>
                  <div className="w-full bg-[#f5f5f5]  h-[30%] z-50 p-2 md:p-5">
                    <div className="w-full h-fit xl relative cursor-pointer bg-[#f5f5f5]  flex flex-row gap-5 md:gap-2 items-start justify-between">
                      <div>
                        <p className="md:text-xl font-[500] text-[#0f0f0f]">
                          {workspace?.title}
                        </p>
                        <p className="text-xs md:text-sm  font-light text-[#636363]">
                          {workspace?.description}
                        </p>
                      </div>
                      <div
                        id="form-controls"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 flex flex-col items-end justify-between w-fit gap-4 ml-auto md:ml-0"
                      >
                        <div className="flex flex-row items-center justify-end gap-2">
                          <p className="text-xs font-light text-gray-400 text-right">
                            <TimerIcon className="inline ml-2 mb-1" size={15} />{" "}
                            last updated{" "}
                            {workspace?.updated_at &&
                              formatTimeAgo(workspace?.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTempleForm({
                          open: true,
                          curForm: workspace,
                        });
                        console.log(workspace);
                      }}
                      className="w-full  p-2 py-4  text-xs mt-3  md:text-sm  rounded-lg cursor-pointer h-auto text-center hover:bg-slate-50 bg-white"
                    >
                      <EyeIcon className="inline" size={13} /> view template
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={templeForm?.open}
        onOpenChange={(state: boolean) => {
          if (!state) {
            setTempleForm({
              curForm: null,
              open: false,
            });
          } else {
            setTempleForm((prev: any) => ({
              ...prev,
              open: prev,
            }));
          }
        }}
      >
        <DialogContent className="w-auto md:min-w-[95vw] h-[95vh] overflow-y-auto custom-scrollbar md:p-5 p-3">
          <DialogHeader>
            <div className="flex flex-col md:w-[70%] mx-auto md:flex-row py-5 items-start justify-between gap-5">
              <div className="flex flex-col   items-start justify-start ">
                <p className="font-semibold">Preview template</p>
                <p className="text-xs">Use this template.</p>
              </div>
              <div className="flex flex-row items-center justify-between gap-3">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setTempleForm({
                      curForm: null,
                      open: false,
                    });
                  }}
                  className=""
                >
                  close preview
                </Button>
                <Button
                  onClick={() => {
                    setTemplateData(templeForm?.curForm?.form_json);
                    setcurrentForm((prev: any) => ({
                      ...prev,
                      form_json: templeForm?.curForm?.form_json,
                      bannerUrl: templeForm?.curForm?.bannerUrl,
                      logoUrl: templeForm?.curForm?.logoUrl,
                      theme: templeForm?.curForm?.theme,
                      customTheme: templeForm?.curForm?.customTheme,
                    }));
                    setCustomTheme(templeForm?.curForm?.customTheme);
                    setCurTheme(templeForm?.curForm?.theme);
                    setBannerUrl(templeForm?.curForm?.bannerUrl);
                    setLogoUrl(templeForm?.curForm?.logoUrl);
                    setBannerVisible(
                      templeForm?.curForm?.bannerUrl ? true : false
                    );
                    setisWorkspaceDialogOpen(false);
                    setIsEdited(true);
                    setTempleForm({
                      curForm: null,
                      open: false,
                    });
                  }}
                >
                  Use template
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="w-full h-fit ">
            {/* {te && previewForm && ( */}
            <FormRenderer
              preview={true}
              formId={templeForm?.curForm?.form_id}
              form={templeForm?.curForm}
              cancelPreview={() => {}}
              fullWidth={false}
            />
            {/* )} */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Editor;
