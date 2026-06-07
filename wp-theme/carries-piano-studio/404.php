<?php get_header(); ?>

<main id="primary" class="site-main inner-page error-404">
	<div class="container text-center">
		<div class="error-404-content">
			<span class="error-number">404</span>
			<h1 class="section-title"><?php esc_html_e( 'Page Not Found', 'carries-piano-studio' ); ?></h1>
			<p class="error-desc"><?php esc_html_e( "It seems this page has wandered off the keys. Let's find you something.", 'carries-piano-studio' ); ?></p>
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn btn-gold"><?php esc_html_e( 'Return Home', 'carries-piano-studio' ); ?></a>
		</div>
	</div>
</main>

<?php get_footer(); ?>
