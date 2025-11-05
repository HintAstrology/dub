import { IconMenu, Popover } from "@dub/ui";
import { cn } from "@dub/utils";
import { Download } from "lucide-react";
import { useState } from "react";
import { useDownloadAnalyticsFiltered } from "./utils";

export const sortOptions = [
    {
      display: "Download CSV",
      slug: "csv",
    },
    {
      display: "Download XLSX",
      slug: "xlsx",
    },
]

export default function AnalyticsExport() {
  const [openPopover, setOpenPopover] = useState(false);

  const { download } = useDownloadAnalyticsFiltered();

  const onDownloadClick = (fileType) => {
    download(fileType)
  }

  return (
    <div className="w-full min-[500px]:w-fit" >
      <Popover
        content={
          <div className="w-full p-2 md:w-40">
            {sortOptions.map(({ display, slug }) => (
              <button
                key={slug}
                onClick={() => {
                  onDownloadClick(slug)
                  setOpenPopover(false);
                }}
                className="hover:bg-border-100 active:bg-secondary-100 flex w-full items-center justify-between space-x-2 rounded-md px-1 py-2"
              >
                <IconMenu
                  text={display}
                  icon={<Download className="h-4 w-4" />}
                />
              </button>
            ))}
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      > 
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className={cn(
            "group flex h-10 cursor-pointer appearance-none items-center gap-x-2 truncate rounded-md border pl-3 pr-[18px] text-sm outline-none transition-all",
            "border-neutral-200/20 bg-white text-neutral-900 placeholder-neutral-400",
            "focus-visible:border-neutral-200/40 data-[state=open]:border-neutral-200/40 data-[state=open]:ring-4 data-[state=open]:ring-neutral-200/40",
          )}
        >
          Download data
        </button>
      </Popover>
    </div>
  );
}
