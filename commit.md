# Git Commit & Tag Workflow Guide

This guide describes a safe, stepwise workflow for committing and tagging your implementation steps in this project. It ensures you can always fetch, revert, or continue from any step without disturbing your main branch or initial commit. We follow an atomic, feature-specific branch strategy that integrates clearly with the main repository.

---

## 1. Create a New Feature Branch

Always work on a new branch for each feature or change step. Use descriptive branch names:
```bash
git checkout -b feature/your-feature-name
```

---

## 2. Make Your Changes

Edit, add, or remove files as needed. Ensure that each commit represents one atomic feature or change.

---

## 3. Stage and Commit Your Changes

Add only the changes relevant to a specific step and commit with a clear, conventional commit message:
```bash
git add .
git commit -m "feat: implement [short description of this step]"
```

---

## 4. Push Your Branch to Remote

Push your branch to GitHub to keep your work backed up:
```bash
git push origin feature/your-feature-name
```

---

## 5. Tag Each Atomic Step

Tag each meaningful implementation step. Tags act as snapshots:
```bash
git tag step-1-[short-description]
git push origin step-1-[short-description]
```
For subsequent steps, use `step-2-...`, `step-3-...`, etc.

---

## 6. Continue Working

For each new atomic change:
- Update your code.
- Stage and commit only the changes relevant to that step.
- Push the branch.
- Add and push a new tag with an incremented step name.

Example:
```bash
git add .
git commit -m "feat: implement email verification step 1"
git tag step-1-auth-email-verification
git push origin step-1-auth-email-verification

# After more changes:
git add .
git commit -m "feat: implement email verification step 2"
git tag step-2-auth-email-verification
git push origin step-2-auth-email-verification
```

---

## 7. Merging with the Main Repository

Once your feature is complete and approved:
1. **Open a Pull Request (PR):**  
   Create a PR from your feature branch into `main` for review and automated tests.

2. **Merge the PR:**  
   Once approved, merge the branch:
   ```bash
   git checkout main
   git pull origin main
   git merge feature/your-feature-name
   git push origin main
   ```

3. **(Optional) Tag the Main Branch:**  
   Mark the merged state with a release tag:
   ```bash
   git tag release-[version-or-description]
   git push origin release-[version-or-description]
   ```

---

## 8. Fetching or Reverting to a Tagged Step

### Fetch a Specific Tag
```bash
git fetch --all --tags
git checkout tags/step-1-[short-description] -b restore-step-1
```

### List All Tags
```bash
git tag
```

### Revert to a Tagged Step
*Warning: This will overwrite local changes!*
```bash
git checkout main
git reset --hard step-1-[short-description]
```

---

## Best Practices

- Use descriptive branch names and commit messages following conventional commit guidelines.
- Tag after every meaningful step to create clear snapshots.
- Always push tags and branches to remote to keep your work safe.
- Use pull requests to merge features into the main branch, ensuring code reviews and test passes.
- Revert or fetch tags if you need to inspect or roll back specific changes.

---

This atomic and tag-based workflow ensures a reliable, traceable, and reversible development process, aligning with our project's modular architecture.