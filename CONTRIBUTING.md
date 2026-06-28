# Contributing to KnowledgeFlow AI

We welcome contributions from the community! This guide helps you set up local development, follow coding standards, and submit pull requests.

---

## Code of Conduct
Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) to keep this project welcoming and inclusive for everyone.

---

## Getting Started

1. **Fork & Clone**: Fork the repository on GitHub and clone your fork locally:
   ```bash
   git clone https://github.com/Yashwant9871/knowledgeflow-ai.git
   ```
2. **Copy Config**: Copy `.env.example` to `.env` and adjust database/auth variables.
3. **Spin Up Environment**: Use Docker Compose to spin up all backend/frontend containers:
   ```bash
   docker-compose up -d --build
   ```

---

## Coding Standards

### Backend Guidelines (Python / FastAPI)
* Follow PEP 8 style conventions.
* Add type annotations to function parameters and return types.
* Verify your changes compile successfully:
  ```bash
  python -m compileall backend
  ```
* Write database models in `backend/app/models.py` and map them via Alembic migrations. Do not call `create_all()`.

### Frontend Guidelines (React / TypeScript)
* Use TypeScript for all components and utilities.
* Follow the folder layout: place route definitions in `src/routes/` and reusable hooks in `src/hooks/`.
* Verify that the production build compiles successfully:
  ```bash
  npm run build
  ```

---

## Submitting Pull Requests

1. **Create Branch**: Create a feature branch off `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Write Commits**: Write clear, descriptive commit messages.
3. **Verify Tests**: Ensure local seeding, auth validation, and compilations pass without errors.
4. **Push & PR**: Push to your fork and submit a Pull Request to the `main` branch. Provide a detailed summary of your changes in the PR description.
