<?php
defined( 'ABSPATH' ) || exit;

define( 'CPS_VERSION', '1.0.0' );
define( 'CPS_DIR', get_template_directory() );
define( 'CPS_URI', get_template_directory_uri() );

require CPS_DIR . '/inc/theme-setup.php';
require CPS_DIR . '/inc/enqueue.php';
require CPS_DIR . '/inc/customizer.php';
require CPS_DIR . '/inc/template-functions.php';
require CPS_DIR . '/inc/custom-post-types.php';
