<?php
defined( 'ABSPATH' ) || exit;

function cps_setup() {
	load_theme_textdomain( 'carries-piano-studio', CPS_DIR . '/languages' );

	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ] );
	add_theme_support( 'customize-selective-refresh-widgets' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'responsive-embeds' );

	add_theme_support( 'custom-logo', [
		'height'      => 80,
		'width'       => 240,
		'flex-height' => true,
		'flex-width'  => true,
	] );

	register_nav_menus( [
		'primary' => __( 'Primary Navigation', 'carries-piano-studio' ),
		'footer'  => __( 'Footer Navigation', 'carries-piano-studio' ),
	] );

	add_image_size( 'hero-image',      1920, 1080, true );
	add_image_size( 'card-thumbnail',   800,  600, true );
	add_image_size( 'portrait',         600,  800, true );
}
add_action( 'after_setup_theme', 'cps_setup' );

function cps_widgets_init() {
	register_sidebar( [
		'name'          => __( 'Footer Widgets', 'carries-piano-studio' ),
		'id'            => 'footer-widgets',
		'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
		'after_widget'  => '</div>',
		'before_title'  => '<h3 class="footer-widget-title">',
		'after_title'   => '</h3>',
	] );
}
add_action( 'widgets_init', 'cps_widgets_init' );
