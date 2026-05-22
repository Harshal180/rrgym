// src/hooks/useAlert.js
import { useState } from "react";

const useAlert = () => {
  const [alert, setAlert] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const showAlert = (type, title, message) =>
    setAlert({ open: true, type, title, message });

  const closeAlert = () =>
    setAlert((prev) => ({ ...prev, open: false }));

  return { alert, showAlert, closeAlert };
};

export default useAlert;
