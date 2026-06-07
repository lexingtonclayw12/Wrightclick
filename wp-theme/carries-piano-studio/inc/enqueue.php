<?php
defined( 'ABSPATH' ) || exit;

function cps_scripts() {
	wp_enqueue_style(
		'carries-piano-studio-fonts',
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&family=Great+Vibes&display=swap',
		[],
		null
	);

	wp_enqueue_style(
		'carries-piano-studio-style',
		CPS_URI . '/assets/css/theme.css',
		[ 'carries-piano-studio-fonts' ],
		CPS_VERSION
	);

	wp_enqueue_script(
		'carries-piano-studio-script',
		CPS_URI . '/assets/js/theme.js',
		[],
		CPS_VERSION,
		true
	);

	wp_localize_script( 'carries-piano-studio-script', 'cpsData', [
		'ajaxUrl' => admin_url( 'admin-ajax.php' ),
		'nonce'   => wp_create_nonce( 'cps-nonce' ),
		'homeUrl' => home_url( '/' ),
		'themeUri' => CPS_URI,
	] );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'cps_scripts' );

function cps_editor_styles() {
	add_editor_style( 'assets/css/editor-style.css' );
}
add_action( 'after_setup_theme', 'cps_editor_styles' );
