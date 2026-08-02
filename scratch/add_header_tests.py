import os

path = "src/components/header/Header.test.js"
with open(path, "r") as f:
    content = f.read()

idx = content.rfind("});")

tests_to_add = """
  it("handles Change Password click failure", async () => {
    jest.spyOn(apiClient, "getStoredUser").mockReturnValue({ username: "test" });
    jest.spyOn(apiClient, "requestPasswordReset").mockResolvedValue({ success: false, error: "bad error" });
    window.alert = jest.fn();

    renderWithRouter(<Header theme={mockTheme} />);
    fireEvent.mouseEnter(screen.getByText(/Account/i));
    
    const changePasswordBtn = screen.getByText(/Change Password/i);
    fireEvent.click(changePasswordBtn);
    await screen.findByText(/Change Password/i); // wait for event tick
    
    expect(window.alert).toHaveBeenCalledWith("Failed to send password reset link: bad error");
  });

  it("handles Change Password missing email/username", async () => {
    jest.spyOn(apiClient, "getStoredUser").mockReturnValue({ role: "admin" });
    window.alert = jest.fn();

    renderWithRouter(<Header theme={mockTheme} />);
    fireEvent.mouseEnter(screen.getByText(/Account/i));
    
    const changePasswordBtn = screen.getByText(/Change Password/i);
    fireEvent.click(changePasswordBtn);
    
    expect(window.alert).toHaveBeenCalledWith("Unable to find your email address. Please log out and use the Forgot Password link.");
  });

  it("closes dropdown on mouse leave", () => {
    jest.spyOn(apiClient, "getStoredUser").mockReturnValue({ username: "test" });
    renderWithRouter(<Header theme={mockTheme} />);
    
    const accountToggle = screen.getByText(/Account/i);
    fireEvent.mouseEnter(accountToggle);
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    
    // The container has the onMouseLeave
    const container = accountToggle.closest(".account-dropdown-container");
    fireEvent.mouseLeave(container);
    
    expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();
  });
"""

if idx != -1:
    new_content = content[:idx] + tests_to_add + content[idx:]
    with open(path, "w") as f:
        f.write(new_content)
    print("Added Header failure tests")
else:
    print("Failed to find end of describe block")
