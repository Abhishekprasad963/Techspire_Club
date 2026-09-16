# TECHSPIRE

TECHSPIRE is a student-run college technical club website built with static HTML, CSS, and JavaScript.

## Pages

- `index.html` - Home page, events preview, resources, and contact form
- `event2.html` - Events page with animated shader background
- `gallery.html` - Event photo gallery and lightbox
- `team.html` - Team and leadership page
- `join.html` - Club membership application form

## Run Locally

The site can be previewed without installing dependencies:

```bash
python -m http.server 3000
```

Open <http://localhost:3000/index.html> in a browser.

The project also contains `server.js` for the contact API, but it requires the Node.js dependencies listed in that file to be installed first.

## Forms And Google Sheets

The website uses one Google Apps Script web-app deployment for both forms.

Create one Google Spreadsheet with two tabs named exactly:

- `Applications`
- `Contact`

The `Applications` tab stores:

```text
Timestamp | Full Name | Email | Student ID | Session | Year | Specialization | Resume Link
```

The `Contact` tab stores:

```text
Timestamp | Name | Email | Message
```

The Google Apps Script `doPost(e)` function should route requests based on the `sheet` field:

- `sheet: "Applications"` for membership applications
- `sheet: "Contact"` for homepage contact messages

Set the Apps Script deployment to:

- Execute as: **Me**
- Who has access: **Anyone**

After changing Apps Script code, create a new deployment version. The web-app URL must match the URL configured in both `index.html` and `join.html`.

## Resume Links

Membership applicants paste a Google Drive or OneDrive resume link. The file should be shared as:

```text
Anyone with the link can view
```

The site stores the link, not the uploaded file itself.

## Admin Applications

The membership page keeps a local browser backup in `localStorage` under:

```text
techspire_submissions
```

The small admin lock on `join.html` opens the submissions dashboard. The current client-side password is `techspire2025`; this is suitable only for a demo and should be replaced with server-side authentication for production.

The dashboard exports submissions as CSV files that can be opened in Excel.

## Assets

Images and other static assets are stored in the project root and under `Assets/`.

## Notes

- This is not currently a React, TypeScript, Tailwind, or shadcn project.
- Existing navigation links and page-specific scripts should be preserved when making changes.
- The current contact and application forms depend on the deployed Google Apps Script being available and correctly configured.
