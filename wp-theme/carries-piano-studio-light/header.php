<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site">
	<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', 'carries-piano-studio' ); ?></a>

	<header id="masthead" class="site-header" data-scroll="false">
		<div class="header-inner">
			<div class="site-branding">
				<?php if ( has_custom_logo() ) : ?>
					<?php the_custom_logo(); ?>
				<?php else : ?>
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-name-link" rel="home">
						<span class="site-name-script">Carrie's</span>
						<span class="site-name-serif">Piano Studio</span>
					</a>
				<?php endif; ?>
			</div>

			<nav id="site-navigation" class="main-navigation" aria-label="<?php esc_attr_e( 'Primary menu', 'carries-piano-studio' ); ?>">
				<button class="menu-toggle" aria-controls="primary-menu" aria-expanded="false">
					<span class="hamburger-line"></span>
					<span class="hamburger-line"></span>
					<span class="hamburger-line"></span>
					<span class="screen-reader-text"><?php esc_html_e( 'Menu', 'carries-piano-studio' ); ?></span>
				</button>

				<?php
				wp_nav_menu( [
					'theme_location' => 'primary',
					'menu_id'        => 'primary-menu',
					'container'      => false,
					'fallback_cb'    => 'cps_fallback_menu',
				] );
				?>
			</nav>

			<a href="#contact" class="header-cta btn btn-gold"><?php esc_html_e( 'Book a Lesson', 'carries-piano-studio' ); ?></a>
		</div>
	</header>
