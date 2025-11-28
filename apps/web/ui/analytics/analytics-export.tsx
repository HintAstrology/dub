import { IconMenu, Popover } from "@dub/ui";
import { Download } from "lucide-react";
import { useState } from "react";
import { useDownloadAnalyticsFiltered } from "./utils";
import { Button } from "@dub/ui";

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
        <Button text='Export data' onClick={() => setOpenPopover(!openPopover)} />
      </Popover>
    </div>
  );
}
