import os

path = "src/utils/apiClient.test.js"

with open(path, "r") as f:
    content = f.read()

# Find the last closing bracket for the describe block
idx = content.rfind("});")

tests_to_add = """
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
    expect(res.error).toBe("Network error");
  });
"""

if idx != -1:
    new_content = content[:idx] + tests_to_add + content[idx:]
    with open(path, "w") as f:
        f.write(new_content)
    print("Tests added to apiClient.test.js")
else:
    print("Failed to find end of describe block")
