"use client";
import React, { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebaseconfig";
import { setdata } from "@/app/services/FirebaseServices";
import Link from "next/link";

const Editor = dynamic(() => import("@/components/Editorjs/Editor"), {
  ssr: false,
});
export type FormResponse = {
  id: string;
  name: string;
  email: string;
  message: string;
};

const Page = ({ params }: { params: { id: string } }) => {
  const generateFormResponseColumns = (
    formResponses: FormResponse[]
  ): ColumnDef<FormResponse>[] => {
    console.log(formResponses);
    // Initialize an empty array to store unique field names
    const uniqueFields: string[] = [];

    // Iterate through form responses to extract unique field names
    formResponses?.forEach((response: any) => {
      Object.keys(response.responses).forEach((field) => {
        // Check if the field is not already in the uniqueFields array
        if (!uniqueFields.includes(field)) {
          uniqueFields.push(field);
        }
      });
    });

    // Generate columns based on unique field names
    const columns: ColumnDef<FormResponse>[] = uniqueFields.map((field) => ({
      accessorKey: `responses.${field}`,
      header: field.charAt(0).toUpperCase() + field.slice(1), // Capitalize the field name
    }));

    return columns;
  };
  // State for storing form response data
  const session: any = useSession();
  const router = useRouter();
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);

  const [isPreviewing, setisPreviewing] = useState(false);
  const [currentWorkspace, setcurrentWorkspace]: any = useState(null);
  const [curFormFieldLen, setcurFormFieldLen] = useState(0);

  useEffect(() => {
    if (formResponses) {
      const formResponseColumns = generateFormResponseColumns(formResponses);
      setColumns(formResponseColumns);
    }
  }, [formResponses]);

  const [currentForm, setcurrentForm]: any = useState(null);
  const [columns, setColumns]: any = useState(null);
  const [fetching, setFetching] = useState(false);
  const [settingsData, setSettingsData]: any = useState({});
  const [isCollborating, setIsCollaborating]: any = useState(null);
  const usersRef = useRef<any[]>(isCollborating?.users);
  const sessionRef = useRef<any>(session?.status);

  const [called, setCalled] = useState(false);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    console.log(settingsData);
    console.log(currentForm);
  }, [settingsData]);

  const fetchInitData = async () => {
    try {
      setFetching(true);
      const response = await fetch(
        `https://form-x-eight.vercel.app/api/form/${params?.id}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      if (response.ok) {
        if (
          session?.data?.user &&
          !data?.form?.workspaces?.collaborators?.find(
            (collabs: any) => collabs?.user_id == session?.data?.user?.user_id
          )
        ) {
          router.push("/dashboard");
        }
        setcurrentWorkspace(data?.form?.workspaces);
        setcurrentForm(data?.form);
        setSettingsData(data?.form);
        let cnt = 0;
        data?.form?.form_json?.forEach((page: any) => {
          cnt += page?.blocks?.length;
        });
        setcurFormFieldLen(cnt);
        setFetching(false);
      } else {
        setFetching(false);
      }
      setFetching(false);
    } catch (error) {
      setFetching(false);
    }
  };

  useEffect(() => {
    usersRef.current = isCollborating?.users;
  }, [isCollborating, isCollborating?.users]);

  useEffect(() => {
    const headerRef = ref(database, `form/${params.id}`);
    console.log(headerRef);

    const unsubscribe = onValue(headerRef, (snapshot) => {
      const data = snapshot.val();
      setIsCollaborating(data);
    });

    const handleStorageChange = (event: any) => {
      if (event.key == "formflowcurrenorganisation") {
        router.replace("/dashboard");
      }
    };
    const removeuser = () => {
      let useremail = localStorage?.getItem("formflowuseremail");
      setdata(params.id, "off", useremail);
      unsubscribe();
    };

    const debounce = (func: any, delay: any) => {
      let timer: any;
      return (...args: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
      };
    };

    const removeUserOnMouseMove = debounce(() => {
      const email = localStorage?.getItem("formflowuseremail");
      if (
        !usersRef.current?.includes(email) ||
        usersRef?.current == null ||
        !usersRef?.current
      ) {
        setdata(params.id, "on", email);
      } else {
        console.log(
          email,
          !usersRef.current?.includes(email),
          usersRef?.current == null,
          !usersRef?.current
        );
      }
    }, 3000);

    window.addEventListener("storage", handleStorageChange);
    // window.addEventListener("mousemove", removeUserOnMouseMove);
    // window.addEventListener("beforeunload", removeuser, { capture: true });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      // window.removeEventListener("mousemove", removeUserOnMouseMove);
      // window.removeEventListener("beforeunload", removeuser, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (session && session?.status == "authenticated" && !called) {
      // setdata(params.id, "on", session?.data?.user?.email);
      localStorage?.setItem("formflowuseremail", session?.data?.user?.email);
      setCalled(true);
    }
  }, [session]);

  useEffect(() => {
    if (
      !fetching &&
      session?.status == "authenticated" &&
      (!currentForm || !formResponses)
    ) {
      if (!fetching) {
        fetchInitData();
      }
    }
  }, [session, session?.status]);

  return (
    <div className="w-full overflow-x-hidden h-full pb-5 flex flex-col items-start justify-start pt-5 md:py-10 py-5 pl-2 pr-1 md:p-10 md:pt-7">
      <div className="w-full pb-5 border-b flex md:flex-row flex-col md:items-center mb-5 gap-2 md:gap-0 justify-between">
        {currentForm ? (
          <Link href={`https://form-x-eight.vercel.app/form/${params.id}`}>
            <p className="font-[500] hover:underline underline-offset-1 text-left text-xl text-[#0f0f0f]">
              {currentForm?.title}
              <span className="block text-sm opacity-60 hover:no-underline hover:underline-offset-0 font-light">
                {currentForm?.description}
              </span>
            </p>
          </Link>
        ) : (
          <div>
            <Skeleton className="font-semibold mb-2 text-left text-xl text-transparent">
              Workspace name is long
            </Skeleton>
            <Skeleton className="block w-fit text-sm text-transparent font-normal">
              Workspace description
            </Skeleton>
          </div>
        )}
        {/* {isCollborating?.users?.filter(
          (user: any) => user != session?.data?.user?.email
        )?.length > 0 && (
          <div className="relative flex items-center">
            {isCollborating?.users
              ?.filter((user: any) => user != session?.data?.user?.email)
              ?.map((user: any, index: number) => (
                <div
                  key={index}
                  className="relative group w-12 h-12 rounded-full flex items-center cursor-pointer justify-center border bg-slate-700 text-white"
                  style={{ marginLeft: index > 0 ? "-1rem" : "0" }}
                >
                  <p className="text-center">
                    {user?.slice(0, 1)?.toUpperCase()}
                    {user?.slice(1, 2)}
                  </p>
                  <div className="absolute z-50 right-0 transform  bottom-full p-2 text-xs bg-gray-600 text-white rounded-lg rounded-br-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {user}
                  </div>
                </div>
              ))}
          </div>
        )} */}
      </div>
      {currentWorkspace &&
        !currentWorkspace?.collaborators?.find(
          (collab: any) =>
            collab.role == "admin" &&
            collab?.users?.collaborator_id == session?.data?.user?.id
        ) && (
          <div className="flex flex-row mb-2 items-center justify-start gap-3 w-fit ">
            <span className="w-6 h-6 p-1 rounded-full font-bold flex items-center justify-center text-white bg-orange-600">
              i
            </span>
            <p className="text-orange-500 font-semibold text-sm">
              {" "}
              You must be an admin to edit this form.
            </p>
          </div>
        )}

      <Editor
        form={currentForm}
        json={currentForm?.form_json}
        cancelPreview={() => setisPreviewing((prev) => !prev)}
        workspace={currentWorkspace}
        curform={currentForm}
        callFirebase={(state: string) => {
          // setdata(params.id, state);
        }}
      />
    </div>
  );
};

export default Page;
