let apiClient;

beforeAll(() => {
  process.env.REACT_APP_CUSTOM_API_URL = "http://test.com";
  apiClient = require("./apiClient");
});

describe("apiClient", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loginAdmin success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "mock-token", user: { username: "test" } }),
    });
    const res = await apiClient.loginAdmin("test", "password");
    expect(res.success).toBe(true);
  });

  it("loginAdmin failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "invalid" }),
    });
    const res = await apiClient.loginAdmin("test", "bad");
    expect(res.success).toBe(false);
  });

  it("signupAdmin success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "mock-token", user: { username: "test" } }),
    });
    const res = await apiClient.signupAdmin(
      "test",
      "test@test.com",
      "password"
    );
    expect(res.success).toBe(true);
  });

  it("verifyEmail success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "verified" }),
    });
    const res = await apiClient.verifyEmail("token123");
    expect(res.success).toBe(true);
  });

  it("verifyEmail failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "bad token" }),
    });
    const res = await apiClient.verifyEmail("bad");
    expect(res.success).toBe(false);
  });

  it("requestPasswordReset success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "sent" }),
    });
    const res = await apiClient.requestPasswordReset("test@test.com");
    expect(res.success).toBe(true);
  });

  it("requestPasswordReset failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "not found" }),
    });
    const res = await apiClient.requestPasswordReset("bad@test.com");
    expect(res.success).toBe(false);
  });

  it("resetPassword success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "reset" }),
    });
    const res = await apiClient.resetPassword("token", "newpass");
    expect(res.success).toBe(true);
  });

  it("resetPassword failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "expired" }),
    });
    const res = await apiClient.resetPassword("token", "newpass");
    expect(res.success).toBe(false);
  });

  it("fetchBlogs success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ slug: "test" }],
    });
    // Need to set REACT_APP_CUSTOM_API_URL or it will return mock
    process.env.REACT_APP_CUSTOM_API_URL = "http://localhost";
    const res = await apiClient.fetchBlogs();
    expect(res).toBeTruthy();
  });

  it("fetchBlogBySlug success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ slug: "test" }),
    });
    const res = await apiClient.fetchBlogBySlug("test");
    expect(res).toBeTruthy();
  });

  it("createBlog success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "created" }),
    });
    const res = await apiClient.createBlog({ title: "test" }, "token");
    expect(res.success).toBe(true);
  });

  it("createBlog failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "bad" }),
    });
    const res = await apiClient.createBlog({ title: "test" }, "token");
    expect(res.success).toBe(false);
  });

  it("createBlog unauthorized", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "unauth" }),
    });
    const res = await apiClient.createBlog({ title: "test" }, "token");
    expect(res.success).toBe(false);
  });

  it("updateBlog success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "updated" }),
    });
    const res = await apiClient.updateBlog(
      "test",
      { title: "new test" },
      "token"
    );
    expect(res.success).toBe(true);
  });

  it("updateBlog failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "bad" }),
    });
    const res = await apiClient.updateBlog(
      "test",
      { title: "new test" },
      "token"
    );
    expect(res.success).toBe(false);
  });

  it("deleteBlog success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "deleted" }),
    });
    const res = await apiClient.deleteBlog("test", "token");
    expect(res.success).toBe(true);
  });

  it("deleteBlog failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "bad" }),
    });
    const res = await apiClient.deleteBlog("test", "token");
    expect(res.success).toBe(false);
  });

  it("likeBlog success", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "liked" }),
    });
    const res = await apiClient.likeBlog("test-slug");
    expect(res.success).toBe(true);
  });

  it("likeBlog failure", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "failed" }),
    });
    const res = await apiClient.likeBlog("test-slug");
    expect(res.success).toBe(false);
  });

  it("commentBlog success", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "commented" }),
    });
    const res = await apiClient.commentBlog("test-slug", "Nice post!");
    expect(res.success).toBe(true);
  });

  it("commentBlog failure", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "failed" }),
    });
    const res = await apiClient.commentBlog("test-slug", "Nice post!");
    expect(res.success).toBe(false);
  });

  it("deleteComment success", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "deleted" }),
    });
    const res = await apiClient.deleteComment("test-slug", "comment-id");
    expect(res.success).toBe(true);
  });

  it("deleteComment failure", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "failed" }),
    });
    const res = await apiClient.deleteComment("test-slug", "comment-id");
    expect(res.success).toBe(false);
  });

  it("session functions", () => {
    apiClient.setSession("token123", { username: "test" });
    expect(apiClient.getStoredToken()).toBe("token123");
    expect(apiClient.getStoredUser().username).toBe("test");
    apiClient.clearSession();
    expect(apiClient.getStoredToken()).toBeNull();
    expect(apiClient.getStoredUser()).toBeNull();
  });

  it("fetchMediumBlogs successfully parses rss2json data", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: "ok",
        items: [
          {
            guid: "mock-guid-1",
            title: "Mock Medium Blog",
            description: '<p>Some intro</p><img src="mock-image.png" />',
            pubDate: "2026-07-21 12:00:00",
            author: "Mock Author",
            categories: ["Mock Category"],
            link: "https://medium.com/mock-link",
          },
          {
            guid: "mock-guid-2",
            title: "Mock Medium Blog 2",
            description: "<p>No image here</p>",
            pubDate: "2026-07-21 13:00:00",
            author: "",
            categories: [],
            link: "https://medium.com/mock-link-2",
            thumbnail: "thumbnail.png",
          },
        ],
      }),
    });
    const res = await apiClient.fetchMediumBlogs();
    expect(res).toHaveLength(2);
    expect(res[0].slug).toBe("mock-guid-1");
    expect(res[0].coverImage).toBe("mock-image.png"); // extracted from description
    expect(res[0].tags[0]).toBe("Mock Category");
    expect(res[1].slug).toBe("mock-guid-2");
    expect(res[1].coverImage).toBe("thumbnail.png"); // fallback to thumbnail
    expect(res[1].tags[0]).toBe("Medium"); // default tag
  });

  it("fetchMediumBlogs returns empty array on status not ok", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: "error",
      }),
    });
    const res = await apiClient.fetchMediumBlogs();
    expect(res).toEqual([]);
  });
});

describe("apiClient API unreachable", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockRejectedValue(new Error("API Unreachable"));
  });

  it("fetchBlogs catches error", async () => {
    const res = await apiClient.fetchBlogs();
    expect(res).toEqual([]);
  });

  it("fetchBlogBySlug catches error", async () => {
    const res = await apiClient.fetchBlogBySlug("migrating-to-terraform");
    expect(res).toBeNull();
  });

  it("createBlog catches error", async () => {
    const res = await apiClient.createBlog({});
    expect(res.success).toBe(false);
  });

  it("updateBlog catches error", async () => {
    const res = await apiClient.updateBlog("test", {});
    expect(res.success).toBe(false);
  });

  it("deleteBlog catches error", async () => {
    const res = await apiClient.deleteBlog("test");
    expect(res.success).toBe(false);
  });

  it("loginAdmin catches error but succeeds with admin pass", async () => {
    const res = await apiClient.loginAdmin("test", "amrit123");
    expect(res.success).toBe(true);
  });

  it("loginAdmin catches error and fails with bad pass", async () => {
    const res = await apiClient.loginAdmin("test", "bad");
    expect(res.success).toBe(false);
  });

  it("signupAdmin catches error and succeeds", async () => {
    const res = await apiClient.signupAdmin("test", "test@test.com", "pass");
    expect(res.success).toBe(true);
  });

  it("verifyEmail catches error and succeeds", async () => {
    const res = await apiClient.verifyEmail("token");
    expect(res.success).toBe(true);
  });

  it("requestPasswordReset catches error and succeeds", async () => {
    const res = await apiClient.requestPasswordReset("test@test.com");
    expect(res.success).toBe(true);
  });

  it("resetPassword catches error and succeeds", async () => {
    const res = await apiClient.resetPassword("token", "newpass");
    expect(res.success).toBe(true);
  });

  it("likeBlog catches error and returns mock", async () => {
    apiClient.setSession("token123", { username: "test" });
    const res = await apiClient.likeBlog("slug");
    expect(res.success).toBe(false);
  });

  it("commentBlog catches error and returns mock", async () => {
    apiClient.setSession("token123", { username: "test" });
    const res = await apiClient.commentBlog("slug", "text");
    expect(res.success).toBe(false);
  });

  it("deleteComment catches error and returns mock", async () => {
    apiClient.setSession("token123", { username: "test" });
    const res = await apiClient.deleteComment("slug", "id");
    expect(res.success).toBe(false);
  });

  it("fetchMediumBlogs catches error and returns empty array", async () => {
    const res = await apiClient.fetchMediumBlogs();
    expect(res).toEqual([]);
  });
});
