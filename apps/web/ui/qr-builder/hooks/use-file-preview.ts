import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { EQRType } from "../constants/get-qr-config.ts";

const MAX_FILE_SIZES = {
  [EQRType.IMAGE]: 15 * 1024 * 1024, // 15MB
  [EQRType.VIDEO]: 300 * 1024 * 1024, // 300MB
  [EQRType.PDF]: 100 * 1024 * 1024, // 100MB
};

const validateFileSize = (file: File, qrType: string): boolean => {
  const maxSize = MAX_FILE_SIZES[qrType as keyof typeof MAX_FILE_SIZES];
  return file.size <= maxSize;
};

export const useFilePreview = (
  qrType: EQRType,
  files: File[],
  setFiles: Dispatch<SetStateAction<File[]>>,
  multiple: boolean,
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [acceptFileTypes, setAcceptFileTypes] = useState<string>("");
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const FILE_TYPE_MAP: Partial<Record<EQRType, string>> = {
      [EQRType.IMAGE]: "image/*",
      [EQRType.VIDEO]: "video/mp4",
      [EQRType.PDF]: "application/pdf",
    };

    setAcceptFileTypes(FILE_TYPE_MAP[qrType] || "");
  }, [qrType]);

  const processFiles = (selectedFiles: File[]) => {
    const filteredFiles = multiple
      ? selectedFiles.filter(
          (file) =>
            !files.some((existingFile) => existingFile.name === file.name),
        )
      : selectedFiles;

    const validFiles = filteredFiles.filter((file) =>
      validateFileSize(file, qrType),
    );

    if (validFiles.length < filteredFiles.length) {
      setErrorMessage(
        `The maximum size allowed is ${MAX_FILE_SIZES[qrType] / (1024 * 1024)}MB.`,
      );
    } else {
      setErrorMessage("");
    }

    if (multiple) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    } else {
      setFiles(validFiles);
    }

    const previews = new Array(validFiles.length);

    const processFile = (file: File, index: number): Promise<void> => {
      return new Promise((resolve) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            previews[index] = reader.result as string;
            resolve();
          };
          reader.readAsDataURL(file);
          return;
        }

        const fileTypeMap: Record<string, string> = {
          "video/": URL.createObjectURL(file),
          "application/pdf": "pdf-placeholder",
        };

        previews[index] =
          Object.entries(fileTypeMap).find(([key]) =>
            file.type.startsWith(key),
          )?.[1] || "Unexpected file type";

        resolve();
      });
    };

    Promise.all(validFiles.map((file, index) => processFile(file, index)))
      .then(() => {
        if (multiple) {
          setFilePreviews((prevPreviews) => [...prevPreviews, ...previews]);
        } else {
          setFilePreviews(previews);
        }
      })
      .catch((error) => {
        console.error("Error processing files:", error);
      });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;

    if (selected && selected.length > 0) {
      processFiles(Array.from(selected));
      event.target.value = "";
    }
  };

  const handleDeleteFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFilePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index),
    );

    if (fileInputRef.current) {
      const updatedFiles = fileInputRef.current.files;
      const newFileList = new DataTransfer();
      Array.from(updatedFiles as FileList).forEach((file, idx) => {
        if (idx !== index) {
          newFileList.items.add(file);
        }
      });
      fileInputRef.current.files = newFileList.files;
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();

    if (event.dataTransfer?.files) {
      processFiles(Array.from(event.dataTransfer.files));
    }
  };

  useEffect(() => {
    const dropzone = dropzoneRef.current;
    if (dropzone) {
      dropzone.addEventListener("dragover", handleDragOver as any);
      dropzone.addEventListener("drop", handleDrop as any);
    }

    return () => {
      if (dropzone) {
        dropzone.removeEventListener("dragover", handleDragOver as any);
        dropzone.removeEventListener("drop", handleDrop as any);
      }
    };
  }, []);

  return {
    fileInputRef,
    dropzoneRef,
    acceptFileTypes,
    filePreviews,
    handleFileChange,
    handleDeleteFile,
    handleUploadClick,
    errorMessage,
  };
};
