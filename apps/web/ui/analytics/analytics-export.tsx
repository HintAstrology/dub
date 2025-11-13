import { Button } from "@/components/ui/button";
import { Popover } from "@dub/ui";
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
    <div className="w-full" >
      <Popover
        content={
          <div className="w-full p-2 flex flex-col">
            {sortOptions.map(({ display, slug }) => (
              <Button
                key={slug}
                variant="ghost"
                className="w-max justify-start"
                onClick={() => {
                  onDownloadClick(slug)
                  setOpenPopover(false);
                }}
              >
                <Download className="h-4 w-4" />
                {display}
              </Button>
            ))}
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <Button
          variant="default"
          size="default"
          className="bg-secondary hover:bg-secondary/90"
          onClick={() => setOpenPopover(!openPopover)}
        >
          Download data
        </Button>
      </Popover>
    </div>
  );
}
