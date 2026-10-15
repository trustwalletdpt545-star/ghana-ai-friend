import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import { filterNews, formatNewsSection } from "@/lib/news";
import { useNewsRefresh } from "@/lib/use-news-refresh";

afterEach(() => vi.useRealTimers());

describe("Verified live news", () => {
  it("removes AP Top Stories October 12 and 11 but keeps actual headlines", () => {
    const items = [
      { title: "Top Stories October 12", url: "https://apnews.com/video/october12" },
      { title: "AP Top Stories October 11", url: "https://apnews.com/video/october11" },
      { title: "Ghana opens new hospital", url: "https://apnews.com/article/ghana-hospital" },
    ];
    expect(filterNews(items, ["apnews.com"])).toEqual([items[2]]);
  });
  it("deduplicates matching headlines and tracking-link variants", () => {
    const first = { title: "Ghana opens new hospital", url: "https://apnews.com/article/hospital" };
    expect(filterNews([first, { ...first, url: `${first.url}?utm_source=news` }, { ...first, url: "https://apnews.com/article/other" }], ["apnews.com"])).toEqual([first]);
  });
  it("rejects untrusted or non-HTTPS news sources", () => {
    expect(filterNews([
      { title: "Hospital opens", url: "https://apnews.com.evil.test/article/hospital" },
      { title: "Hospital opens", url: "http://apnews.com/article/hospital" },
    ], ["apnews.com"])).toEqual([]);
  });
  it("preserves the exact Ghana article URL and available thumbnail", () => {
    const text = formatNewsSection("🇬🇭 GHANA NEWS", { results: [{ title: "Hospital opens", url: "https://myjoyonline.com/hospital-opens", image: "https://myjoyonline.com/hospital.jpg" }] }, ["myjoyonline.com"]);
    expect(text).toContain("[Source: MyJoyOnline](https://myjoyonline.com/hospital-opens)");
    expect(text).toContain("![Hospital opens](https://myjoyonline.com/hospital.jpg)");
  });
  it("keeps provider-level photos without assigning them to unrelated headlines", () => {
    const text = formatNewsSection("🌍 WORLD NEWS", { results: [{ title: "Hospital opens", url: "https://apnews.com/article/hospital" }], images: [{ url: "https://apnews.com/photo.jpg", description: "A hospital" }] }, ["apnews.com"]);
    expect(text).toContain("![A hospital](https://apnews.com/photo.jpg)");
  });
  it("returns the verified-news fallback after all roundup pages are removed", () => {
    const text = formatNewsSection("🌍 WORLD NEWS", { results: [{ title: "Top Stories October 12", url: "https://apnews.com/video/top-stories-october-12" }] }, ["apnews.com"]);
    expect(text).toContain("No verified news right now");
  });
});

describe("Five-minute refresh", () => {
  const message: UIMessage = { id: "news", role: "assistant", parts: [{ type: "text", text: "🌍 WORLD NEWS\n🇬🇭 GHANA NEWS" }] };
  it("refreshes at exactly five minutes and replaces only existing news messages", async () => {
    vi.useFakeTimers();
    const fetchNews = vi.fn().mockResolvedValue({ text: "Fresh verified news" });
    const setMessages = vi.fn();
    const { unmount } = renderHook(() => useNewsRefresh({ messages: [message], enabled: true, busy: false, fetchNews, setMessages }));
    await act(() => vi.advanceTimersByTimeAsync(299999));
    expect(fetchNews).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(fetchNews).toHaveBeenCalledTimes(1);
    const user: UIMessage = { id: "user", role: "user", parts: [{ type: "text", text: "News today?" }] };
    const updater = setMessages.mock.calls[0]?.[0];
    expect(updater).toBeDefined();
    const result = updater!([user, message]);
    expect(result[0]).toEqual(user);
    expect(result[1]).toEqual({ ...message, parts: [{ type: "text", text: "Fresh verified news" }] });
    unmount();
    await act(() => vi.advanceTimersByTimeAsync(300000));
    expect(fetchNews).toHaveBeenCalledTimes(1);
  });
  it("does not refresh while live search is disabled or a chat answer is streaming", async () => {
    vi.useFakeTimers();
    const fetchNews = vi.fn();
    const { rerender } = renderHook(({ enabled, busy }) => useNewsRefresh({ messages: [message], enabled, busy, fetchNews, setMessages: vi.fn() }), { initialProps: { enabled: false, busy: false } });
    await act(() => vi.advanceTimersByTimeAsync(300000));
    expect(fetchNews).not.toHaveBeenCalled();
    rerender({ enabled: true, busy: true });
    await act(() => vi.advanceTimersByTimeAsync(300000));
    expect(fetchNews).not.toHaveBeenCalled();
  });
});