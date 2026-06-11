import { describe, it, expect } from "vitest";
import {
  PUTER_WORKER_URL,
  STORAGE_PATHS,
  SHARE_STATUS_RESET_DELAY_MS,
  PROGRESS_INCREMENT,
  REDIRECT_DELAY_MS,
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  GRID_OVERLAY_SIZE,
  GRID_COLOR,
  UNAUTHORIZED_STATUSES,
  IMAGE_RENDER_DIMENSION,
  ROOMIFY_RENDER_PROMPT,
} from "../../lib/constants";

describe("lib/constants", () => {
  describe("PUTER_WORKER_URL", () => {
    it("defaults to empty string when env var is not set", () => {
      expect(PUTER_WORKER_URL).toBe("");
    });

    it("is a string", () => {
      expect(typeof PUTER_WORKER_URL).toBe("string");
    });
  });

  describe("STORAGE_PATHS", () => {
    it("has ROOT path set to 'roomify'", () => {
      expect(STORAGE_PATHS.ROOT).toBe("roomify");
    });

    it("has SOURCES path set to 'roomify/sources'", () => {
      expect(STORAGE_PATHS.SOURCES).toBe("roomify/sources");
    });

    it("has RENDERS path set to 'roomify/renders'", () => {
      expect(STORAGE_PATHS.RENDERS).toBe("roomify/renders");
    });

    it("SOURCES is a subdirectory of ROOT", () => {
      expect(STORAGE_PATHS.SOURCES.startsWith(STORAGE_PATHS.ROOT + "/")).toBe(true);
    });

    it("RENDERS is a subdirectory of ROOT", () => {
      expect(STORAGE_PATHS.RENDERS.startsWith(STORAGE_PATHS.ROOT + "/")).toBe(true);
    });

    it("has exactly three keys", () => {
      expect(Object.keys(STORAGE_PATHS)).toHaveLength(3);
    });
  });

  describe("Timing constants", () => {
    it("SHARE_STATUS_RESET_DELAY_MS is 1500", () => {
      expect(SHARE_STATUS_RESET_DELAY_MS).toBe(1500);
    });

    it("PROGRESS_INCREMENT is 15", () => {
      expect(PROGRESS_INCREMENT).toBe(15);
    });

    it("REDIRECT_DELAY_MS is 600", () => {
      expect(REDIRECT_DELAY_MS).toBe(600);
    });

    it("PROGRESS_INTERVAL_MS is 100", () => {
      expect(PROGRESS_INTERVAL_MS).toBe(100);
    });

    it("PROGRESS_STEP is 5", () => {
      expect(PROGRESS_STEP).toBe(5);
    });

    it("PROGRESS_INCREMENT allows reaching 100 from 0 in a finite number of steps", () => {
      let progress = 0;
      let steps = 0;
      while (progress < 100) {
        progress = Math.min(progress + PROGRESS_INCREMENT, 100);
        steps++;
        if (steps > 1000) throw new Error("Infinite loop guard");
      }
      expect(progress).toBe(100);
    });

    it("REDIRECT_DELAY_MS is shorter than SHARE_STATUS_RESET_DELAY_MS", () => {
      expect(REDIRECT_DELAY_MS).toBeLessThan(SHARE_STATUS_RESET_DELAY_MS);
    });

    it("all timing values are positive numbers", () => {
      expect(SHARE_STATUS_RESET_DELAY_MS).toBeGreaterThan(0);
      expect(PROGRESS_INCREMENT).toBeGreaterThan(0);
      expect(REDIRECT_DELAY_MS).toBeGreaterThan(0);
      expect(PROGRESS_INTERVAL_MS).toBeGreaterThan(0);
      expect(PROGRESS_STEP).toBeGreaterThan(0);
    });
  });

  describe("UI constants", () => {
    it("GRID_OVERLAY_SIZE is '60px 60px'", () => {
      expect(GRID_OVERLAY_SIZE).toBe("60px 60px");
    });

    it("GRID_COLOR is '#3B82F6'", () => {
      expect(GRID_COLOR).toBe("#3B82F6");
    });

    it("GRID_COLOR is a valid hex color", () => {
      expect(GRID_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe("HTTP status codes", () => {
    it("UNAUTHORIZED_STATUSES contains 401", () => {
      expect(UNAUTHORIZED_STATUSES).toContain(401);
    });

    it("UNAUTHORIZED_STATUSES contains 403", () => {
      expect(UNAUTHORIZED_STATUSES).toContain(403);
    });

    it("UNAUTHORIZED_STATUSES has exactly two entries", () => {
      expect(UNAUTHORIZED_STATUSES).toHaveLength(2);
    });

    it("UNAUTHORIZED_STATUSES does not contain 200", () => {
      expect(UNAUTHORIZED_STATUSES).not.toContain(200);
    });
  });

  describe("IMAGE_RENDER_DIMENSION", () => {
    it("is 1024", () => {
      expect(IMAGE_RENDER_DIMENSION).toBe(1024);
    });

    it("is a power of two", () => {
      expect(IMAGE_RENDER_DIMENSION & (IMAGE_RENDER_DIMENSION - 1)).toBe(0);
    });

    it("is a positive number", () => {
      expect(IMAGE_RENDER_DIMENSION).toBeGreaterThan(0);
    });
  });

  describe("ROOMIFY_RENDER_PROMPT", () => {
    it("is a non-empty string", () => {
      expect(typeof ROOMIFY_RENDER_PROMPT).toBe("string");
      expect(ROOMIFY_RENDER_PROMPT.length).toBeGreaterThan(0);
    });

    it("contains the core task instruction", () => {
      expect(ROOMIFY_RENDER_PROMPT).toContain("2D floor plan");
    });

    it("contains instruction to remove all text", () => {
      expect(ROOMIFY_RENDER_PROMPT).toContain("REMOVE ALL TEXT");
    });

    it("specifies top-down view requirement", () => {
      expect(ROOMIFY_RENDER_PROMPT).toContain("TOP‑DOWN ONLY");
    });

    it("does not start or end with whitespace (trimmed)", () => {
      expect(ROOMIFY_RENDER_PROMPT).toBe(ROOMIFY_RENDER_PROMPT.trim());
    });

    it("mentions photorealistic output", () => {
      expect(ROOMIFY_RENDER_PROMPT).toContain("photorealistic");
    });

    it("mentions furniture mapping", () => {
      expect(ROOMIFY_RENDER_PROMPT).toContain("FURNITURE");
    });
  });
});