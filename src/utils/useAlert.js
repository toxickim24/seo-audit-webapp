import Swal from "sweetalert2";

export const useAlert = () => {
  // ✅ Success alert
  const success = (message = "Action completed successfully!") => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: message,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // ⚠️ Error alert
  const error = (message = "Something went wrong!") => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonColor: "#1a273b",
    });
  };

  // ❓ Confirmation dialog
  const confirm = async (message = "Are you sure?") => {
    const result = await Swal.fire({
      title: "Confirm",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1a273b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });
    return result.isConfirmed;
  };

  return { success, error, confirm };
};
