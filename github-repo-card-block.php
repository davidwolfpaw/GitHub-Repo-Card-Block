<?php
/**
 * Plugin Name: GitHub Repo Card Block
 * Description: A block to display a GitHub repository's information, including contributors, stars, forks, and more.
 * Version: 1.0
 * Author: FixUpFox
 * Text Domain: ghrc
 */

/**
 * Registers the GitHub Repo Card Block and enqueues the necessary editor script.
 */
function github_repo_card_block_register() {
	// Register the editor script.
	wp_register_script(
		'github-repo-card-block-editor-script',
		plugins_url( 'block.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element', 'wp-editor' ),
		'1.0.0',
		true
	);

	// Localize the script with the plugin URL
	wp_localize_script(
		'github-repo-card-block-editor-script',
		'ghrc_plugin',
		array(
			'pluginUrl' => plugins_url( '/', __FILE__ ),
		)
	);

	// Register the block with attributes and a render callback.
	register_block_type(
		'ghrc/github-repo-card',
		array(
			'editor_script'   => 'github-repo-card-block-editor-script',
			'attributes'      => array(
				'repoUrl' => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'render_callback' => 'github_repo_card_block_render',
		)
	);
}
add_action( 'init', 'github_repo_card_block_register' );

/**
 * Enqueues the styles for the GitHub Repo Card Block.
 */
function github_repo_card_block_enqueue_styles() {
	wp_enqueue_style(
		'github-repo-card-block-style',
		plugins_url( 'style.css', __FILE__ ),
		array(),
		'1.0.0'
	);
}
add_action( 'enqueue_block_assets', 'github_repo_card_block_enqueue_styles' );

/**
 * Renders the GitHub Repo Card Block on the front end.
 *
 * @param array $attributes The block attributes.
 * @return string The block's HTML content.
 */
function github_repo_card_block_render( $attributes ) {
	// Validate and sanitize the repository URL.
	if ( empty( $attributes['repoUrl'] ) || ! filter_var( $attributes['repoUrl'], FILTER_VALIDATE_URL ) ) {
		return '<div class="github-repo-card">' . esc_html__( 'No valid GitHub repository URL provided.', 'ghrc' ) . '</div>';
	}

	$repo_url = esc_url( $attributes['repoUrl'] );
	if ( ! preg_match( '/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/', $repo_url ) ) {
		return '<div class="github-repo-card">' . esc_html__( 'No valid GitHub repository URL provided.', 'ghrc' ) . '</div>';
	}

	// Extract owner and repo name from the URL.
	$url_parts  = wp_parse_url( $repo_url );
	$path_parts = explode( '/', trim( $url_parts['path'], '/' ) );
	if ( count( $path_parts ) < 2 ) {
		return '<div class="github-repo-card">' . esc_html__( 'No valid GitHub repository URL provided.', 'ghrc' ) . '</div>';
	}

	$owner = esc_attr( $path_parts[0] );
	$repo  = esc_attr( $path_parts[1] );

	// Fetch repository data from GitHub API.
	$api_url  = "https://api.github.com/repos/$owner/$repo";
	$response = wp_remote_get( $api_url, array( 'user-agent' => 'WordPress GitHub Repo Card Block' ) );
	if ( is_wp_error( $response ) ) {
		return '<div class="github-repo-card">' . esc_html__( 'Error fetching repository data.', 'ghrc' ) . '</div>';
	}

	$repo_data = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( empty( $repo_data ) || isset( $repo_data['message'] ) ) {
		return '<div class="github-repo-card">' . esc_html__( 'Repository not found or an error occurred.', 'ghrc' ) . '</div>';
	}

	// Fetch contributors data from GitHub API.
	$contributors_api_url  = "https://api.github.com/repos/$owner/$repo/contributors";
	$contributors_response = wp_remote_get( $contributors_api_url, array( 'user-agent' => 'WordPress GitHub Repo Card Block' ) );
	$contributors_count    = 0;

	if ( ! is_wp_error( $contributors_response ) ) {
		$contributors_data = json_decode( wp_remote_retrieve_body( $contributors_response ), true );
		if ( is_array( $contributors_data ) ) {
			$contributors_count = count( $contributors_data );
		}
	}

	// Generate the card content with the fetched data.
	$output = sprintf(
		'<div class="github-repo-card">
            <div class="repo-card-header">
                <img src="%4$s" alt="%3$s ' . esc_attr__( 'avatar', 'ghrc' ) . '" class="repo-owner-avatar"/>
                <div class="repo-title"><a href="%1$s" target="_blank">%2$s</a></div>
            </div>
            <p><strong>' . esc_html__( 'Owner:', 'ghrc' ) . '</strong> %3$s</p>
            <p><strong>' . esc_html__( 'Description:', 'ghrc' ) . '</strong> %5$s</p>
            <div class="repo-stats">
                <span class="repo-stat"><img src="%11$s" class="icon" alt="' . esc_attr__( 'Contributors', 'ghrc' ) . '"/> %6$s<span class="stat-name">' . esc_html__( 'Contributors', 'ghrc' ) . '</span></span>
                <span class="repo-stat"><img src="%12$s" class="icon" alt="' . esc_attr__( 'Stars', 'ghrc' ) . '"/> %7$s<span class="stat-name">' . esc_html__( 'Stars', 'ghrc' ) . '</span></span>
                <span class="repo-stat"><img src="%13$s" class="icon" alt="' . esc_attr__( 'Watchers', 'ghrc' ) . '"/> %8$s<span class="stat-name">' . esc_html__( 'Watchers', 'ghrc' ) . '</span></span>
                <span class="repo-stat"><img src="%14$s" class="icon" alt="' . esc_attr__( 'Forks', 'ghrc' ) . '"/> %9$s<span class="stat-name">' . esc_html__( 'Forks', 'ghrc' ) . '</span></span>
                <span class="repo-stat"><img src="%15$s" class="icon" alt="' . esc_attr__( 'Issues', 'ghrc' ) . '"/> %10$s<span class="stat-name">' . esc_html__( 'Issues', 'ghrc' ) . '</span></span>
            </div>
        </div>',
		esc_url( $repo_data['html_url'] ),
		esc_html( $repo_data['name'] ),
		esc_html( $repo_data['owner']['login'] ),
		esc_url( $repo_data['owner']['avatar_url'] ),
		esc_html( $repo_data['description'] ),
		esc_html( $contributors_count ),
		esc_html( $repo_data['stargazers_count'] ),
		esc_html( $repo_data['watchers_count'] ),
		esc_html( $repo_data['forks_count'] ),
		esc_html( $repo_data['open_issues_count'] ),
		esc_url( plugins_url( 'images/contributor.svg', __FILE__ ) ),
		esc_url( plugins_url( 'images/star.svg', __FILE__ ) ),
		esc_url( plugins_url( 'images/watch.svg', __FILE__ ) ),
		esc_url( plugins_url( 'images/fork.svg', __FILE__ ) ),
		esc_url( plugins_url( 'images/issue.svg', __FILE__ ) )
	);

	return $output;
}
