import { describe, expect, it } from "vitest";
import {
  getSiyuanEndpointRisk,
  getSiyuanStartupWarnings,
} from "../siyuan.js";

describe("getSiyuanEndpointRisk", () => {
  it("treats localhost endpoints as local", () => {
    expect(getSiyuanEndpointRisk("http://127.0.0.1:6806")).toMatchObject({
      level: "local",
      isLocal: true,
      isRemote: false,
      isHttps: false,
      host: "127.0.0.1",
    });
  });

  it("flags private-network HTTP endpoints as non-local and insecure", () => {
    expect(getSiyuanEndpointRisk("http://192.168.1.25:6806")).toMatchObject({
      level: "private-network",
      isLocal: false,
      isRemote: true,
      isHttps: false,
      host: "192.168.1.25",
    });
  });

  it("flags public HTTPS endpoints as remote but secure", () => {
    expect(getSiyuanEndpointRisk("https://notes.example.com")).toMatchObject({
      level: "remote-secure",
      isLocal: false,
      isRemote: true,
      isHttps: true,
      host: "notes.example.com",
    });
  });

  it("flags public HTTP endpoints as remote and insecure", () => {
    expect(getSiyuanEndpointRisk("http://notes.example.com")).toMatchObject({
      level: "remote-insecure",
      isLocal: false,
      isRemote: true,
      isHttps: false,
      host: "notes.example.com",
    });
  });
});

describe("getSiyuanStartupWarnings", () => {
  it("does not warn for local endpoints", () => {
    expect(getSiyuanStartupWarnings("http://localhost:6806")).toEqual([]);
  });

  it("warns when the endpoint is non-local", () => {
    expect(getSiyuanStartupWarnings("https://notes.example.com")).toEqual(
      expect.arrayContaining([
        expect.stringContaining("SIYUAN_BASE_URL points to a non-local address"),
      ])
    );
  });

  it("adds a stronger warning for non-HTTPS remote endpoints", () => {
    expect(getSiyuanStartupWarnings("http://notes.example.com")).toEqual(
      expect.arrayContaining([
        expect.stringContaining("non-local address"),
        expect.stringContaining("not using HTTPS"),
      ])
    );
  });
});
