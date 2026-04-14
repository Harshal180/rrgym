import '@fortawesome/fontawesome-free/css/all.min.css';
import { ThemeProvider } from "@mui/material/styles";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "flowbite";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './fontawesome';
import "./index.css";
import Theme from './Theme';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={Theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);


