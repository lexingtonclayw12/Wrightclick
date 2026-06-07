<?php
defined( 'ABSPATH' ) || exit;

function cps_posted_on() {
	$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';

	$time_string = sprintf(
		$time_string,
		esc_attr( get_the_date( DATE_W3C ) ),
		esc_html( get_the_date() )
	);

	printf(
		'<span class="posted-on">%s</span>',
		$time_string // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	);
}

function cps_posted_by() {
	printf(
		'<span class="byline">%s <span class="author vcard"><a class="url fn n" href="%s">%s</a></span></span>',
		esc_html__( 'by', 'carries-piano-studio' ),
		esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
		esc_html( get_the_author() )
	);
}

function cps_entry_footer() {
	$tags_list = get_the_tag_list( '', esc_html_x( ', ', 'list item separator', 'carries-piano-studio' ) );
	if ( $tags_list ) {
		printf( '<span class="tags-links">' . esc_html__( 'Tagged: %1$s', 'carries-piano-studio' ) . '</span>', $tags_list ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	edit_post_link(
		sprintf(
			wp_kses(
				__( 'Edit <span class="screen-reader-text">%s</span>', 'carries-piano-studio' ),
				[ 'span' => [ 'class' => [] ] ]
			),
			wp_kses_post( get_the_title() )
		),
		'<span class="edit-link">',
		'</span>'
	);
}

function cps_fallback_menu() {
	echo '<ul id="primary-menu">';
	echo '<li><a href="#about">'       . esc_html__( 'About', 'carries-piano-studio' )       . '</a></li>';
	echo '<li><a href="#lessons">'     . esc_html__( 'Lessons', 'carries-piano-studio' )     . '</a></li>';
	echo '<li><a href="#schedule">'    . esc_html__( 'Schedule', 'carries-piano-studio' )    . '</a></li>';
	echo '<li><a href="#music">'       . esc_html__( 'Music', 'carries-piano-studio' )       . '</a></li>';
	echo '<li><a href="#repertoire">'  . esc_html__( 'Repertoire', 'carries-piano-studio' )  . '</a></li>';
	echo '<li><a href="#location">'    . esc_html__( 'Location', 'carries-piano-studio' )    . '</a></li>';
	echo '<li><a href="#contact">'     . esc_html__( 'Contact', 'carries-piano-studio' )     . '</a></li>';
	echo '</ul>';
}

function cps_the_archive_title( $title ) {
	if ( is_category() ) {
		$title = single_cat_title( '', false );
	} elseif ( is_tag() ) {
		$title = single_tag_title( '', false );
	} elseif ( is_author() ) {
		$title = '<span class="vcard">' . get_the_author() . '</span>';
	} elseif ( is_post_type_archive() ) {
		$title = post_type_archive_title( '', false );
	} elseif ( is_tax() ) {
		$title = single_term_title( '', false );
	}
	return $title;
}
add_filter( 'get_the_archive_title', 'cps_the_archive_title' );
