# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/bac3f6f8-0eb8-4bb3-9c7c-87bc4b02579f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/bac3f6f8-0eb8-4bb3-9c7c-87bc4b02579f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- **LM Studio (local LLM server, model: deepseek-r1-distill-qwen-7b) for AI analysis**

## AI Model Setup (LM Studio)

This project uses a local LLM via [LM Studio](https://lmstudio.ai/) for all AI-powered analysis (no Hugging Face or cloud models required).

**Model:** `deepseek-r1-distill-qwen-7b`

**How to run locally:**

1. Download and install [LM Studio](https://lmstudio.ai/).
2. Download the `deepseek-r1-distill-qwen-7b` model in LM Studio.
3. Start the LM Studio server (default: http://localhost:1234).
4. (Optional) If your LM Studio server is running on a different host/port, set the environment variable `LM_STUDIO_URL` accordingly (e.g., `LM_STUDIO_URL=http://localhost:1234`).
5. The Supabase Edge Function will send analysis requests to your local LM Studio server.

**No Hugging Face API or cloud keys are required.**

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bac3f6f8-0eb8-4bb3-9c7c-87bc4b02579f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Running Supabase Edge Functions Locally for LM Studio Integration

To use the AI analysis feature, you must run the Supabase Edge Function locally so it can connect to your local LM Studio server.

### Steps:

1. **Start LM Studio**
   - Open LM Studio and load the `deepseek-r1-distill-qwen-7b` model.
   - Make sure the server is running (default: http://127.0.0.1:1234).
   - Test in your browser: [http://127.0.0.1:1234/v1/models](http://127.0.0.1:1234/v1/models)

2. **Start Supabase Edge Functions locally**
   - Install the Supabase CLI if you haven't already: https://supabase.com/docs/guides/cli
   - In your project root, run:
     ```sh
     supabase functions serve --env-file ./supabase/.env
     ```
   - This will start the Edge Function locally, allowing it to connect to LM Studio on `127.0.0.1`.

3. **Run your frontend as usual**
   - In another terminal, run:
     ```sh
     npm run dev
     ```

4. **Test the AI analysis**
   - Use the app as normal. When you trigger an analysis, you should see logs in both LM Studio and the Supabase function terminal.

### Troubleshooting

- **No logs in LM Studio?**
  - Make sure you are running the Edge Function locally (not on Supabase Cloud).
  - Make sure LM Studio is running and listening on the correct port.
  - Test with: `curl http://127.0.0.1:1234/v1/models`
- **Edge Function errors about connection refused?**
  - LM Studio is not running, or the port is wrong.
- **Still not working?**
  - Check your firewall or antivirus settings.
  - Make sure nothing else is using port 1234.

**Note:** Supabase Cloud Functions cannot access your local LM Studio. For local development, always use `supabase functions serve`.
