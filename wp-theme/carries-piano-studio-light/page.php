<?php get_header(); ?>

<main id="primary" class="site-main inner-page">
	<div class="container">
		<?php while ( have_posts() ) : the_post(); ?>
			<article id="post-<?php the_ID(); ?>" <?php post_class( 'inner-page-article' ); ?>>
				<header class="entry-header page-header">
					<?php the_title( '<h1 class="entry-title section-title">', '</h1>' ); ?>
				</header>
				<div class="entry-content prose">
					<?php
					the_content();
					wp_link_pages( [
						'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'carries-piano-studio' ),
						'after'  => '</div>',
					] );
					?>
				</div>
			</article>
		<?php endwhile; ?>
	</div>
</main>

<?php get_footer(); ?>
