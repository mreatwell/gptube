import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Input from "../../../../src/components/ui/Input/Input";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Input Component", () => {
  test("renders correctly with default props", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).not.toBeDisabled();
    expect(input).toHaveClass("form-input");
  });

  test("renders with different input types", () => {
    render(<Input type="password" placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");

    expect(input).toHaveAttribute("type", "password");
  });

  test("renders as disabled when disabled prop is true", () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText("Disabled input");

    expect(input).toBeDisabled();
  });

  test("updates value when changed", () => {
    const handleChange = jest.fn();
    render(<Input value="initial" onChange={handleChange} />);
    const input = screen.getByDisplayValue("initial");

    fireEvent.change(input, { target: { value: "new value" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("applies custom className", () => {
    render(<Input className="custom-class" placeholder="Custom class input" />);
    const input = screen.getByPlaceholderText("Custom class input");

    expect(input).toHaveClass("custom-class");
  });

  test("passes additional props to input element", () => {
    render(
      <Input
        data-testid="test-input"
        aria-label="Test Input"
        placeholder="Test props"
        required
      />
    );
    const input = screen.getByTestId("test-input");

    expect(input).toHaveAttribute("aria-label", "Test Input");
    expect(input).toHaveAttribute("required");
  });

  test("has correct name attribute", () => {
    render(<Input name="username" placeholder="Username" />);
    const input = screen.getByPlaceholderText("Username");

    expect(input).toHaveAttribute("name", "username");
  });

  test("has no accessibility violations", async () => {
    const { container } = render(
      <label htmlFor="test-input">
        Test Label
        <Input id="test-input" placeholder="Accessible Input" />
      </label>
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
