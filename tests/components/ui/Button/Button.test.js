import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../../../../src/components/ui/Button/Button";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Button Component", () => {
  test("renders correctly with default props", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn btn-primary");
    expect(button).not.toBeDisabled();
  });

  test("renders correctly with custom variant", () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole("button", { name: /secondary button/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn btn-secondary");
  });

  test("renders as disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button", { name: /disabled button/i });

    expect(button).toBeDisabled();
  });

  test("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    const button = screen.getByRole("button", { name: /clickable button/i });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled Clickable Button
      </Button>
    );
    const button = screen.getByRole("button", {
      name: /disabled clickable button/i,
    });

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("applies custom className", () => {
    render(<Button className="custom-class">Custom Class Button</Button>);
    const button = screen.getByRole("button", { name: /custom class button/i });

    expect(button).toHaveClass("custom-class");
  });

  test("passes additional props to button element", () => {
    render(
      <Button data-testid="test-button" aria-label="Test Button">
        Test Props
      </Button>
    );
    const button = screen.getByTestId("test-button");

    expect(button).toHaveAttribute("aria-label", "Test Button");
  });

  test("has no accessibility violations", async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
