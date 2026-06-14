import { assertEquals } from "@std/assert";
import { getPositiveIntegerEnv } from "./env.ts";

Deno.test("getPositiveIntegerEnv returns the configured positive integer", () => {
  Deno.env.set("TEST_POSITIVE_INTEGER", "42");

  try {
    assertEquals(getPositiveIntegerEnv("TEST_POSITIVE_INTEGER", 10), 42);
  } finally {
    Deno.env.delete("TEST_POSITIVE_INTEGER");
  }
});

Deno.test("getPositiveIntegerEnv falls back for missing or invalid values", () => {
  assertEquals(getPositiveIntegerEnv("TEST_MISSING_INTEGER", 10), 10);

  Deno.env.set("TEST_INVALID_INTEGER", "nope");

  try {
    assertEquals(getPositiveIntegerEnv("TEST_INVALID_INTEGER", 10), 10);
  } finally {
    Deno.env.delete("TEST_INVALID_INTEGER");
  }
});
