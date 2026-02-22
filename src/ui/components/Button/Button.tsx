import { ButtonType, ButtonVariant } from "@/types";
import React, { FunctionComponent } from "react";

import $ from "./Button.module.css";

interface ButtonProps {
  onClick?: () => void;
  type?: ButtonType;
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
}) => {
  const variantClass = variant === "primary" ? $.primary : $.secondary;
  const className = `${$.button} ${variantClass}`;

  return (
    <button
      className={className}
      type={type}
      onClick={onClick}
    >
      {loading ? (
        <span
          className={$.spinner}
          data-testid="loading-spinner"
          aria-hidden
          aria-label="Loading"
        >
          ⟳
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
