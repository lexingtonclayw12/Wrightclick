<?php get_header(); ?>

<main id="primary" class="site-main blog-main">
	<div class="container">
		<header class="page-header">
			<h1 class="page-title section-title"><?php esc_html_e( 'News & Updates', 'carries-piano-studio' ); ?></h1>
		</header>

		<div class="posts-grid">
			<?php if ( have_posts() ) : ?>
				<?php while ( have_posts() ) : the_post(); ?>
					<?php get_template_part( 'template-parts/content/content', get_post_type() ); ?>
				<?php endwhile; ?>
				<?php the_posts_navigation( [ 'prev_text' => '&larr; ' . __( 'Older posts', 'carries-piano-studio' ), 'next_text' => __( 'Newer posts', 'carries-piano-studio' ) . ' &rarr;' ] ); ?>
			<?php else : ?>
				<?php get_template_part( 'template-parts/content/content', 'none' ); ?>
			<?php endif; ?>
		</div>
	</div>
</main>

<?php get_footer(); ?>
