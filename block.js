(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { createElement: el, Fragment, useState, useEffect } = wp.element;
	const { InspectorControls } = wp.blockEditor;
	const { PanelBody, TextControl, Notice, Spinner, ToggleControl } = wp.components;

	// Register the GitHub Repo Card Block
	registerBlockType('ghrc/github-repo-card', {
		title: 'GitHub Repo Card Block',
		icon: 'media-code',
		category: 'embed',
		attributes: {
			repoUrl: {
				type: 'string',
				default: ''
			},
			repoName: {
				type: 'string',
				default: ''
			},
			ownerName: {
				type: 'string',
				default: ''
			},
			ownerAvatar: {
				type: 'string',
				default: ''
			},
			description: {
				type: 'string',
				default: ''
			},
			stars: {
				type: 'number',
				default: 0
			},
			watchers: {
				type: 'number',
				default: 0
			},
			forks: {
				type: 'number',
				default: 0
			},
			issues: {
				type: 'number',
				default: 0
			},
			contributors: {
				type: 'number',
				default: 0
			},
			showContributors: {
				type: 'boolean',
				default: true
			},
			showStars: {
				type: 'boolean',
				default: true
			},
			showWatchers: {
				type: 'boolean',
				default: true
			},
			showForks: {
				type: 'boolean',
				default: true
			},
			showIssues: {
				type: 'boolean',
				default: true
			},
			errorMessage: {
				type: 'string',
				default: ''
			}
		},
		edit({ attributes, setAttributes }) {
			// State to manage the loading spinner
			const [loading, setLoading] = useState(false);

			// Function to validate the repository URL and fetch data from GitHub API
			const validateRepo = async (repoUrl) => {
				setLoading(true);

				// Remove trailing slash from the repo url if it exists
				const normalizedRepoUrl = repoUrl.endsWith('/') ? repoUrl.slice(0, -1) : repoUrl;

				const regex = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
				if (!regex.test(normalizedRepoUrl)) {
					// If the URL is not valid, set an error message and reset attributes
					setAttributes({ errorMessage: 'Please enter a valid GitHub repository URL.' });
					setAttributes({
						repoName: '',
						ownerName: '',
						ownerAvatar: '',
						description: '',
						stars: 0,
						watchers: 0,
						forks: 0,
						issues: 0,
						contributors: 0
					});
					setLoading(false);
					return;
				}

				const urlParts = normalizedRepoUrl.split('/');
				const owner = urlParts[urlParts.length - 2];
				const repo = urlParts[urlParts.length - 1];

				try {
					// Fetch repository data from GitHub API
					const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
					if (response.ok) {
						const data = await response.json();

						// Fetch contributors data
						const contributorsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`);
						let contributorsCount = 0;
						if (contributorsResponse.ok) {
							const contributorsData = await contributorsResponse.json();
							contributorsCount = contributorsData.length;
						}

						// Update the block attributes with the fetched data
						setAttributes({
							repoName: data.name,
							ownerName: data.owner.login,
							ownerAvatar: data.owner.avatar_url,
							description: data.description,
							stars: data.stargazers_count,
							watchers: data.watchers_count,
							forks: data.forks_count,
							issues: data.open_issues_count,
							contributors: contributorsCount,
							errorMessage: ''
						});
					} else {
						// If the repository is not found, set an error message
						setAttributes({ errorMessage: 'Repository not found.', repoName: '', ownerName: '', ownerAvatar: '', description: '', stars: 0, watchers: 0, forks: 0, issues: 0, contributors: 0 });
					}
				} catch (error) {
					// Handle any errors that occur during the fetch process
					setAttributes({ errorMessage: 'Error fetching repository data.', repoName: '', ownerName: '', ownerAvatar: '', description: '', stars: 0, watchers: 0, forks: 0, issues: 0, contributors: 0 });
				}
				setLoading(false); // Stop the loading spinner
			};

			// Fetch data when the repoUrl attribute changes
			useEffect(() => {
				if (attributes.repoUrl) {
					validateRepo(attributes.repoUrl);
				}
			}, [attributes.repoUrl]);

			// Render the block in the editor
			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: 'GitHub Repository URL' },
						el(TextControl, {
							label: 'Repository URL',
							value: attributes.repoUrl,
							onChange: (repoUrl) => setAttributes({ repoUrl }),
							placeholder: 'Enter GitHub repo URL',
							disabled: loading // Disable input while loading
						}),
						attributes.errorMessage && el(Notice, {
							status: 'error',
							isDismissible: false,
						}, attributes.errorMessage)
					),
					el(
						PanelBody,
						{ title: 'Display Options', initialOpen: false },
						el(ToggleControl, {
							label: 'Show Contributors',
							checked: attributes.showContributors,
							onChange: (value) => setAttributes({ showContributors: value })
						}),
						el(ToggleControl, {
							label: 'Show Stars',
							checked: attributes.showStars,
							onChange: (value) => setAttributes({ showStars: value })
						}),
						el(ToggleControl, {
							label: 'Show Watchers',
							checked: attributes.showWatchers,
							onChange: (value) => setAttributes({ showWatchers: value })
						}),
						el(ToggleControl, {
							label: 'Show Forks',
							checked: attributes.showForks,
							onChange: (value) => setAttributes({ showForks: value })
						}),
						el(ToggleControl, {
							label: 'Show Issues',
							checked: attributes.showIssues,
							onChange: (value) => setAttributes({ showIssues: value })
						})
					)
				),
				el(
					'div',
					{ className: 'github-repo-card' },
					loading ? el(Spinner, null) :
						attributes.repoName ? el(Fragment, null,
							el('div', { className: 'repo-card-header' },
								el('img', { src: attributes.ownerAvatar, alt: `${attributes.ownerName} avatar`, className: 'repo-owner-avatar' }),
								el('div', { className: 'repo-title' }, el('a', { href: attributes.repoUrl, target: '_blank' }, attributes.repoName))
							),
							el('p', null, el('strong', null, 'Owner: '), attributes.ownerName),
							el('p', null, el('strong', null, 'Description: '), attributes.description),
							el('div', { className: 'repo-stats' },
								attributes.showContributors && el('span', { className: 'repo-stat' },
									el('img', { src: `${ghrc_plugin.pluginUrl}images/contributor.svg`, className: 'icon', alt: 'Contributors' }),
									` ${attributes.contributors}`,
									el('span', { className: 'stat-name' }, ' Contributors')
								),
								attributes.showStars && el('span', { className: 'repo-stat' },
									el('img', { src: `${ghrc_plugin.pluginUrl}images/star.svg`, className: 'icon', alt: 'Stars' }),
									` ${attributes.stars}`,
									el('span', { className: 'stat-name' }, ' Stars')
								),
								attributes.showWatchers && el('span', { className: 'repo-stat' },
									el('img', { src: `${ghrc_plugin.pluginUrl}images/watch.svg`, className: 'icon', alt: 'Watchers' }),
									` ${attributes.watchers}`,
									el('span', { className: 'stat-name' }, ' Watchers')
								),
								attributes.showForks && el('span', { className: 'repo-stat' },
									el('img', { src: `${ghrc_plugin.pluginUrl}images/fork.svg`, className: 'icon', alt: 'Forks' }),
									` ${attributes.forks}`,
									el('span', { className: 'stat-name' }, ' Forks')
								),
								attributes.showIssues && el('span', { className: 'repo-stat' },
									el('img', { src: `${ghrc_plugin.pluginUrl}images/issue.svg`, className: 'icon', alt: 'Issues' }),
									` ${attributes.issues}`,
									el('span', { className: 'stat-name' }, ' Issues')
								)
							)
						) :
							el('p', null, 'Enter a valid GitHub repository URL in the block settings.')
				)
			);
		},
		save() {
			return null; // Rendered in PHP, no need to save output in JS
		}
	});
})(window.wp);
