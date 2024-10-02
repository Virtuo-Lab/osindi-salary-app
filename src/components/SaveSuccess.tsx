import React, { useEffect } from "react";
import Swal from "sweetalert2";

const SaveSuccess: React.FC = () => {
  useEffect(() => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Your work has been saved",
      showConfirmButton: false,
      timer: 1500,
    });
  }, []);

  return null; // Since the SweetAlert is handled by useEffect, this component returns null
};

export default SaveSuccess;
