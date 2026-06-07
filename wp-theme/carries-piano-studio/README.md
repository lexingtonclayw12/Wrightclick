# Carrie's Piano Studio — WordPress Theme

Custom WordPress theme designed and built by **Wright Click Studio** for Carrie's Piano Studio, Charlotte, NC.

---

## Theme Setup

1. Zip the `carries-piano-studio/` folder.
2. In WP Admin go to **Appearance → Themes → Add New → Upload Theme**.
3. Upload the zip and click **Activate**.

---

## Required Plugins

| Plugin | Why |
|--------|-----|
| **WPForms Lite** (optional) | Replace the built-in contact form with a managed form builder |
| **Advanced Custom Fields** (optional) | Adds field UI for Testimonial/Performance CPTs |

No page-builder dependency. Works with the Classic Editor or Gutenberg.

---

## First-Time Configuration

### 1. Navigation Menus

Go to **Appearance → Menus**:
- Create a menu and assign it to **Primary Navigation** (header).
- Create a second menu and assign it to **Footer Navigation**.

Suggested primary links: `#about`, `#lessons`, `#schedule`, `#music`, `#contact`

### 2. Hero Video

Upload a close-up piano video (MP4, ideally 1920×1080, <20 MB) via **Media → Add New**.  
Copy the file URL, then go to **Appearance → Customize → Hero Section** and paste it into **Hero Video URL**.

A suggested free stock video: search "piano hands close up" on [Pexels Videos](https://www.pexels.com/search/videos/piano/) and download the MP4.

### 3. Customizer Options

**Appearance → Customize** gives you:
- **Hero Section** — heading, subheading, video URL
- **Theme Colors** — gold accent color
- **Contact Details** — email, Facebook URL, Instagram URL

### 4. Custom Logo

**Appearance → Customize → Site Identity → Logo** — upload a PNG logo (recommended: 240×80px transparent PNG).

---

## Adding Content

### Testimonials

**WP Admin → Testimonials → Add New**

| Custom Field | Value |
|---|---|
| `_cps_testimonial_author` | Student or parent name |
| `_cps_testimonial_role` | e.g. "Studio Parent", "Adult Student" |
| `_cps_testimonial_stars` | Integer 1–5 |

The testimonial body goes in the standard WordPress editor.

### Performances

**WP Admin → Performances → Add New**

| Custom Field | Value |
|---|---|
| `_cps_video_embed` | Paste the `<iframe>` embed code from YouTube/Vimeo |

Add a featured image for video thumbnail. The title and excerpt appear below the video.

---

## Image Sizes

| Size name | Dimensions | Used for |
|---|---|---|
| `hero-image` | 1920 × 1080 (crop) | Single post thumbnail |
| `card-thumbnail` | 800 × 600 (crop) | Blog/performance cards |
| `portrait` | 600 × 800 (crop) | About section photo |

Upload images at least at these pixel dimensions for best quality.

---

## Contact Form (AJAX)

The built-in form submits via `wp-ajax` to the action `cps_contact`. Add this to `functions.php` (or a plugin) to process submissions:

```php
add_action( 'wp_ajax_nopriv_cps_contact', 'cps_handle_contact' );
add_action( 'wp_ajax_cps_contact',        'cps_handle_contact' );

function cps_handle_contact() {
    check_ajax_referer( 'cps-nonce', 'nonce' );

    $name    = sanitize_text_field( $_POST['name']    ?? '' );
    $email   = sanitize_email(      $_POST['email']   ?? '' );
    $level   = sanitize_text_field( $_POST['level']   ?? '' );
    $message = sanitize_textarea_field( $_POST['message'] ?? '' );

    if ( ! $name || ! $email || ! $message ) {
        wp_send_json_error( 'Missing fields.' );
    }

    $to      = get_theme_mod( 'cps_contact_email', 'carriewright1977@me.com' );
    $subject = "New inquiry from $name via carriespianostudio.org";
    $body    = "Name: $name\nEmail: $email\nLevel: $level\n\nMessage:\n$message";
    $headers = [ "Reply-To: $name <$email>", 'Content-Type: text/plain; charset=UTF-8' ];

    $sent = wp_mail( $to, $subject, $body, $headers );
    $sent ? wp_send_json_success() : wp_send_json_error( 'Mail failed.' );
}
```

Alternatively, replace the built-in form with **WPForms Lite** and set `cps_wpforms_id` in the Customizer.

---

## Child Theme

Never edit this theme directly — updates will overwrite your changes. Create a child theme:

```php
/* child theme style.css */
/*
 * Theme Name:  Carrie's Piano Studio Child
 * Template:    carries-piano-studio
 */
```

---

## Support

Built by **Wright Click Studio** — [wrightclickstudio.com](https://wrightclickstudio.com)
