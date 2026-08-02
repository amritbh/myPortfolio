import os

# Fix Account.css
path_css = "src/pages/account/Account.css"
with open(path_css, "r") as f:
    css_content = f.read()

css_content = css_content.replace("color: #1d8348;", "color: #0f5132;")
css_content = css_content.replace("color: #c0392b;", "color: #842029;")

with open(path_css, "w") as f:
    f.write(css_content)

# Fix apiClient.test.js
path_js = "src/utils/apiClient.test.js"
with open(path_js, "r") as f:
    js_content = f.read()

idx = js_content.rfind("});")

tests_to_add = """
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
"""

if idx != -1:
    new_content = js_content[:idx] + tests_to_add + js_content[idx:]
    with open(path_js, "w") as f:
        f.write(new_content)
    print("Added tests for apiClient.test.js and fixed Account.css")
else:
    print("Failed to find end of describe block")
