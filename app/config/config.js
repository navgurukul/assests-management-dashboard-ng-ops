export const onErrorHelper = (err) => {
  try {
    const errorData = err;

    if (errorData.errors) {
      const errorMessages = errorData.errors.map((e) => {
        return e.detail || e.info || e.message;
      });

      errorMessages.forEach((message) => {
        toast.error(message);
      });
    } else {
      const errorMessage =
        errorData?.detail || errorData?.info || errorData?.message;

      toast.error(errorMessage);
    }
  } catch (e) {
    // silent fail
  }
};