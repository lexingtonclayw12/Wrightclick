<section class="no-results not-found text-center">
	<header class="page-header">
		<h1 class="page-title section-title"><?php esc_html_e( 'Nothing Here', 'carries-piano-studio' ); ?></h1>
	</header>
	<div class="page-content">
		<?php if ( is_search() ) : ?>
			<p><?php esc_html_e( 'Sorry, no results matched your search. Please try different keywords.', 'carries-piano-studio' ); ?></p>
			<?php get_search_form(); ?>
		<?php else : ?>
			<p><?php esc_html_e( 'It seems nothing was found here. Maybe try a search?', 'carries-piano-studio' ); ?></p>
			<?php get_search_form(); ?>
		<?php endif; ?>
	</div>
</section>
