import Checkbox from "./Checkbox";

export default {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label text for the checkbox",
    },
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked",
    },
    disabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
    onChange: {
      action: "changed",
      description: "Function called when checkbox state changes",
    },
    id: {
      control: "text",
      description: "ID for the input element (required for label association)",
    },
    name: {
      control: "text",
      description: "Name attribute for the checkbox",
    },
    className: {
      control: "text",
      description: "Additional CSS class names for the wrapper",
    },
  },
};

export const Default = {
  args: {
    id: "checkbox-default",
    label: "Default Checkbox",
    checked: false,
  },
};

export const Checked = {
  args: {
    id: "checkbox-checked",
    label: "Checked Checkbox",
    checked: true,
  },
};

export const Disabled = {
  args: {
    id: "checkbox-disabled",
    label: "Disabled Checkbox",
    disabled: true,
  },
};

export const CheckedDisabled = {
  args: {
    id: "checkbox-checked-disabled",
    label: "Checked and Disabled",
    checked: true,
    disabled: true,
  },
};

export const WithoutLabel = {
  args: {
    id: "checkbox-no-label",
    "aria-label": "Checkbox without visible label",
  },
};

export const WithCustomClassName = {
  args: {
    id: "checkbox-custom-class",
    label: "Custom Class Checkbox",
    className: "my-custom-checkbox",
  },
};

export const WithRequiredAttribute = {
  args: {
    id: "checkbox-required",
    label: "Required Checkbox",
    required: true,
  },
};
