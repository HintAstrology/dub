export const getSaveButtonText = (
  isFileUploading: boolean,
  isFileProcessing: boolean,
  isSaving: boolean,
) => {
  if (isFileUploading) {
    return "Uploading...";
  }

  if (isFileProcessing) {
    return "Processing...";
  }

  if (isSaving) {
    return "Saving...";
  }

  return "Save Changes";
};
