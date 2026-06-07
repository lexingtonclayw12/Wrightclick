<?php
defined( 'ABSPATH' ) || exit;

function cps_register_cpts() {
	// Testimonials CPT
	register_post_type( 'testimonial', [
		'labels' => [
			'name'          => __( 'Testimonials', 'carries-piano-studio' ),
			'singular_name' => __( 'Testimonial', 'carries-piano-studio' ),
			'add_new_item'  => __( 'Add New Testimonial', 'carries-piano-studio' ),
			'edit_item'     => __( 'Edit Testimonial', 'carries-piano-studio' ),
		],
		'public'        => false,
		'show_ui'       => true,
		'show_in_menu'  => true,
		'show_in_rest'  => true,
		'menu_icon'     => 'dashicons-format-quote',
		'supports'      => [ 'title', 'editor', 'custom-fields' ],
		'menu_position' => 25,
	] );

	// Performances CPT
	register_post_type( 'performance', [
		'labels' => [
			'name'          => __( 'Performances', 'carries-piano-studio' ),
			'singular_name' => __( 'Performance', 'carries-piano-studio' ),
			'add_new_item'  => __( 'Add New Performance', 'carries-piano-studio' ),
			'edit_item'     => __( 'Edit Performance', 'carries-piano-studio' ),
		],
		'public'        => false,
		'show_ui'       => true,
		'show_in_menu'  => true,
		'show_in_rest'  => true,
		'menu_icon'     => 'dashicons-music',
		'supports'      => [ 'title', 'editor', 'thumbnail', 'custom-fields' ],
		'menu_position' => 26,
	] );
}
add_action( 'init', 'cps_register_cpts' );
