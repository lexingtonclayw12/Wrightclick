<?php get_header(); ?>

<main id="primary" class="site-main inner-page">
	<div class="container">
		<header class="page-header">
			<h1 class="page-title section-title">
				<?php
				printf(
					esc_html__( 'Search Results for: %s', 'carries-piano-studio' ),
					'<em>' . esc_html( get_search_query() ) . '</em>'
				);
				?>
			</h1>
		</header>

		<div class="posts-grid">
			<?php if ( have_posts() ) : ?>
				<?php while ( have_posts() ) : the_post(); ?>
					<?php get_template_part( 'template-parts/content/content', get_post_type() ); ?>
				<?php endwhile; ?>
				<?php the_posts_navigation(); ?>
			<?php else : ?>
				<?php get_template_part( 'template-parts/content/content', 'none' ); ?>
			<?php endif; ?>
		</div>
	</div>
</main>

<?php get_footer(); ?>
