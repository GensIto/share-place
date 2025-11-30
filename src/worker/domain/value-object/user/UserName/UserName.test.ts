import { describe, it, expect } from "vitest";
import { UserName } from "./UserName";

describe("UserName", () => {
  describe("of", () => {
    it("should create a valid UserName from string", () => {
      const name = "John Doe";
      const userName = UserName.of(name);

      expect(userName.value).toBe(name);
      expect(userName.toString()).toBe(name);
    });

    it("should trim whitespace", () => {
      const userName = UserName.of("  Test User  ");

      expect(userName.value).toBe("Test User");
    });

    it("should throw error for empty string", () => {
      expect(() => UserName.of("")).toThrow("User name is required");
    });

    it("should accept whitespace only (trimmed to empty is not validated by Zod)", () => {
      const userName = UserName.of("   ");
      expect(userName.value).toBe("");
    });

    it("should throw error for name exceeding 100 characters", () => {
      const longName = "a".repeat(101);
      expect(() => UserName.of(longName)).toThrow(
        "User name must be 100 characters or less"
      );
    });

    it("should accept name with exactly 100 characters", () => {
      const maxName = "a".repeat(100);
      const userName = UserName.of(maxName);

      expect(userName.value).toBe(maxName);
    });

    it("should accept name with special characters", () => {
      const name = "John O'Brien-Smith";
      const userName = UserName.of(name);

      expect(userName.value).toBe(name);
    });
  });

  describe("tryOf", () => {
    it("should return success for valid name", () => {
      const name = "Valid Name";
      const result = UserName.tryOf(name);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(name);
      }
    });

    it("should return error for empty string", () => {
      const result = UserName.tryOf("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for too long name", () => {
      const result = UserName.tryOf("a".repeat(101));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("equals", () => {
    it("should return true for same name values", () => {
      const name = "Same Name";
      const name1 = UserName.of(name);
      const name2 = UserName.of(name);

      expect(name1.equals(name2)).toBe(true);
    });

    it("should return false for different name values", () => {
      const name1 = UserName.of("Name One");
      const name2 = UserName.of("Name Two");

      expect(name1.equals(name2)).toBe(false);
    });

    it("should return true after trimming whitespace", () => {
      const name1 = UserName.of("  Test  ");
      const name2 = UserName.of("Test");

      expect(name1.equals(name2)).toBe(true);
    });
  });

  describe("toString", () => {
    it("should return the user name string", () => {
      const name = "John Doe";
      const userName = UserName.of(name);

      expect(userName.toString()).toBe(name);
    });
  });
});
