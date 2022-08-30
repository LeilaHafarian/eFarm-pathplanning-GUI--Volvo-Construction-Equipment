import { useEffect } from "react";
import "./snackbar.css";

export const Snackbar = ({ message, open, onClose }) => {
  useEffect(() => {
    if (open) {
      const x = document.getElementById("snackbar");
      x.className = "show";
      setTimeout(function () {
        x.className = x.className.replace("show", "");
        if (onClose) onClose();
      }, 5000);
    }
    // eslint-disable-next-line
  }, [open]);

  return <p id="snackbar">{message}</p>;
};
