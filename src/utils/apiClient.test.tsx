let apiClient;

beforeAll(async () => {
  process.env.REACT_APP_CUSTOM_API_URL = "http://test.com";
  apiClient = await import("./apiClient");
});

describe("apiClient", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it("setup2FA success", async () => {
    apiClient.setSession("token", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ secret: "abc", qr_code: "qr" }),
    });
    const res = await apiClient.setup2FA();
    expect(res.success).toBe(true);
  });

  it("verify2FA success", async () => {
    apiClient.setSession("token", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "verified" }),
    });
    const res = await apiClient.verify2FA("123456");
    expect(res.success).toBe(true);
  });

  it("login2FA success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "t", user: { username: "a" } }),
    });
    const res = await apiClient.login2FA("temp", "123");
    expect(res.success).toBe(true);
  });

  it("fetchAccountProfile success", async () => {
    apiClient.setSession("token", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ username: "test", address: "123" }),
    });
    const res = await apiClient.fetchAccountProfile();
    expect(res.success).toBe(true);
    expect(res.profile.address).toBe("123");
  });

  it("updateAccountProfile success", async () => {
    apiClient.setSession("token", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "updated" }),
    });
    const res = await apiClient.updateAccountProfile("123", "456");
    expect(res.success).toBe(true);
  });

  it("deleteAccount success", async () => {
    apiClient.setSession("token", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "deleted" }),
    });
    const res = await apiClient.deleteAccount();
    expect(res.success).toBe(true);
  });
});

describe("apiClient API unreachable", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockRejectedValue(new Error("API Unreachable"));
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

  it("getMediaUploadUrl success", async () => {
    apiClient.setSession("token123", { username: "test", role: "admin" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        presigned_url: "https://presigned.url",
        cloudfront_url: "https://cdn.url/image.png",
        key: "media/image.png",
      }),
    });
    const res = await apiClient.getMediaUploadUrl(
      "test.png",
      "image/png",
      "test-slug"
    );
    expect(res.success).toBe(true);
    expect(res.presigned_url).toBe("https://presigned.url");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          filename: "test.png",
          content_type: "image/png",
          blogSlug: "test-slug",
        }),
      })
    );
  });

  it("getMediaUploadUrl unauthenticated", async () => {
    sessionStorage.clear();
    localStorage.clear();
    const res = await apiClient.getMediaUploadUrl("test.png", "image/png");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Not authenticated");
  });

  it("getMediaUploadUrl returns mock when API_URL is null", async () => {
    // temporarily unset API_URL
    const originalApi = process.env.REACT_APP_CUSTOM_API_URL;
    delete process.env.REACT_APP_CUSTOM_API_URL;

    // We need to re-require the module to apply the null API_URL
    vi.resetModules();
    const newApiClient = await import("./apiClient");

    const res = await newApiClient.getMediaUploadUrl("test.png", "image/png");
    expect(res.success).toBe(true);
    expect(res.presigned_url).toBeNull();
    expect(res.cloudfront_url).toContain("mock");

    // restore
    process.env.REACT_APP_CUSTOM_API_URL = originalApi;
  });

  it("uploadMediaToS3 mock mode", async () => {
    const originalApi = process.env.REACT_APP_CUSTOM_API_URL;
    delete process.env.REACT_APP_CUSTOM_API_URL;
    vi.resetModules();
    const newApiClient = await import("./apiClient");

    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const progressSpy = vi.fn();
    const res = await newApiClient.uploadMediaToS3(file, progressSpy);

    expect(res.success).toBe(true);
    expect(progressSpy).toHaveBeenCalledWith(100);
    expect(res.url).toContain("mock");

    process.env.REACT_APP_CUSTOM_API_URL = originalApi;
  });

  it("getMediaUploadUrl returns error if response not ok", async () => {
    apiClient.setSession("token123", { username: "test", role: "admin" });
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Bad Request" }),
    });
    const res = await apiClient.getMediaUploadUrl("test.png", "image/png");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Bad Request");
  });

  it("getMediaUploadUrl returns network error on fetch fail", async () => {
    apiClient.setSession("token123", { username: "test", role: "admin" });
    global.fetch.mockRejectedValueOnce(new Error("API Unreachable"));
    const res = await apiClient.getMediaUploadUrl("test.png", "image/png");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Network error fetching upload URL");
  });

  it("uploadMediaToS3 returns error if getMediaUploadUrl fails", async () => {
    apiClient.setSession("token123", { username: "test", role: "admin" });
    global.fetch.mockRejectedValueOnce(new Error("API Unreachable"));
    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const res = await apiClient.uploadMediaToS3(file);
    expect(res.success).toBe(false);
  });

  it("uploadMediaToS3 success with actual XHR", async () => {
    apiClient.setSession("token123", { username: "test", role: "admin" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        presigned_url: "https://presigned.url",
        cloudfront_url: "https://cdn.url/image.png",
        key: "media/image.png",
      }),
    });

    const mockXhr = {
      open: vi.fn(),
      setRequestHeader: vi.fn(),
      send: vi.fn(function () {
        if (this.upload && this.upload.onprogress) {
          this.upload.onprogress({
            lengthComputable: true,
            loaded: 50,
            total: 100,
          });
        }
        this.status = 200;
        this.onload();
      }),
      upload: {},
    };
    window.XMLHttpRequest = vi.fn(() => mockXhr);

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const progressSpy = vi.fn();
    const res = await apiClient.uploadMediaToS3(file, progressSpy);

    expect(res.success).toBe(true);
    expect(res.url).toBe("https://cdn.url/image.png");
    expect(progressSpy).toHaveBeenCalledWith(50);
  });

  it("uploadMediaToS3 failure with XHR network error", async () => {
    apiClient.setSession("token123", { username: "test", role: "admin" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        presigned_url: "https://presigned.url",
        cloudfront_url: "https://cdn.url/image.png",
        key: "media/image.png",
      }),
    });

    const mockXhr = {
      open: vi.fn(),
      setRequestHeader: vi.fn(),
      send: vi.fn(function () {
        this.onerror();
      }),
      upload: {},
    };
    window.XMLHttpRequest = vi.fn(() => mockXhr);

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const res = await apiClient.uploadMediaToS3(file);

    expect(res.success).toBe(false);
    expect(res.error).toBe("Network error during S3 upload");
  });

  it("setup2FA catches error", async () => {
    apiClient.setSession("token", { username: "test" });
    const res = await apiClient.setup2FA();
    expect(res.success).toBe(false);
  });

  it("verify2FA catches error", async () => {
    apiClient.setSession("token", { username: "test" });
    const res = await apiClient.verify2FA("123");
    expect(res.success).toBe(false);
  });

  it("login2FA catches error", async () => {
    const res = await apiClient.login2FA("t", "123");
    expect(res.success).toBe(false);
  });

  it("fetchAccountProfile catches error", async () => {
    apiClient.setSession("token", { username: "test" });
    const res = await apiClient.fetchAccountProfile();
    expect(res.success).toBe(false);
  });

  it("updateAccountProfile catches error", async () => {
    apiClient.setSession("token", { username: "test" });
    const res = await apiClient.updateAccountProfile("123", "123");
    expect(res.success).toBe(false);
  });

  it("deleteAccount catches error", async () => {
    apiClient.setSession("token", { username: "test" });
    const res = await apiClient.deleteAccount();
    expect(res.success).toBe(false);
  });

  it("setup2FA network error", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockRejectedValueOnce(new Error("Network"));
    const res = await apiClient.setup2FA();
    expect(res.success).toBe(false);
    expect(res.error).toBe("Network error");
  });

  it("verify2FA network error", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockRejectedValueOnce(new Error("Network"));
    const res = await apiClient.verify2FA("123456");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Network error");
  });

  it("login2FA network error", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network"));
    const res = await apiClient.login2FA("token", "123456");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Network error");
  });

  it("fetchAccountProfile network error", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockRejectedValueOnce(new Error("Network"));
    const res = await apiClient.fetchAccountProfile();
    expect(res.success).toBe(false);
    expect(res.error).toBe("Network error");
  });

  it("updateAccountProfile network error", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockRejectedValueOnce(new Error("Network"));
    const res = await apiClient.updateAccountProfile({});
    expect(res.success).toBe(false);
    expect(res.error).toBe("Network error");
  });

  it("deleteAccount network error", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockRejectedValueOnce(new Error("Network"));
    const res = await apiClient.deleteAccount();
    expect(res.success).toBe(false);
    expect(res.error).toBe("Network error while deleting account");
  });

  it("fetchAccountProfile failure", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch profile" }),
    });
    const res = await apiClient.fetchAccountProfile();
    expect(res.success).toBe(false);
  });

  it("updateAccountProfile failure", async () => {
    apiClient.setSession("token123", { username: "test" });
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to update profile" }),
    });
    const res = await apiClient.updateAccountProfile({});
    expect(res.success).toBe(false);
  });
});
