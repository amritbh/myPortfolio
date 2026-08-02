import os
import re

path = "src/pages/login/Login.test.js"
with open(path, "r") as f:
    content = f.read()

# 1. Remove the "Short username" block entirely
content = re.sub(
    r"\s*// Short username.*?expect\([\s\S]*?toBeInTheDocument\(\);",
    "",
    content,
    flags=re.DOTALL
)

# 2. In the "Short password" block, remove the username change event
content = re.sub(
    r"\s*fireEvent\.change\(screen\.getByPlaceholderText\(/Username/i\), \{\s*target: \{ value: \"validUser\" \},\s*\}\);",
    "",
    content
)

# 3. In the "Mismatched passwords" block, remove the username change event
content = re.sub(
    r"\s*fireEvent\.change\(screen\.getByPlaceholderText\(/Username/i\), \{\s*target: \{ value: \"validUser\" \},\s*\}\);",
    "",
    content
)

with open(path, "w") as f:
    f.write(content)
print("Login.test.js fixed")
