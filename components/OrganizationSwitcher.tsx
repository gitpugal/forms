"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function Organizationswitcher({
  organizations,
  changeOrganization,
  defaultorgId,
}: any) {
  const [selectedorganization, setSelectedorganization] =
    React.useState<string>(
      defaultorgId
        ? defaultorgId
        : organizations && organizations?.length > 0
        ? organizations[0]?.organization_id
        : null
    );

  React.useEffect(() => {
    console.log(defaultorgId, selectedorganization);
    if (defaultorgId && defaultorgId != selectedorganization) {
      setSelectedorganization(defaultorgId);
    }
  }, [defaultorgId]);

  return (
    <Select
      defaultValue={selectedorganization}
      value={selectedorganization}
      onValueChange={(e: any) => {
        setSelectedorganization(e);
        changeOrganization(e);
      }}
    >
      <SelectTrigger
        className={cn(
          "flex focus:ring-white pl-3  w-fit border-none p-0 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0"
        )}
        aria-label="Select organization"
      >
        <SelectValue
          placeholder="Select an organization"
          className="text-[#888888] py-2 font-semibold focus:outline-none"
        >
          <span className="bg-[#d0d0d0] rounded-full text-white h-7 w-7 flex py-2 font-semibold cursor-pointer items-center justify-center text-sm">
            {organizations
              ?.find(
                (organization: any) =>
                  organization?.organization_id == selectedorganization
              )
              ?.admin?.first_name?.slice(0, 1)
              .toUpperCase()}
          </span>
          <p className="text-sm text-[#616161]  pl-2 w-auto">
            {
              organizations?.find(
                (organization: any) =>
                  organization?.organization_id == selectedorganization
              )?.admin?.first_name
            }
          </p>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {organizations?.map((organization: any) => (
          <SelectItem
            key={organization.name}
            value={organization.organization_id}
          >
            <div className="flex items-center justify-start gap-3 flex-1">
              <span className="bg-[#d0d0d0] rounded-full text-white h-7 w-7 flex p-0 font-light cursor-pointer items-center justify-center text-sm">
                {organization?.admin?.first_name?.slice(0, 1).toUpperCase()}
              </span>
              <p className="text-sm text-[#616161] font-light w-auto">
                {organization?.admin?.first_name}
              </p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
