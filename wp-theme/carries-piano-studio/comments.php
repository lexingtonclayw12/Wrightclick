<?php if ( post_password_required() ) return; ?>

<div id="comments" class="comments-area">
	<?php if ( have_comments() ) : ?>
		<h2 class="comments-title">
			<?php
			$count = get_comments_number();
			if ( '1' === $count ) {
				printf( esc_html__( 'One thought on &ldquo;%1$s&rdquo;', 'carries-piano-studio' ), esc_html( get_the_title() ) );
			} else {
				printf( esc_html( _n( '%1$s thought on &ldquo;%2$s&rdquo;', '%1$s thoughts on &ldquo;%2$s&rdquo;', $count, 'carries-piano-studio' ) ), number_format_i18n( $count ), esc_html( get_the_title() ) );
			}
			?>
		</h2>
		<ol class="comment-list">
			<?php wp_list_comments( [ 'style' => 'ol', 'short_ping' => true ] ); ?>
		</ol>
		<?php the_comments_navigation(); ?>
	<?php endif; ?>

	<?php if ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) : ?>
		<p class="no-comments"><?php esc_html_e( 'Comments are closed.', 'carries-piano-studio' ); ?></p>
	<?php endif; ?>

	<?php comment_form(); ?>
</div>
