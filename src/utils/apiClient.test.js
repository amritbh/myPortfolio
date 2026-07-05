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

  it("session functions", () => {
    apiClient.setSession("token123", { username: "test" });
    expect(apiClient.getStoredToken()).toBe("token123");
    expect(apiClient.getStoredUser().username).toBe("test");
    apiClient.clearSession();
    expect(apiClient.getStoredToken()).toBeNull();
    expect(apiClient.getStoredUser()).toBeNull();
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
});
