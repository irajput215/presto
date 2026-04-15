---
description: You are a senior frontend engineer.
---

 Always read and follow AGENTS.md and ARCHITECTURE.md and {./presto/README.md} before making any changes.If they are missing, ask for them.


# Presto Application Workflows

## 1. Authentication & Onboarding Workflow
This workflow manages the entry point of the SPA, ensuring users are authorized before accessing the dashboard.

1.  **Landing Page (`/`)**: 
    * Check for existing `token` in `localStorage`. 
    * If token exists, redirect to `/dashboard`. 
    * If not, display "Login" and "Register" CTAs.
2.  **Registration**:
    * User inputs Name, Email, Password, and Confirm Password.
    * **Logic Check**: `Password === ConfirmPassword`. If false, trigger `ErrorPopup`.
    * **API Call**: `POST /auth/register`.
    * On Success: Store `token`, redirect to `/dashboard`.
3.  **Login**:
    * User inputs Email and Password.
    * **Logic Check**: Form submission on `Button Click` OR `Enter Key`.
    * **API Call**: `POST /auth/login`.
    * On Success: Store `token`, redirect to `/dashboard`.

---

## 2. Presentation Management Workflow
Handles the creation and listing of presentations on the Dashboard.

* **Creation Flow**:
    1.  Click "New Presentation" -> Open Modal.
    2.  Input Name, Description, and Thumbnail (File/URL).
    3.  **API Call**: `POST /presentations/new`.
    4.  **State Update**: Local presentation list updates; Modal closes; New card appears with **2:1 ratio**.
* **Deletion Flow**:
    1.  Click "Delete Presentation" in Editor.
    2.  Open Confirmation Modal ("Are you sure?").
    3.  If "Yes" -> **API Call**: `DELETE /presentations/{id}` -> Redirect to `/dashboard`.

---

## 3. Slide Editor Workflow (Core Logic)
The most complex workflow, managing the dynamic rendering of elements and slide navigation.

### 3.1. Navigation & State Persistence
* **URL Sync**: When a user clicks "Next/Prev" or uses arrow keys, the route updates to `/presentation/:id/:slideNumber`.
* **Boundary Logic**:
    * `If currentSlide === 1`: Disable "Left Arrow".
    * `If currentSlide === totalSlides`: Disable "Right Arrow".
* **Refresh Persistence**: On component mount, `useEffect` reads `:slideNumber` from the URL and fetches the corresponding index from the presentation data.

### 3.2. Element CRUD (Text, Image, Video, Code)
1.  **Addition**: Action Click -> Modal Input -> Element added at `{x: 0, y: 0}`.
2.  **Editing**: 
    * **Double-Click**: Open property modal (Size, Position, Content).
    * **🙉 Move/Resize**: Click once to show 5px handle boxes; drag to update coordinates/dimensions.
3.  **Deletion**: Right-click element -> Filter element out of the current slide's array -> Sync with Backend.

---

## 4. Feature Set 4: Theming & Transitions
* **Global vs. Local Theme**:
    * **Local**: Background applies only to `currentSlideId`.
    * **Global (Default)**: Background applies to all slides where `background === 'default'`.
* **Transition Logic**:
    * On slide change, apply CSS animation class (e.g., `fade-in` or `slide-left`) to the slide container.
    * Preview mode must hide all UI borders and show full-screen transitions.

---

## 5. Automated Testing "Happy Path" Workflow
This follows the requirement for Section 2.6:

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1** | Register User | Redirect to Dashboard, Token saved. |
| **2** | Create Presentation | Card appears in grid with 2:1 ratio. |
| **3** | Update Meta | Name/Thumbnail changes reflected on Card. |
| **4** | Add Slides | Slide count increases; Navigation arrows appear. |
| **5** | Navigation | URL updates to `/2`, `/3` on click; content changes. |
| **6** | Delete | Modal confirms; Redirect to Dashboard; Card gone. |
| **7** | Logout | Token cleared; Redirect to `/`. |
| **8** | Login | Re-enter credentials; Access Dashboard successfully. |

---

## 6. TSC & Linting Compliance Workflow
* **Pre-Commit Hook**: (As seen in your `util/pre-commit.sh`)
    1.  Runs `npm run lint` in `/frontend`.
    2.  Runs `npm run tsc` in `/frontend`.
    3.  If either fails, the commit is blocked to ensure code quality.

---

### Implementation Tip for You:
Since you are using **Vite + TypeScript**, ensure your `Element` type is an interface that can handle the union of all block types:
```typescript
interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'code';
  x: number; // 0-100
  y: number; // 0-100
  width: number; // 0-100
  height: number; // 0-100
  content: string;
  // ... other properties like fontSize, color, etc.
}
```
