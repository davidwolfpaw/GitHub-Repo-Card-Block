# Custom Emoji Replacer

| **Description**       | Replace emojis with custom images in your site content.                              |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Contributors**      | wolfpaw                                                                              |
| **Donate link**       | [https://david.garden/plugins](https://david.garden/plugins)                         |
| **Tags**              | GitHub, block, Gutenberg, repository, embed                                          |
| **Requires at least** | 5.0                                                                                  |
| **Tested up to**      | 6.6                                                                                  |
| **Requires PHP**      | 7.0                                                                                  |
| **Stable tag**        | 1.0                                                                                  |
| **License**           | GPLv3 or later                                                                       |
| **License URI**       | [http://www.gnu.org/licenses/gpl-3.0.html](http://www.gnu.org/licenses/gpl-3.0.html) |


## Description

The GitHub Repo Card Block is a custom WordPress block that allows you to display detailed information about a GitHub repository directly within your posts or pages.

The block fetches data from the GitHub API and displays key details such as the repository's name, owner, description, and statistics like stars, forks, watchers, issues, and contributors.

## Features

- **Display GitHub Repository Information**: Easily display GitHub repository details in your WordPress content.
- **Dynamic Fetching**: The block fetches live data from the GitHub API.
- **Consistent Styling**: The block is styled consistently across both the WordPress editor and the frontend. Styling is minimal to work with your theme.

## Installation

1. Upload the `github-repo-card-block` directory to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Ensure you have the latest version of WordPress installed (minimum version 5.0).

## Usage

1. In the WordPress editor, search for "GitHub Repo Card Block" in the block inserter.
2. Add the block to your post or page.
3. Enter the GitHub repository URL in the block settings.
4. The block will automatically fetch and display the repository's details, including the number of stars, forks, watchers, issues, and contributors.

## Frequently Asked Questions

### How does the block fetch data?

The block uses the GitHub API to fetch repository details. When a valid GitHub repository URL is entered, the block dynamically retrieves and displays the relevant information.

### Does the block work with all GitHub repositories?

The block is designed to work with public GitHub repositories. Ensure the repository URL you enter is accessible and follows the format `https://github.com/owner/repository`.

## Screenshots

**Frontend Display**: How the block appears on the frontend.
![Screenshot of frontend of GitHub Repo Card Block, showing two blocks from two different owners](images/ghrc-frontend-screenshot.jpg "Screenshot of frontend of GitHub Repo Card Block, showing two blocks from two different owners")

[GitHub SVGs from github.com](https://docs.github.com/en/site-policy/other-site-policies/github-logo-policy)

## Changelog

### 1.0
* Initial release of the GitHub Repo Card Block plugin.

## Todos

Planned upgrades to the plugin include:
- The ability to selectively display count of stars, forks, watchers, issues, and contributors
- GitHub authentication to avoid rate-limiting
