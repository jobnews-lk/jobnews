# 📘 JobNews.lk Facebook Access Token Renewal & Permanent Token Manual

> **Note:** Long-Lived Page Access Tokens generated via Meta Developer Tools are valid for 60 Days (Expiration: October 15, 2026).
> Follow this official guide to renew the token in under 1 minute or convert it into a Permanent Never-Expiring System User Token.

---

## 📌 Meta App & Facebook Page Credentials

| Setting Name | Value |
| :--- | :--- |
| **Meta App Name** | `JobNews Auto Poster` |
| **Meta App ID** | `1593091269083965` |
| **Facebook Page Name** | `JobNews LK` |
| **Facebook Page ID** | `1129474863599981` |
| **Required Permissions** | `pages_manage_posts`, `pages_read_engagement`, `pages_show_list` |

---

## ⚡ Method 1: Quick 60-Day Token Renewal (Takes 1 Minute)

When October 2026 approaches (or whenever the token expires), follow these 3 steps:

1. **Step 1: Generate Short-Lived Token**
   - Open Graph API Explorer: [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer/)
   - Ensure Meta App is set to **`JobNews Auto Poster`**.
   - Under `Permissions`, ensure `pages_manage_posts`, `pages_read_engagement`, `pages_show_list` are selected.
   - Click **`Generate Access Token`** and confirm `Continue as Kusal`.
   - Copy the generated Access Token string.

2. **Step 2: Extend to 60-Day Long-Lived Token**
   - Open Access Token Debugger: [developers.facebook.com/tools/debug/accesstoken](https://developers.facebook.com/tools/debug/accesstoken)
   - Paste the copied token into the text box and click **`Debug`**.
   - Scroll to the bottom of the page and click the blue button **`Extend Access Token`**.
   - Copy the new 60-day token generated in the green text box.

3. **Step 3: Update `.env` File**
   - Open the project `.env` file (`c:\Users\Lenovo\Desktop\My Website\project\.env`).
   - Replace `VITE_FACEBOOK_PAGE_ACCESS_TOKEN` with the newly copied token:
     ```env
     VITE_FACEBOOK_PAGE_ID=1129474863599981
     VITE_FACEBOOK_PAGE_ACCESS_TOKEN=<your_new_token>
     ```

---

## 🏛️ Method 2: Create Permanent Never-Expiring Token (Recommended)

To make the token **NEVER expire** so you don't need to renew it every 60 days:

1. **Step 1: Open Meta Business Suite Settings**
   - Go to [business.facebook.com/settings](https://business.facebook.com/settings)
   - Select Business Account: **`JobNews LK`**

2. **Step 2: Create System User**
   - Go to **Users ➔ System Users** in the left sidebar menu.
   - Click **`Add`**.
   - System User Name: `AutoPoster Bot`
   - System User Role: `Admin`
   - Click **`Create System User`**.

3. **Step 3: Assign Page Assets**
   - Click **`Add Assets`** for the new System User.
   - Select **Pages ➔ JobNews LK**.
   - Enable full control (**`Full Control / Everything`**) and click **`Save Changes`**.

4. **Step 4: Generate Permanent Token**
   - Click **`Generate New Token`**.
   - Select App: **`JobNews Auto Poster`**.
   - Token Expiration: Select **`Never`** (or Permanent).
   - Check permissions: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`.
   - Click **`Generate Token`**.
   - Copy this token and update `VITE_FACEBOOK_PAGE_ACCESS_TOKEN` in `.env` once and for all!
