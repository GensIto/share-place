import { describe, it, expect } from "vitest";
import { EmailAddress } from "./EmailAddress";

describe("EmailAddress", () => {
  describe("of", () => {
    it("should create a valid EmailAddress from email string", () => {
      const email = "test@example.com";
      const emailAddress = EmailAddress.of(email);

      expect(emailAddress.value).toBe(email);
      expect(emailAddress.toString()).toBe(email);
    });

    it("should convert email to lowercase", () => {
      const emailAddress = EmailAddress.of("Test@Example.COM");

      expect(emailAddress.value).toBe("test@example.com");
    });

    it("should throw error for invalid email format", () => {
      expect(() => EmailAddress.of("invalid-email")).toThrow();
    });

    it("should throw error for empty string", () => {
      expect(() => EmailAddress.of("")).toThrow();
    });

    it("should throw error for email without @", () => {
      expect(() => EmailAddress.of("testexample.com")).toThrow();
    });

    it("should throw error for email without domain", () => {
      expect(() => EmailAddress.of("test@")).toThrow();
    });

    it("should accept valid email with subdomain", () => {
      const emailAddress = EmailAddress.of("user@mail.example.com");

      expect(emailAddress.value).toBe("user@mail.example.com");
    });
  });

  describe("tryOf", () => {
    it("should return success for valid email", () => {
      const email = "valid@example.com";
      const result = EmailAddress.tryOf(email);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(email);
      }
    });

    it("should return error for invalid email", () => {
      const result = EmailAddress.tryOf("invalid");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should convert email to lowercase in tryOf", () => {
      const result = EmailAddress.tryOf("Test@Example.COM");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("test@example.com");
      }
    });
  });

  describe("getDomain", () => {
    it("should return domain part of email", () => {
      const emailAddress = EmailAddress.of("user@example.com");

      expect(emailAddress.getDomain()).toBe("example.com");
    });

    it("should return domain with subdomain", () => {
      const emailAddress = EmailAddress.of("user@mail.example.com");

      expect(emailAddress.getDomain()).toBe("mail.example.com");
    });
  });

  describe("getLocalPart", () => {
    it("should return local part of email", () => {
      const emailAddress = EmailAddress.of("user@example.com");

      expect(emailAddress.getLocalPart()).toBe("user");
    });

    it("should return local part with dots", () => {
      const emailAddress = EmailAddress.of("first.last@example.com");

      expect(emailAddress.getLocalPart()).toBe("first.last");
    });
  });

  describe("equals", () => {
    it("should return true for same email addresses", () => {
      const email = "test@example.com";
      const email1 = EmailAddress.of(email);
      const email2 = EmailAddress.of(email);

      expect(email1.equals(email2)).toBe(true);
    });

    it("should return false for different email addresses", () => {
      const email1 = EmailAddress.of("user1@example.com");
      const email2 = EmailAddress.of("user2@example.com");

      expect(email1.equals(email2)).toBe(false);
    });

    it("should return true for emails with different casing", () => {
      const email1 = EmailAddress.of("Test@Example.com");
      const email2 = EmailAddress.of("test@example.com");

      expect(email1.equals(email2)).toBe(true);
    });
  });

  describe("toString", () => {
    it("should return the email string", () => {
      const email = "test@example.com";
      const emailAddress = EmailAddress.of(email);

      expect(emailAddress.toString()).toBe(email);
    });
  });
});
