 # Contributing to RememberED

Thanks for your interest in contributing to RememberED! Before you submit a pull request or open an issue, please take a moment to read our contribution guidelines. By participating in this project, you agree to abide by its rules and code of conduct.

### TL;DR: What you should do

* **Open issues** for bugs, feature requests, and other improvements.
* **Fork the repository**, make changes, and create a new branch for each feature or bugfix.
* **Write tests** to cover any added functionality. Make sure all existing tests pass before submitting a PR.
* **Include clear commit messages**. Use the imperative present tense ("Add test", not "Added test").
* **Keep your contributions focused**: one pull request per issue. Squash commits if necessary.
* **Submit early, submit often**: don't wait until everything is perfect. Smaller, incremental pull requests are easier to review.
* **Be respectful**: follow the Code of Conduct when interacting with others.

### TL;DR: What you shouldn't do

* **Don't break existing functionality.** If it ain't broke, don't fix it.
* **Don't mix different types of changes** in a single pull request. Keep things atomic.
* **Don't use force push** on branches that have been pushed to GitHub. It breaks history.
* **Don't spam:** avoid excessive commentary or pinging maintainers unnecessarily. Be patient.

---

### Detailed Guidelines

#### Bug Reports & Feature Requests

Before creating a bug report or feature request, first search through the [issue tracker](https://github.com/LyubomirT/RememberED/issues) to see if someone else has already reported or requested the same thing. If so, feel free to add a thumbs up reaction or leave a comment indicating that you would like to see it addressed as well. Otherwise, go ahead and open a new issue using the appropriate template.

When reporting bugs, include steps to reproduce the problem, expected behavior, actual behavior, and any relevant logs or screenshots. For feature requests, explain why the proposed change would benefit users and how it aligns with the goals of RememberED.

#### Making Changes

1. Fork the repository on GitHub.
2. Create a new branch from `main` for your changes. Name it descriptively, e.g., `feature-new-thing`, `bugfix-broken-stuff`.
3. Implement your changes, making sure to write tests covering any new functionality. Run all existing tests to ensure nothing was accidentally broken.
4. Commit your changes using a clear and concise message describing what you did. Follow these conventions:
   - Capitalize the subject line.
   - Do not end the subject line with a period.
   - Use the imperative mood in the subject line.
   - Limit the subject line to 50 characters or fewer.
   - Wrap the body at 72 characters.
   - Use the present tense ("Add feature" instead of "Added feature").

Here's an example commit message format:
```vbnet
Capitalized Subject Line

Body of commit message goes here. Explain what and why, keep it brief but informative.
Fixes #issue_number
```
5. Push your changes to your fork.
6. Open a pull request against `main` on the original repository. Provide a detailed explanation of your changes and their benefits.

#### Review Process

Once you've submitted a pull request, a maintainer will review it as soon as possible. We may ask questions, suggest improvements, or request additional information. Please respond promptly and cooperatively. Once we approve your pull request, we'll merge it into the main branch. Thank you for helping improve RememberED!