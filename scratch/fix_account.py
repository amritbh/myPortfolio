import os

path = "src/pages/account/Account.js"
with open(path, "r") as f:
    content = f.read()

# 1. state
content = content.replace(
    "this.state = {\n      address: \"\",",
    "this.state = {\n      username: \"\",\n      email: \"\",\n      name: \"\",\n      address: \"\","
)

# 2. loadProfile
content = content.replace(
    "this.setState({\n        address: result.profile.address || \"\",",
    "this.setState({\n        username: result.profile.username || \"\",\n        email: result.profile.email || \"\",\n        name: result.profile.name || \"\",\n        address: result.profile.address || \"\","
)

# 3. handleSaveProfile
content = content.replace(
    "const { address, phoneNumber } = this.state;\n    const result = await updateAccountProfile(address, phoneNumber);",
    "const { name, address, phoneNumber } = this.state;\n    const result = await updateAccountProfile(name, address, phoneNumber);"
)

# 4. render state destructuring
content = content.replace(
    "const {\n      address,",
    "const {\n      username,\n      email,\n      name,\n      address,"
)

# 5. render inputs
new_inputs = """
                      <div className="account-form-group">
                        <label htmlFor="username" style={{ color: theme.text }}>
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={username}
                          readOnly
                          className="account-input"
                          style={{
                            color: theme.secondaryText,
                            borderColor: `${theme.text}33`,
                            backgroundColor: `${theme.text}0d`,
                            cursor: "not-allowed"
                          }}
                        />
                      </div>
                      <div className="account-form-group">
                        <label htmlFor="email" style={{ color: theme.text }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={email}
                          readOnly
                          className="account-input"
                          style={{
                            color: theme.secondaryText,
                            borderColor: `${theme.text}33`,
                            backgroundColor: `${theme.text}0d`,
                            cursor: "not-allowed"
                          }}
                        />
                      </div>
                      <div className="account-form-group">
                        <label htmlFor="name" style={{ color: theme.text }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={name}
                          onChange={this.handleInputChange}
                          className="account-input"
                          style={{
                            color: theme.text,
                            borderColor: `${theme.text}33`,
                            backgroundColor: theme.body,
                          }}
                          placeholder="Enter your full name"
                        />
                      </div>
"""
content = content.replace(
    "<form onSubmit={this.handleSaveProfile}>\n                      <div className=\"account-form-group\">",
    "<form onSubmit={this.handleSaveProfile}>\n" + new_inputs + "\n                      <div className=\"account-form-group\">"
)

with open(path, "w") as f:
    f.write(content)
print("Account.js updated successfully")
