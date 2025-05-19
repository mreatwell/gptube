import Input from "./Input";

export default {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "tel", "url"],
      description: "Input type attribute",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the input",
    },
    value: {
      control: "text",
      description: "Current value of the input",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    onChange: {
      action: "changed",
      description: "Function called when input value changes",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
};

export const Text = {
  args: {
    type: "text",
    placeholder: "Enter text here",
  },
};

export const Email = {
  args: {
    type: "email",
    placeholder: "Enter email address",
  },
};

export const Password = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};

export const Number = {
  args: {
    type: "number",
    placeholder: "Enter a number",
  },
};

export const WithValue = {
  args: {
    type: "text",
    value: "Prefilled value",
    placeholder: "Enter text here",
  },
};

export const Disabled = {
  args: {
    type: "text",
    placeholder: "This input is disabled",
    disabled: true,
  },
};

export const WithRequired = {
  args: {
    type: "text",
    placeholder: "Required field",
    required: true,
  },
};

export const WithAriaLabel = {
  args: {
    type: "text",
    placeholder: "Search",
    "aria-label": "Search input field",
  },
};
