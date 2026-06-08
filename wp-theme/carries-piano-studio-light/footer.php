	<footer id="colophon" class="site-footer">
		<div class="footer-top">
			<div class="footer-brand">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="footer-logo-link">
					<span class="site-name-script">Carrie's</span>
					<span class="site-name-serif">Piano Studio</span>
				</a>
				<p class="footer-tagline"><?php esc_html_e( 'Piano lessons for all ages & levels', 'carries-piano-studio' ); ?></p>
			</div>

			<div class="footer-links">
				<h4><?php esc_html_e( 'Quick Links', 'carries-piano-studio' ); ?></h4>
				<?php
				wp_nav_menu( [
					'theme_location' => 'footer',
					'container'      => false,
					'depth'          => 1,
					'fallback_cb'    => false,
				] );
				?>
			</div>

			<div class="footer-contact-block">
				<h4><?php esc_html_e( 'Contact', 'carries-piano-studio' ); ?></h4>
				<p>
					<a href="mailto:<?php echo esc_attr( get_theme_mod( 'cps_contact_email', 'carriewright1977@me.com' ) ); ?>" class="footer-email">
						<?php echo esc_html( get_theme_mod( 'cps_contact_email', 'carriewright1977@me.com' ) ); ?>
					</a>
				</p>
				<p><?php esc_html_e( 'Charlotte, NC', 'carries-piano-studio' ); ?></p>
				<div class="footer-social">
					<?php if ( $fb = get_theme_mod( 'cps_facebook_url' ) ) : ?>
						<a href="<?php echo esc_url( $fb ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Facebook', 'carries-piano-studio' ); ?>">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
						</a>
					<?php endif; ?>
					<?php if ( $ig = get_theme_mod( 'cps_instagram_url' ) ) : ?>
						<a href="<?php echo esc_url( $ig ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Instagram', 'carries-piano-studio' ); ?>">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
						</a>
					<?php endif; ?>
				</div>
			</div>
		</div>

		<div class="footer-bottom">
			<p class="copyright">
				&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php esc_html_e( "Carrie's Piano Studio.", 'carries-piano-studio' ); ?>
				<?php esc_html_e( 'All rights reserved.', 'carries-piano-studio' ); ?>
			</p>
			<p class="footer-credit">
				<?php
				printf(
					wp_kses(
						__( 'Design by <a href="https://wrightclickstudio.com" target="_blank" rel="noopener">Wright Click Studio</a>', 'carries-piano-studio' ),
						[ 'a' => [ 'href' => [], 'target' => [], 'rel' => [] ] ]
					)
				);
				?>
			</p>
		</div>
	</footer>
</div><!-- #page -->

<?php wp_footer(); ?>
</body>
</html>
