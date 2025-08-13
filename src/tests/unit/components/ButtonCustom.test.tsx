import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { expect, describe, it, vi } from "vitest"; // Import from vitest
import { ButtonCustom } from "@/components/uicustom/buttoncustom";

describe("ButtonCustom", () => {
  it("renders with default variant", () => {
    render(<ButtonCustom>Click me</ButtonCustom>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("bg-[#333333]");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn(); // Vitest mock function
    render(<ButtonCustom onClick={handleClick}>Click me</ButtonCustom>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders as child when asChild is true", () => {
    render(
      <ButtonCustom asChild>
        <a href="#">Link Button</a>
      </ButtonCustom>
    );
    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ButtonCustom className="custom-class">Test</ButtonCustom>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("renders with red variant", () => {
    render(<ButtonCustom variant="red">Danger</ButtonCustom>);
    expect(screen.getByRole("button")).toHaveClass("bg-[#cc0000]");
  });
});