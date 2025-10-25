"use client";
import { Loader2Icon } from "lucide-react";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Page = () => {
  const searchParams: any = useSearchParams();
  const code: any = searchParams.get("code");
  const form_id: any = searchParams.get("state");
  const old_access_token: any = searchParams.get("token");
  const session: any = useSession();
  const [isIntegrated, setIsIntegrated]: any = useState(false);
  const [isAuthenticated, setIsAuthenticated]: any = useState(false);
  const [data, setData]: any = useState(null);
  const [mapping, setMapping]: any = useState([]);
  const [isLoading, setIsLoading]: any = useState(false);
  const [isSubmitting, setIsSubmitting]: any = useState(false);
  const router = useRouter();

  const generateFormColumns = (form_json: any) => {
    const columnNames: any[] = [];
    form_json.forEach((block: any) => {
      if (block?.blocks) {
        block.blocks.forEach((item: any) => {
          if (item?.data?.label) {
            columnNames.push({ name: item.data.label, type: item.data.type });
          } else {
            columnNames.push({ name: item.type, type: item.data.type });
          }
          console.log(
            data?.form?.integrations?.notion?.database_mappings?.find(
              (maps: any) => Object.keys(maps)[0] == item.data.label
            )?.[item.data.label]
          );
        });
      }
    });
    return columnNames;
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      if (code && !data) {
        setIsLoading(true);
        try {
          if (!isLoading && !data) {
            const response = await fetch(
              "https://form-x-eight.vercel.app/api/integrations/notion",
              {
                method: "POST",
                body: JSON.stringify({
                  token: code,
                  email: session.data?.user?.email,
                  form_id: form_id,
                }),
              }
            );
            if (response.ok) {
              setIsIntegrated(true);
              const data: any = await response.json();
              console.log("1: this shit changed");
              setData({ ...data });
              console.log(data);
            } else {
              setIsIntegrated(false);
              const data: any = await response.json();
              console.log(data);
            }
          }
        } catch (error) {
          setIsIntegrated(false);
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      } else if (old_access_token) {
        try {
          if (!isLoading && !data) {
            const response = await fetch(
              "https://form-x-eight.vercel.app/api/integrations/notion",
              {
                method: "POST",
                body: JSON.stringify({
                  email: session.data?.user?.email,
                  form_id: form_id,
                  old_access_token,
                }),
              }
            );
            if (response.ok) {
              setIsIntegrated(true);
              alert("Integration successful");
              const thisdata: any = await response.json();
              console.log("2: this shit changed");
              setData({
                ...thisdata,
                database: thisdata?.form?.integrations?.notion?.database_id,
              });
              console.log(
                thisdata?.form?.integrations?.notion?.database_mappings
              );
              setMapping(
                thisdata?.form?.integrations?.notion?.database_mappings || []
              );
              console.log(data);
            } else {
              setIsIntegrated(false);
              const data: any = await response.json();
              console.log(data);
            }
          }
        } catch (error) {
          setIsIntegrated(false);
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsIntegrated(false);
        alert("Code does not exist");
      }
    };
    fetchData();
  }, [code, form_id, session.data?.user?.email, old_access_token]);

  const changeHandler = (e: any) => {
    console.log("3: this shit changed");
    setData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectDBchangeHandler = (e: any) => {
    console.log("4: this shit changed", e);
    if (e) {
      setData((prev: any) => ({
        ...prev,
        database: e,
        database_properties: prev?.databases.find((db: any) => db?.id == e)
          ?.properties,
      }));
    } else {
      setData((prev: any) => ({
        ...prev,
        database_properties: prev?.databases.find(
          (db: any) => db?.id == prev?.database
        )?.properties,
      }));
    }
  };

  const setFormToPropertyMapping = (key: string, value: string) => {
    if (key.length > 0 && value?.length > 0) {
      setMapping((prev: any) => {
        // Filter out entries that have the key or value
        const filtered = prev.filter(
          (maps: any) =>
            !Object.values(maps).includes(value) &&
            !Object.keys(maps).includes(key)
        );

        // Add the new entry
        return [...filtered, { [key]: value }];
      });
    }
  };

  useEffect(() => {
    console.log("5: this shit changed");
    console.log(Object.entries(mapping)?.map(([col, dbProp]) => dbProp));
    setData((prev: any) => ({
      ...prev,
      database_mappings: Object.entries(mapping)?.map(
        ([col, dbProp]) => dbProp
      ),
    }));
  }, [mapping]);

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault();
    // setIsSubmitting(true);
    console.log({
      email: session.data?.user?.email,
      name: data?.name || data?.form?.integrations?.notion?.name,
      database: data?.database,
      form_id: form_id,
      database_mappings: data?.database_mappings,
      database_properties: data?.database_properties,
    });
    try {
      const response = await fetch(
        "https://form-x-eight.vercel.app/api/integrations/save-notion-db",
        {
          method: "POST",
          body: JSON.stringify({
            email: session.data?.user?.email,
            name: data?.name || data?.form?.integrations?.notion?.name,
            database: data?.database,
            form_id: form_id,
            database_mappings: data?.database_mappings,
            database_properties: data?.database_properties,
          }),
        }
      );
      const resData = await response.json();
      if (response.ok) {
        alert("Database saved successfully");
        router.push("https://form-x-eight.vercel.app/dashboard");
      } else {
        console.log("Cannot save database");
        console.log(resData);
        alert("Error saving database");
      }
    } catch (error) {
      console.log(error);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const textRelatedTypes = [
    "rich_text",
    "title",
    "email",
    "url",
    "phone_number",
  ];

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {isLoading ? (
        <div className="flex mb-20 flex-col items-center justify-center gap-5">
          <Loader2Icon size={40} className="animate-spin" />
          <p className="text-3xl font-semibold">
            Hold on!, Integration in process
          </p>
        </div>
      ) : isIntegrated ? (
        <form
          onSubmit={submitHandler}
          className="p-10 w-1/2 h-3/4 bg-white rounded-2xl border shadow-xl flex flex-col gap-5 items-stretch center justify-center"
        >
          <div className="flex flex-col items-start justify-between gap-3">
            <p className="font-semibold w-full text-xl text-gray-700">
              Enter a notion connection name
              <span className="inline underline decoration-4 underline-offset-2 decoration-yellow-400"></span>
            </p>
            <Input
              onChange={changeHandler}
              required
              value={data?.name || data?.form?.integrations?.notion?.name}
              name="name"
              disabled={isSubmitting }
            />
          </div>
          <div className="flex flex-col items-start justify-between gap-3">
            <p className="font-semibold w-full text-xl text-gray-700">
              Select a database for the connection
              <span className="inline underline decoration-4 underline-offset-2 decoration-yellow-400"></span>
            </p>
            <Select
              onValueChange={selectDBchangeHandler}
              name="database"
              required
              disabled={
                isSubmitting ||
                (data?.form?.integrations?.notion?.database_id?.length > 0 &&
                  old_access_token)
              }
              value={
                data?.databases?.find(
                  (db: any) =>
                    db?.id == data?.form?.integrations?.notion?.database_id
                )?.id
              }
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select a database" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Database</SelectLabel>
                  {data?.databases?.map((db: any) => (
                    <SelectItem key={db?.id} value={db?.id}>
                      {db?.title[0]?.plain_text}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start justify-between gap-3">
            <p className="font-semibold w-full text-xl text-gray-700">
              Match form fields with properties from the selected Notion
              database
              <span className="inline underline decoration-4 underline-offset-2 decoration-yellow-400"></span>
            </p>
            {data?.form && (
              <div className="w-full flex flex-col items-start justify-start gap-3">
                {generateFormColumns(data?.form?.form_json)?.map(
                  (column: any) => (
                    <div
                      className="w-full flex flex-row items-center justify-start gap-2"
                      key={column.name}
                    >
                      <Input
                        onChange={changeHandler}
                        required
                        value={column.name}
                        name={column.name}
                        className="w-auto"
                        title={column.name}
                        disabled
                      />
                      <Select
                        onValueChange={(prop: any) =>
                          setFormToPropertyMapping(column.name, prop)
                        }
                        name="db_properties"
                        required
                        disabled={isSubmitting}
                        value={
                          mapping?.find((mapp: any) => {
                            console.log(Object.keys(mapp)[0], column?.name);
                            return Object.keys(mapp)[0] == column?.name;
                          })?.[column?.name]
                        }
                      >
                        <SelectTrigger className="placeholder:opacity-20 w-3/4">
                          <SelectValue
                            placeholder={
                              mapping?.find((mapp: any) => {
                                console.log(Object.keys(mapp)[0], column?.name);
                                return Object.keys(mapp)[0] == column?.name;
                              })?.[column?.name]?.length > 0
                                ? `Select a database property`
                                : Object.entries(
                                    data?.databases?.find((db: any) =>
                                      db.id == data?.database?.length > 0
                                        ? data?.database
                                        : data?.form?.integrations?.notion
                                            ?.database_id
                                    )?.properties || {}
                                  )?.filter(([prop, details]: any) =>
                                    textRelatedTypes?.includes(details.type)
                                  )?.length <
                                  generateFormColumns(data?.form?.form_json)
                                    ?.length
                                ? "⚠️ Not enough notion columns (create new columns in notion DB)"
                                : `Select a database property`
                            }
                            className="opacity-70 placeholder:opacity-20"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Properties</SelectLabel>
                            {Object.entries(
                              data?.databases?.find((db: any) =>
                                db.id == data?.database?.length > 0
                                  ? data?.database
                                  : data?.form?.integrations?.notion
                                      ?.database_id
                              )?.properties || {}
                            )
                              ?.filter(([prop, details]: any) =>
                                textRelatedTypes?.includes(details.type)
                              )
                              ?.map(([prop]: any) => (
                                <SelectItem key={prop} value={prop}>
                                  {prop}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      ) : (
        <>
          <Loader2Icon className="animate-spin" />
          <p className="text-5xl font-semibold">
            Adding Form flow to your notion
          </p>
        </>
      )}
    </div>
  );
};

export default Page;
