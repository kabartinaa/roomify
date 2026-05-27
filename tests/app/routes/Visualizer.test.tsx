import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Visualizer from "../../../app/routes/Visualizer.$id";

describe("Visualizer route component", () => {
  it("renders without crashing", () => {
    render(<Visualizer />);
  });

  it("renders the text 'Visualizer'", () => {
    render(<Visualizer />);
    expect(screen.getByText("Visualizer")).toBeInTheDocument();
  });

  it("renders a div element as root", () => {
    const { container } = render(<Visualizer />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders a single text node inside the root div", () => {
    const { container } = render(<Visualizer />);
    expect(container.firstChild?.childNodes).toHaveLength(1);
    expect(container.firstChild?.firstChild?.nodeType).toBe(Node.TEXT_NODE);
  });

  it("is exported as default", async () => {
    const mod = await import("../../../app/routes/Visualizer.$id");
    expect(typeof mod.default).toBe("function");
  });
});