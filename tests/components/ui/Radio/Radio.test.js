import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Radio from "../../../../src/components/ui/Radio/Radio";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Radio Component", () => {
  test("renders correctly with label", () => {
    render(<Radio id="test-radio" label="Test Radio" value="test" />);
    const radio = screen.getByRole("radio", { name: "Test Radio" });
    const label = screen.getByText("Test Radio");

    expect(radio).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(radio).not.toBeDisabled();
    expect(radio).not.toBeChecked();
  });

  test("renders as checked when checked prop is true", () => {
    render(
      <Radio
        id="test-radio"
        label="Test Radio"
        value="test"
        checked={true}
        onChange={() => {}}
      />
    );
    const radio = screen.getByRole("radio", { name: "Test Radio" });

    expect(radio).toBeChecked();
  });

  test("renders as disabled when disabled prop is true", () => {
    render(<Radio id="test-radio" label="Test Radio" value="test" disabled />);
    const radio = screen.getByRole("radio", { name: "Test Radio" });

    expect(radio).toBeDisabled();
  });

  test("calls onChange handler when clicked", () => {
    const handleChange = jest.fn();
    render(
      <Radio
        id="test-radio"
        label="Test Radio"
        value="test"
        onChange={handleChange}
      />
    );
    const radio = screen.getByRole("radio", { name: "Test Radio" });

    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("is disabled and prevents user interaction", () => {
    const handleChange = jest.fn();
    render(
      <Radio
        id="test-radio"
        label="Test Radio"
        value="test"
        onChange={handleChange}
        disabled
      />
    );
    const radio = screen.getByRole("radio", { name: "Test Radio" });

    expect(radio).toBeDisabled();
  });

  test("applies custom className to wrapper", () => {
    render(
      <Radio
        id="test-radio"
        label="Test Radio"
        value="test"
        className="custom-class"
      />
    );
    const wrapper = screen.getByText("Test Radio").closest(".radio-wrapper");

    expect(wrapper).toHaveClass("custom-class");
  });

  test("associates label with input via id", () => {
    render(<Radio id="test-radio-id" label="Test Radio" value="test" />);
    const radio = screen.getByLabelText("Test Radio");

    expect(radio).toHaveAttribute("id", "test-radio-id");
  });

  test("passes additional props to input element", () => {
    render(
      <Radio
        id="test-radio"
        label="Test Radio"
        value="test"
        data-testid="test-radio-input"
        aria-describedby="help-text"
      />
    );
    const radio = screen.getByTestId("test-radio-input");

    expect(radio).toHaveAttribute("aria-describedby", "help-text");
  });

  test("has correct name attribute", () => {
    render(
      <Radio id="test-radio" label="Test Radio" value="test" name="group1" />
    );
    const radio = screen.getByRole("radio", { name: "Test Radio" });

    expect(radio).toHaveAttribute("name", "group1");
  });

  test("has correct value attribute", () => {
    render(<Radio id="test-radio" label="Test Radio" value="test-value" />);
    const radio = screen.getByRole("radio", { name: "Test Radio" });

    expect(radio).toHaveAttribute("value", "test-value");
  });

  test("has no accessibility violations", async () => {
    const { container } = render(
      <Radio id="test-radio" label="Accessible Radio" value="test" />
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
