import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "./theme-provider";

function ToastConfig() {
  const { theme } = useTheme();

  return (
    <ToastContainer
      position={"top-center"}
      autoClose={2000}
      hideProgressBar={false}
      limit={3}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === "dark" ? "dark" : "colored"}
    />
  );
}

export default ToastConfig;
