# Study Task Manager

Study Task Manager is a React application for organizing study assignments. It uses a simulated asynchronous API to load, create, update, and delete tasks. Task data is stored in the browser's `localStorage` through the API.

## Features

- View a list of study tasks and load task details asynchronously.
- Create, edit, and delete tasks.
- Mark tasks as completed or reopen them.
- View task information, including title, description, subject, priority, due date, estimated hours, and status.
- Reload the task list.
- Display loading, error, empty, and success states.
- Handle request delays and prevent outdated responses from appearing when switching between tasks.
- Keep task updates associated with the correct item during asynchronous operations.
- Use a responsive layout for desktop and mobile screens.

## Technologies

- React
- JavaScript
- Vite
- CSS
- Simulated Promise-based API
- Browser `localStorage`

## Getting Started

### Requirements

Install a recent version of [Node.js](https://nodejs.org/) with npm.

### Run Locally

1. Open the project folder in VS Code or a terminal.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the URL shown in the terminal, usually `http://localhost:5173/`.

### Production Build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
study-task-manager/
├── index.html
├── package.json
├── src/
│   ├── api/
│   │   ├── fakeApi.js
│   │   ├── initial-data-sample.js
│   │   └── settings.js
│   ├── components/
│   │   └── TaskForm.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
└── README.md
```

- `src/App.jsx`: Task list, selected task details, React state, effects, and API actions.
- `src/components/TaskForm.jsx`: Form for creating and editing tasks.
- `src/api/fakeApi.js`: Simulated asynchronous API.
- `src/api/initial-data-sample.js`: Initial task data.
- `src/api/settings.js`: API delay, error probability, and storage settings.
- `src/styles.css`: Application styling and responsive layout.

## Asynchronous Behavior

The simulated API uses Promises, randomized delays, and occasional errors. The application loads the task list using `useEffect` and loads a selected task's details in a separate effect.

Effect cleanup prevents responses from previous selections from replacing the current task details. Task action handlers capture the target task ID before starting an asynchronous request, and action buttons are disabled while an update is in progress.

The API creates a task with a name and description first. The application then saves its additional fields through `updateItem()`.

## Deployment

You can deploy the project using [Vercel](https://vercel.com/):

1. Push the project to a GitHub repository.
2. Import the repository into Vercel.
3. Select **Vite** as the framework preset.
4. Use `npm run build` as the build command and `dist` as the output directory.
5. Deploy and open the generated application URL.

Because the API stores data in browser `localStorage`, tasks are saved separately in each browser rather than in a shared online database.

## Troubleshooting

If the page is blank, check the terminal and the browser developer console for errors. Make sure `npm install` has completed and restart the development server with `npm run dev`.

To reset the sample tasks, remove the `fake-init-data` key from your browser's Local Storage and refresh the page. This also deletes tasks you have added in that browser.
