import os
import re

def fix_account_css():
    path = "src/pages/account/Account.css"
    with open(path, "r") as f:
        content = f.read()
    content = content.replace("background-color: #2d7af1;", "background-color: #1a5ab5;")
    content = content.replace("background-color: #f12d2d;", "background-color: #d32f2f;")
    content = content.replace("color: #2ecc71;", "color: #1d8348;")
    content = content.replace("color: #e74c3c;", "color: #c0392b;")
    with open(path, "w") as f:
        f.write(content)
    print("Fixed Account.css")

def fix_account_js():
    path = "src/pages/account/Account.js"
    with open(path, "r") as f:
        content = f.read()
    
    # Fix labels
    content = content.replace('<label style={{ color: theme.text }}>Address</label>', '<label htmlFor="address" style={{ color: theme.text }}>Address</label>')
    content = content.replace('name="address"', 'id="address"\n                          name="address"')
    
    content = content.replace('<label style={{ color: theme.text }}>\n                          Phone Number\n                        </label>', '<label htmlFor="phoneNumber" style={{ color: theme.text }}>\n                          Phone Number\n                        </label>')
    content = content.replace('name="phoneNumber"', 'id="phoneNumber"\n                          name="phoneNumber"')
    
    # Fix buttons without type
    content = re.sub(r'<button\s+class', '<button type="button" class', content)
    content = re.sub(r'<button\s+onClick', '<button type="button" onClick', content)
    
    with open(path, "w") as f:
        f.write(content)
    print("Fixed Account.js")

def fix_header_js():
    path = "src/components/header/Header.js"
    with open(path, "r") as f:
        content = f.read()
    content = re.sub(r'<button\s+onClick', '<button type="button" onClick', content)
    with open(path, "w") as f:
        f.write(content)
    print("Fixed Header.js")

def fix_app_py():
    path = "infra/modules/backend/src/app.py"
    with open(path, "r") as f:
        content = f.read()
        
    # Add constants
    constant_code = "\nBEARER_PREFIX = 'Bearer '\nAUTH_ACCOUNT_ROUTE = '/auth/account'\n\n"
    content = content.replace("TOKEN_EXPIRATION_SECONDS = 8 * 60 * 60 # 8 hours\n", "TOKEN_EXPIRATION_SECONDS = 8 * 60 * 60 # 8 hours\n" + constant_code)
    
    content = content.replace("'Bearer '", "BEARER_PREFIX")
    content = content.replace("'/auth/account'", "AUTH_ACCOUNT_ROUTE")
    
    with open(path, "w") as f:
        f.write(content)
    print("Fixed app.py")

def fix_apiclient_js():
    path = "src/utils/apiClient.js"
    with open(path, "r") as f:
        content = f.read()
    
    # We will search for all catch (err) blocks and add console.error
    # Wait, some blocks are: catch (err) {\n    return { success: false, error: "Network error" };\n  }
    # We can just do a regex replace
    content = re.sub(r'catch \(err\) \{\n\s+return', 'catch (err) {\n    console.error("API Error:", err);\n    return', content)
    
    with open(path, "w") as f:
        f.write(content)
    print("Fixed apiClient.js")

fix_account_css()
fix_account_js()
fix_header_js()
fix_app_py()
fix_apiclient_js()
