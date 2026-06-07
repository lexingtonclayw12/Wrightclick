# WordPress Theme Generator

Convert a website design into a production-ready WordPress theme. Run this when a client's site needs to be built on WordPress rather than as a static build.

## Usage

```
/wordpress-theme [theme-slug] [source-dir]
```

- `theme-slug` — machine-readable name for the theme folder (e.g. `apex-commerce`). Defaults to the current directory name.
- `source-dir` — path to existing HTML/CSS/JS design files to convert. Omit if starting from scratch.

---

## What this skill does

1. Reads the source design (HTML, CSS, JS) if one is provided.
2. Scaffolds a complete, standards-compliant WordPress theme under `wp-theme/<theme-slug>/`.
3. Splits the static markup into WordPress template files following the [template hierarchy](https://developer.wordpress.org/themes/basics/template-hierarchy/).
4. Replaces hard-coded content with the correct WordPress template tags.
5. Wires up scripts, styles, menus, widget areas, and the Customizer.
6. Writes a `README.md` inside the theme with setup instructions.

---

## Step 1 — Gather information

Ask the user for anything that isn't obvious from the source files:

- **Theme name** (human-readable, e.g. "Apex Commerce")
- **Theme slug** (folder name, e.g. `apex-commerce`)
- **Primary color** and **font stack** if not in the CSS
- **Custom post types** needed (e.g. Portfolio, Team, Testimonials)
- **Page builder support** needed? (Elementor, Gutenberg blocks only, or classic editor)
- **ACF dependency** acceptable? (useful for flexible content, repeaters)
- **WooCommerce** support needed?

Do not generate any files until these are confirmed.

---

## Step 2 — Analyse the source design

Read every file in `source-dir` (or the current directory if none given):

```
Read index.html
Read css/styles.css (or equivalent)
Read js/main.js (or equivalent)
```

Identify:
- Sections that map to WordPress templates (header, footer, single post, page, archive, 404)
- Navigation menus
- Widget/sidebar areas
- Dynamic content areas (blog loop, portfolio loop, testimonials, etc.)
- Custom fonts loaded via Google Fonts or local files
- Third-party scripts (analytics, chat widgets, etc.)
- Any hard-coded colors or font sizes that should become Customizer controls

---

## Step 3 — Scaffold the theme directory

Create the following structure under `wp-theme/<theme-slug>/`:

```
wp-theme/<theme-slug>/
├── style.css                  ← Theme header + base styles
├── functions.php              ← Theme setup, hooks, includes
├── index.php                  ← Fallback template (blog loop)
├── front-page.php             ← Static front page
├── page.php                   ← Default page template
├── single.php                 ← Single post
├── archive.php                ← Post archives
├── search.php                 ← Search results
├── 404.php                    ← Error page
├── header.php                 ← <head> + site header markup
├── footer.php                 ← Site footer + wp_footer()
├── sidebar.php                ← Primary sidebar
├── comments.php               ← Comments template
├── screenshot.png             ← 1200×900 placeholder (skip if no image tool)
│
├── template-parts/
│   ├── content/
│   │   ├── content.php        ← Loop item: standard post
│   │   ├── content-page.php   ← Loop item: page
│   │   └── content-none.php   ← No posts found
│   ├── header/
│   │   ├── site-branding.php
│   │   └── navigation.php
│   └── footer/
│       └── footer-widgets.php
│
├── inc/
│   ├── theme-setup.php        ← add_theme_support(), register_nav_menus(), etc.
│   ├── enqueue.php            ← wp_enqueue_scripts() for all assets
│   ├── customizer.php         ← Theme Customizer panels, sections, controls
│   ├── template-functions.php ← Helper functions used in templates
│   └── custom-post-types.php  ← CPT + taxonomy registration (if needed)
│
├── assets/
│   ├── css/
│   │   └── theme.css          ← All design CSS (ported from source)
│   ├── js/
│   │   └── theme.js           ← All design JS (ported from source)
│   └── images/                ← Any static images from the design
│
└── languages/
    └── <theme-slug>.pot       ← Translation template (gettext strings)
```

---

## Step 4 — Write `style.css`

The file must begin with the WordPress theme header comment, then import or contain the base reset/root variables:

```css
/*!
 * Theme Name:  <Human Theme Name>
 * Theme URI:   https://wrightclickstudio.com
 * Author:      Wright Click Studio
 * Author URI:  https://wrightclickstudio.com
 * Description: Custom WordPress theme for <Client Name>.
 * Version:     1.0.0
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: <theme-slug>
 * Tags:        custom-background, custom-logo, custom-menu, featured-images, threaded-comments, translation-ready
 */

/* Intentionally minimal — all styles live in assets/css/theme.css */
```

---

## Step 5 — Write `functions.php`

Load all `inc/` files and set the text domain. Keep `functions.php` short — it only requires files:

```php
<?php
defined( 'ABSPATH' ) || exit;

define( 'THEME_VERSION', '1.0.0' );
define( 'THEME_DIR', get_template_directory() );
define( 'THEME_URI', get_template_directory_uri() );

require THEME_DIR . '/inc/theme-setup.php';
require THEME_DIR . '/inc/enqueue.php';
require THEME_DIR . '/inc/customizer.php';
require THEME_DIR . '/inc/template-functions.php';

// Only load CPTs if the file exists (added per project)
if ( file_exists( THEME_DIR . '/inc/custom-post-types.php' ) ) {
    require THEME_DIR . '/inc/custom-post-types.php';
}
```

---

## Step 6 — Write `inc/theme-setup.php`

```php
<?php
function theme_setup() {
    load_theme_textdomain( '<theme-slug>', THEME_DIR . '/languages' );

    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ] );
    add_theme_support( 'customize-selective-refresh-widgets' );
    add_theme_support( 'wp-block-styles' );
    add_theme_support( 'align-wide' );
    add_theme_support( 'editor-styles' );
    add_theme_support( 'responsive-embeds' );

    // Custom logo
    add_theme_support( 'custom-logo', [
        'height'      => 60,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
    ] );

    // Navigation menus — add one entry per menu location in the design
    register_nav_menus( [
        'primary' => __( 'Primary Navigation', '<theme-slug>' ),
        'footer'  => __( 'Footer Navigation', '<theme-slug>' ),
    ] );

    // Image sizes — add sizes that match the design's image dimensions
    add_image_size( 'card-thumbnail', 800, 600, true );
    add_image_size( 'hero-image', 1920, 1080, true );
}
add_action( 'after_setup_theme', 'theme_setup' );

// Widget areas
function theme_widgets_init() {
    register_sidebar( [
        'name'          => __( 'Primary Sidebar', '<theme-slug>' ),
        'id'            => 'sidebar-1',
        'description'   => __( 'Widgets in this area appear in the sidebar.', '<theme-slug>' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ] );

    register_sidebar( [
        'name'          => __( 'Footer Widgets', '<theme-slug>' ),
        'id'            => 'footer-widgets',
        'description'   => __( 'Widgets in this area appear in the footer.', '<theme-slug>' ),
        'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="footer-widget-title">',
        'after_title'   => '</h3>',
    ] );
}
add_action( 'widgets_init', 'theme_widgets_init' );
```

---

## Step 7 — Write `inc/enqueue.php`

- Enqueue `assets/css/theme.css` and `assets/js/theme.js` with `THEME_VERSION` as the cache-buster.
- Enqueue Google Fonts via `wp_enqueue_style` if the design uses them.
- Pass any PHP values JS needs via `wp_localize_script`.

```php
<?php
function theme_scripts() {
    // Google Fonts — replace URL with the one from the design's <head>
    wp_enqueue_style(
        '<theme-slug>-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        [],
        null
    );

    wp_enqueue_style(
        '<theme-slug>-style',
        THEME_URI . '/assets/css/theme.css',
        [ '<theme-slug>-fonts' ],
        THEME_VERSION
    );

    wp_enqueue_script(
        '<theme-slug>-script',
        THEME_URI . '/assets/js/theme.js',
        [],
        THEME_VERSION,
        true  // load in footer
    );

    // Pass PHP values to JS
    wp_localize_script( '<theme-slug>-script', 'themeData', [
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( '<theme-slug>-nonce' ),
        'homeUrl' => home_url( '/' ),
    ] );

    // Comments script
    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }
}
add_action( 'wp_enqueue_scripts', 'theme_scripts' );
```

---

## Step 8 — Write template files

### `header.php`

```php
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
    <a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', '<theme-slug>' ); ?></a>

    <header id="masthead" class="site-header">
        <?php get_template_part( 'template-parts/header/site-branding' ); ?>
        <?php get_template_part( 'template-parts/header/navigation' ); ?>
    </header>
```

### `footer.php`

```php
    <footer id="colophon" class="site-footer">
        <?php get_template_part( 'template-parts/footer/footer-widgets' ); ?>

        <div class="site-info">
            <a href="<?php echo esc_url( __( 'https://wordpress.org/', '<theme-slug>' ) ); ?>">
                <?php
                printf(
                    esc_html__( 'Proudly powered by %s', '<theme-slug>' ),
                    'WordPress'
                );
                ?>
            </a>
            <span class="sep"> &bull; </span>
            <?php
            printf(
                esc_html__( 'Theme by %s', '<theme-slug>' ),
                '<a href="https://wrightclickstudio.com">Wright Click Studio</a>'
            );
            ?>
        </div>
    </footer>
</div><!-- #page -->

<?php wp_footer(); ?>
</body>
</html>
```

### `index.php` (blog loop)

```php
<?php get_header(); ?>

<main id="primary" class="site-main">
    <?php if ( have_posts() ) : ?>
        <?php while ( have_posts() ) : the_post(); ?>
            <?php get_template_part( 'template-parts/content/content', get_post_type() ); ?>
        <?php endwhile; ?>
        <?php the_posts_navigation(); ?>
    <?php else : ?>
        <?php get_template_part( 'template-parts/content/content', 'none' ); ?>
    <?php endif; ?>
</main>

<?php get_sidebar(); ?>
<?php get_footer(); ?>
```

### `front-page.php`

Port the static homepage HTML here section by section, replacing hard-coded text with:
- `get_the_title()` / `the_title()`
- `the_content()`
- `the_post_thumbnail()`
- ACF fields: `get_field( 'field_name' )` (if ACF is in use)
- Customizer values: `get_theme_mod( 'setting_name', 'default' )`

Preserve all class names, data attributes, and JS hooks from the source HTML exactly so the ported CSS and JS continue to work without changes.

---

## Step 9 — Port CSS into `assets/css/theme.css`

- Copy the full source CSS verbatim.
- Replace any hard-coded asset paths (e.g. `url('../images/bg.jpg')`) with references inside `assets/images/`.
- Add WordPress-required utility classes at the top:

```css
/* WordPress core classes */
.alignleft  { float: left; margin: 0 1.5em 1em 0; }
.alignright { float: right; margin: 0 0 1em 1.5em; }
.aligncenter { clear: both; display: block; margin: 0 auto 1em; }
.wp-caption  { max-width: 100%; }
.wp-caption-text { font-size: 0.875em; }
.sticky { /* optional: highlight sticky posts */ }
.screen-reader-text {
    border: 0; clip: rect(1px,1px,1px,1px); clip-path: inset(50%);
    height: 1px; margin: -1px; overflow: hidden; padding: 0;
    position: absolute; width: 1px; word-wrap: normal;
}
```

---

## Step 10 — Port JS into `assets/js/theme.js`

- Copy the source JS verbatim.
- Wrap everything in a DOMContentLoaded listener if not already done.
- Replace any `fetch('/contact')` or similar API calls with `wp_ajax` equivalents using the `themeData.ajaxUrl` and `themeData.nonce` values injected by `wp_localize_script`.
- Remove any references to `document.querySelector('link[rel=stylesheet]')` manipulation — WordPress handles that.

---

## Step 11 — Write `inc/customizer.php`

Add a Customizer section for the most likely client-adjustable values. Typical controls for a Wright Click Studio project:

```php
<?php
function theme_customize_register( $wp_customize ) {

    // --- Colors panel ---
    $wp_customize->add_panel( 'theme_colors', [
        'title'    => __( 'Theme Colors', '<theme-slug>' ),
        'priority' => 30,
    ] );

    $wp_customize->add_section( 'theme_primary_color', [
        'title' => __( 'Primary Color', '<theme-slug>' ),
        'panel' => 'theme_colors',
    ] );

    $wp_customize->add_setting( 'primary_color', [
        'default'           => '#6366f1',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'postMessage',
    ] );

    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'primary_color', [
        'label'   => __( 'Primary Accent Color', '<theme-slug>' ),
        'section' => 'theme_primary_color',
    ] ) );

    // --- Hero section ---
    $wp_customize->add_section( 'theme_hero', [
        'title'    => __( 'Hero Section', '<theme-slug>' ),
        'priority' => 40,
    ] );

    $wp_customize->add_setting( 'hero_heading', [
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );

    $wp_customize->add_control( 'hero_heading', [
        'label'   => __( 'Hero Heading', '<theme-slug>' ),
        'section' => 'theme_hero',
        'type'    => 'text',
    ] );

    $wp_customize->add_setting( 'hero_subheading', [
        'default'           => '',
        'sanitize_callback' => 'wp_kses_post',
        'transport'         => 'postMessage',
    ] );

    $wp_customize->add_control( 'hero_subheading', [
        'label'   => __( 'Hero Subheading', '<theme-slug>' ),
        'section' => 'theme_hero',
        'type'    => 'textarea',
    ] );

    // Live preview JS bindings (postMessage transport)
    $wp_customize->selective_refresh->add_partial( 'hero_heading', [
        'selector'        => '.hero-heading',
        'render_callback' => function() {
            return get_theme_mod( 'hero_heading' );
        },
    ] );
}
add_action( 'customize_register', 'theme_customize_register' );

// Output Customizer CSS as inline style
function theme_customizer_css() {
    $primary = get_theme_mod( 'primary_color', '#6366f1' );
    echo '<style>:root { --color-primary: ' . sanitize_hex_color( $primary ) . '; }</style>';
}
add_action( 'wp_head', 'theme_customizer_css' );
```

---

## Step 12 — Write `inc/custom-post-types.php` (if needed)

Register any CPTs the client requires. Common ones for Wright Click Studio projects:

```php
<?php
// Portfolio CPT
function theme_register_cpts() {
    register_post_type( 'portfolio', [
        'labels' => [
            'name'          => __( 'Portfolio', '<theme-slug>' ),
            'singular_name' => __( 'Project', '<theme-slug>' ),
            'add_new_item'  => __( 'Add New Project', '<theme-slug>' ),
            'edit_item'     => __( 'Edit Project', '<theme-slug>' ),
        ],
        'public'       => true,
        'show_in_rest' => true,
        'menu_icon'    => 'dashicons-portfolio',
        'supports'     => [ 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ],
        'has_archive'  => true,
        'rewrite'      => [ 'slug' => 'work' ],
    ] );

    // Portfolio category taxonomy
    register_taxonomy( 'portfolio_category', 'portfolio', [
        'label'        => __( 'Project Category', '<theme-slug>' ),
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite'      => [ 'slug' => 'work-category' ],
    ] );
}
add_action( 'init', 'theme_register_cpts' );
```

---

## Step 13 — Write a `README.md` inside the theme

The README should cover:

1. **Theme setup**: activate in WP Admin → Appearance → Themes
2. **Required plugins** (list ACF, WooCommerce, etc. if used)
3. **Menu setup**: assign menus in Appearance → Menus to the "Primary Navigation" and "Footer Navigation" locations
4. **Customizer**: walk through each panel
5. **CPT content**: how to add Portfolio entries, Testimonials, etc.
6. **Image sizes**: recommended upload dimensions for each registered size
7. **Child theme**: note that edits should be made in a child theme to survive updates

---

## Step 14 — Final checklist before committing

- [ ] All `<?php echo ?>` outputs use `esc_html()`, `esc_attr()`, `esc_url()`, or `wp_kses_post()` as appropriate
- [ ] No hardcoded URLs — use `home_url()`, `get_template_directory_uri()`, `esc_url()`
- [ ] All user-facing strings wrapped in `__()` or `esc_html__()`
- [ ] `wp_head()` called just before `</head>`
- [ ] `wp_body_open()` called just after `<body>`
- [ ] `wp_footer()` called just before `</body>`
- [ ] Scripts enqueued in footer (third param `true`) unless needed in `<head>`
- [ ] Theme passes [Theme Check](https://wordpress.org/plugins/theme-check/) plugin (run this in a local WP install)
- [ ] No PHP errors or warnings at `WP_DEBUG=true`
- [ ] Menus, widgets, and logo upload tested in the Customizer
- [ ] Mobile responsive confirmed in browser dev tools
- [ ] Contact form submissions routed through `wp_mail()` or a plugin (WPForms, CF7) rather than raw `mail()`

---

## Commit & deploy

```bash
# From repo root
git add wp-theme/<theme-slug>/
git commit -m "Add WordPress theme: <Human Theme Name>"
git push -u origin <current-branch>
```

Zip the theme folder for upload to a WP install:

```bash
cd wp-theme && zip -r <theme-slug>.zip <theme-slug>/
```

The zip is ready to upload via WP Admin → Appearance → Themes → Add New → Upload Theme.
