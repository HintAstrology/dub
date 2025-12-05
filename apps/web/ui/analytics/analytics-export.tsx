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
];

export default function AnalyticsExport() {
  const [openPopover, setOpenPopover] = useState(false);

  const { download } = useDownloadAnalyticsFiltered();

  const onDownloadClick = (fileType) => {
    download(fileType);
  };

  return (
    <div className="w-full">
      <Popover
        content={
          <div className="flex w-full flex-col p-2">
            {sortOptions.map(({ display, slug }) => (
              <Button
                key={slug}
                variant="ghost"
                className="w-max justify-start"
                onClick={() => {
                  onDownloadClick(slug);
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
        {/* <Button
          className="bg-gray-100 hover:bg-gray-200 text-gray-900 text-base font-medium transition-all shadow-none duration-200 border-0"
          size="lg"
          onClick={() => setOpenPopover(!openPopover)}
        >
          Export data
        </Button> */}
   
      </Popover>
    </div>
  );
}
