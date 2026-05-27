import { describe, it, expect, vi } from "vitest";

// Mock @react-router/dev/routes so we can inspect the route definitions
// without needing the full framework runtime.
vi.mock("@react-router/dev/routes", () => ({
  index: (file: string) => ({ type: "index", file }),
  route: (path: string, file: string) => ({ type: "route", path, file }),
}));

// Import after mocking
const { default: routes } = await import("../../app/routes");

describe("app/routes.ts", () => {
  it("exports an array of routes", () => {
    expect(Array.isArray(routes)).toBe(true);
  });

  it("exports exactly two routes", () => {
    expect(routes).toHaveLength(2);
  });

  describe("index route", () => {
    const indexRoute = routes[0] as { type: string; file: string };

    it("is the first route", () => {
      expect(indexRoute).toBeDefined();
    });

    it("is an index route", () => {
      expect(indexRoute.type).toBe("index");
    });

    it("maps to routes/home.tsx", () => {
      expect(indexRoute.file).toBe("routes/home.tsx");
    });
  });

  describe("Visualizer route", () => {
    const visualizerRoute = routes[1] as {
      type: string;
      path: string;
      file: string;
    };

    it("is the second route", () => {
      expect(visualizerRoute).toBeDefined();
    });

    it("is a named route", () => {
      expect(visualizerRoute.type).toBe("route");
    });

    it("has the correct path pattern with :id param", () => {
      expect(visualizerRoute.path).toBe("Visualizer/:id");
    });

    it("maps to routes/Visualizer.$id.tsx", () => {
      expect(visualizerRoute.file).toBe("routes/Visualizer.$id.tsx");
    });

    it("path contains the dynamic :id segment", () => {
      expect(visualizerRoute.path).toContain(":id");
    });
  });
});