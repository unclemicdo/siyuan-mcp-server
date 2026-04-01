import { describe, expect, it } from "vitest";
import { assertReadOnlySelectStatement } from "../../services/sql-safety.js";

describe("assertReadOnlySelectStatement", () => {
  it("allows a simple SELECT statement", () => {
    expect(assertReadOnlySelectStatement("SELECT id FROM blocks LIMIT 1")).toBe(
      "SELECT id FROM blocks LIMIT 1"
    );
  });

  it("allows SELECT with leading comments and a trailing semicolon", () => {
    expect(
      assertReadOnlySelectStatement(
        "/* find docs */\n  select id, hpath from blocks where type = 'd';  "
      )
    ).toBe("select id, hpath from blocks where type = 'd'");
  });

  it("rejects non-SELECT statements", () => {
    expect(() => assertReadOnlySelectStatement("UPDATE blocks SET content = 'x'"))
      .toThrowError(/only read-only SELECT/i);
  });

  it("rejects multi-statement payloads", () => {
    expect(() =>
      assertReadOnlySelectStatement("SELECT id FROM blocks; DELETE FROM blocks")
    ).toThrowError(/single SELECT/i);
  });

  it("rejects comment-only payloads", () => {
    expect(() => assertReadOnlySelectStatement("-- nothing here"))
      .toThrowError(/empty SQL/i);
  });

  it("rejects pragma and other unsafe keywords inside a SELECT payload", () => {
    expect(() =>
      assertReadOnlySelectStatement("SELECT * FROM pragma_table_info('blocks')")
    ).toThrowError(/unsafe keyword/i);
  });
});
