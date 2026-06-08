<?php
defined( 'ABSPATH' ) || exit;

function cps_customize_register( $wp_customize ) {

	// ── Hero Video ──────────────────────────────────────────────────
	$wp_customize->add_section( 'cps_hero', [
		'title'    => __( 'Hero Section', 'carries-piano-studio' ),
		'priority' => 30,
	] );

	$wp_customize->add_setting( 'cps_hero_video_url', [
		'default'           => '',
		'sanitize_callback' => 'esc_url_raw',
		'transport'         => 'refresh',
	] );
	$wp_customize->add_control( 'cps_hero_video_url', [
		'label'       => __( 'Hero Video URL (.mp4 uploaded to Media Library)', 'carries-piano-studio' ),
		'description' => __( 'Upload a close-up piano video via Media Library and paste the URL here.', 'carries-piano-studio' ),
		'section'     => 'cps_hero',
		'type'        => 'url',
	] );

	$wp_customize->add_setting( 'cps_hero_heading', [
		'default'           => 'The Art of Piano',
		'sanitize_callback' => 'sanitize_text_field',
		'transport'         => 'postMessage',
	] );
	$wp_customize->add_control( 'cps_hero_heading', [
		'label'   => __( 'Hero Heading', 'carries-piano-studio' ),
		'section' => 'cps_hero',
		'type'    => 'text',
	] );

	$wp_customize->add_setting( 'cps_hero_subheading', [
		'default'           => 'Piano lessons for all ages & levels in Charlotte, NC',
		'sanitize_callback' => 'sanitize_text_field',
		'transport'         => 'postMessage',
	] );
	$wp_customize->add_control( 'cps_hero_subheading', [
		'label'   => __( 'Hero Subheading', 'carries-piano-studio' ),
		'section' => 'cps_hero',
		'type'    => 'text',
	] );

	// ── Colors ──────────────────────────────────────────────────────
	$wp_customize->add_section( 'cps_colors', [
		'title'    => __( 'Theme Colors', 'carries-piano-studio' ),
		'priority' => 40,
	] );

	$wp_customize->add_setting( 'cps_gold_color', [
		'default'           => '#c9a96e',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'postMessage',
	] );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'cps_gold_color', [
		'label'   => __( 'Gold Accent Color', 'carries-piano-studio' ),
		'section' => 'cps_colors',
	] ) );

	// ── Contact ─────────────────────────────────────────────────────
	$wp_customize->add_section( 'cps_contact', [
		'title'    => __( 'Contact Details', 'carries-piano-studio' ),
		'priority' => 50,
	] );

	$wp_customize->add_setting( 'cps_contact_email', [
		'default'           => 'carriewright1977@me.com',
		'sanitize_callback' => 'sanitize_email',
	] );
	$wp_customize->add_control( 'cps_contact_email', [
		'label'   => __( 'Contact Email', 'carries-piano-studio' ),
		'section' => 'cps_contact',
		'type'    => 'email',
	] );

	$wp_customize->add_setting( 'cps_facebook_url', [
		'default'           => '',
		'sanitize_callback' => 'esc_url_raw',
	] );
	$wp_customize->add_control( 'cps_facebook_url', [
		'label'   => __( 'Facebook URL', 'carries-piano-studio' ),
		'section' => 'cps_contact',
		'type'    => 'url',
	] );

	$wp_customize->add_setting( 'cps_instagram_url', [
		'default'           => '',
		'sanitize_callback' => 'esc_url_raw',
	] );
	$wp_customize->add_control( 'cps_instagram_url', [
		'label'   => __( 'Instagram URL', 'carries-piano-studio' ),
		'section' => 'cps_contact',
		'type'    => 'url',
	] );

	// ── Selective refresh partials ───────────────────────────────────
	$wp_customize->selective_refresh->add_partial( 'cps_hero_heading', [
		'selector'        => '.hero-heading',
		'render_callback' => function() {
			return esc_html( get_theme_mod( 'cps_hero_heading', 'The Art of Piano' ) );
		},
	] );
	$wp_customize->selective_refresh->add_partial( 'cps_hero_subheading', [
		'selector'        => '.hero-subheading',
		'render_callback' => function() {
			return esc_html( get_theme_mod( 'cps_hero_subheading', 'Piano lessons for all ages & levels in Charlotte, NC' ) );
		},
	] );
}
add_action( 'customize_register', 'cps_customize_register' );

function cps_customizer_css() {
	$gold = get_theme_mod( 'cps_gold_color', '#c9a96e' );
	?>
	<style>
		:root {
			--cps-gold: <?php echo sanitize_hex_color( $gold ); ?>;
			--cps-gold-rgb: <?php echo esc_html( cps_hex_to_rgb( $gold ) ); ?>;
		}
	</style>
	<?php
}
add_action( 'wp_head', 'cps_customizer_css' );

function cps_hex_to_rgb( $hex ) {
	$hex = ltrim( $hex, '#' );
	if ( strlen( $hex ) === 3 ) {
		$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
	}
	$r = hexdec( substr( $hex, 0, 2 ) );
	$g = hexdec( substr( $hex, 2, 2 ) );
	$b = hexdec( substr( $hex, 4, 2 ) );
	return "$r, $g, $b";
}
