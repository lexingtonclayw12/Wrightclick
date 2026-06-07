<?php get_header(); ?>

<main id="primary" class="site-main inner-page">
	<div class="container container--narrow">
		<?php while ( have_posts() ) : the_post(); ?>
			<article id="post-<?php the_ID(); ?>" <?php post_class( 'single-article' ); ?>>
				<header class="entry-header">
					<?php the_title( '<h1 class="entry-title section-title">', '</h1>' ); ?>
					<div class="entry-meta">
						<?php cps_posted_on(); ?>
						<?php cps_posted_by(); ?>
					</div>
				</header>

				<?php if ( has_post_thumbnail() ) : ?>
					<div class="entry-thumbnail">
						<?php the_post_thumbnail( 'hero-image' ); ?>
					</div>
				<?php endif; ?>

				<div class="entry-content prose">
					<?php the_content(); ?>
				</div>

				<footer class="entry-footer">
					<?php cps_entry_footer(); ?>
				</footer>
			</article>

			<?php if ( comments_open() || get_comments_number() ) : ?>
				<?php comments_template(); ?>
			<?php endif; ?>

			<?php the_post_navigation( [
				'prev_text' => '<span class="nav-subtitle">' . esc_html__( 'Previous', 'carries-piano-studio' ) . '</span><span class="nav-title">%title</span>',
				'next_text' => '<span class="nav-subtitle">' . esc_html__( 'Next', 'carries-piano-studio' ) . '</span><span class="nav-title">%title</span>',
			] ); ?>
		<?php endwhile; ?>
	</div>
</main>

<?php get_footer(); ?>
