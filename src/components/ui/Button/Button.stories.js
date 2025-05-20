import Button from "./Button";

export default {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "text", "icon"],
      description: "The visual style of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    onClick: {
      action: "clicked",
      description: "Function called when the button is clicked",
    },
    children: {
      control: "text",
      description: "Button content",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
  },
};

// Default button
export const Primary = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Text = {
  args: {
    variant: "text",
    children: "Text Button",
  },
};

export const Icon = {
  args: {
    variant: "icon",
    children: "🔍",
    "aria-label": "Search",
  },
};

export const Disabled = {
  args: {
    variant: "primary",
    children: "Disabled Button",
    disabled: true,
  },
};

export const WithCustomClass = {
  args: {
    variant: "primary",
    children: "Custom Class Button",
    className: "my-custom-class",
  },
};

export const WithAriaLabel = {
  args: {
    variant: "primary",
    children: "Accessible Button",
    "aria-label": "This is an accessible button",
  },
};
