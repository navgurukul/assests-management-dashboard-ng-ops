import { toast } from "react-hot-toast";

export const onErrorHelper = (err) => {
  if (!err) return;

  try {
    // Handle array of errors
    if (err.errors?.length) {
      err.errors.forEach((error) => {
        const message = error.detail || error.info || error.message || "An error occurred";
        toast.error(message);
      });
      return;
    }

    // Handle single error
    const message = err.detail || err.info || err.message || "An unexpected error occurred";
    toast.error(message);
  } catch (error) {
    // Fallback for any unexpected error structure
    toast.error("An unexpected error occurred");
  }
};