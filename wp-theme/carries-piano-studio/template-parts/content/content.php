<article id="post-<?php the_ID(); ?>" <?php post_class( 'post-card' ); ?>>
	<?php if ( has_post_thumbnail() ) : ?>
		<div class="post-card-image">
			<a href="<?php the_permalink(); ?>">
				<?php the_post_thumbnail( 'card-thumbnail' ); ?>
			</a>
		</div>
	<?php endif; ?>
	<div class="post-card-body">
		<div class="entry-meta">
			<?php cps_posted_on(); ?>
		</div>
		<header class="entry-header">
			<?php the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' ); ?>
		</header>
		<div class="entry-summary">
			<?php the_excerpt(); ?>
		</div>
		<a href="<?php the_permalink(); ?>" class="read-more btn btn-outline">
			<?php esc_html_e( 'Read More', 'carries-piano-studio' ); ?>
		</a>
	</div>
</article>
