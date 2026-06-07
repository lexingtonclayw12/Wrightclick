<?php get_header(); ?>

<main id="primary" class="site-main front-page">

	<!-- ═══════════════════════════════════════════════════════════
	     HERO — full-screen video + piano string canvas overlay
	════════════════════════════════════════════════════════════════ -->
	<section id="hero" class="hero" aria-label="<?php esc_attr_e( 'Hero', 'carries-piano-studio' ); ?>">

		<?php $video_url = get_theme_mod( 'cps_hero_video_url', '' ); ?>
		<?php if ( $video_url ) : ?>
			<video
				class="hero-video"
				autoplay
				muted
				loop
				playsinline
				poster="<?php echo esc_url( CPS_URI . '/assets/images/hero-poster.jpg' ); ?>"
				aria-hidden="true"
			>
				<source src="<?php echo esc_url( $video_url ); ?>" type="video/mp4">
			</video>
		<?php else : ?>
			<div class="hero-video-placeholder" aria-hidden="true"></div>
		<?php endif; ?>

		<!-- Piano string canvas animation overlay -->
		<canvas id="piano-strings-canvas" class="piano-strings-canvas" aria-hidden="true"></canvas>

		<div class="hero-overlay" aria-hidden="true"></div>

		<div class="hero-content">
			<p class="hero-eyebrow">
				<span class="eyebrow-line"></span>
				<?php esc_html_e( 'Charlotte, NC · Since 1999', 'carries-piano-studio' ); ?>
				<span class="eyebrow-line"></span>
			</p>
			<h1 class="hero-heading">
				<?php echo esc_html( get_theme_mod( 'cps_hero_heading', 'The Art of Piano' ) ); ?>
			</h1>
			<p class="hero-subheading">
				<?php echo esc_html( get_theme_mod( 'cps_hero_subheading', 'Piano lessons for all ages & levels in Charlotte, NC' ) ); ?>
			</p>
			<div class="hero-actions">
				<a href="#contact" class="btn btn-gold btn-lg"><?php esc_html_e( 'Begin Your Journey', 'carries-piano-studio' ); ?></a>
				<a href="#about" class="btn btn-ghost btn-lg"><?php esc_html_e( 'Meet Carrie', 'carries-piano-studio' ); ?></a>
			</div>
		</div>

		<div class="hero-scroll-indicator" aria-hidden="true">
			<div class="scroll-mouse">
				<div class="scroll-wheel"></div>
			</div>
			<span><?php esc_html_e( 'Scroll', 'carries-piano-studio' ); ?></span>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     MARQUEE STRIP
	════════════════════════════════════════════════════════════════ -->
	<div class="marquee-strip" aria-hidden="true">
		<div class="marquee-track">
			<?php
			$items = [
				__( 'Piano Lessons', 'carries-piano-studio' ),
				__( 'All Ages & Levels', 'carries-piano-studio' ),
				__( 'Charlotte, NC', 'carries-piano-studio' ),
				__( 'B.S. Music Education', 'carries-piano-studio' ),
				__( 'SMU Alumna', 'carries-piano-studio' ),
				__( 'Teaching Since 1999', 'carries-piano-studio' ),
				__( 'Faber Piano Adventures', 'carries-piano-studio' ),
				__( 'In-Home Studio', 'carries-piano-studio' ),
			];
			$repeated = array_merge( $items, $items );
			foreach ( $repeated as $item ) :
				?>
				<span class="marquee-item">
					<span class="marquee-dot" aria-hidden="true">♩</span>
					<?php echo esc_html( $item ); ?>
				</span>
			<?php endforeach; ?>
		</div>
	</div>

	<!-- ═══════════════════════════════════════════════════════════
	     ABOUT / BIO
	════════════════════════════════════════════════════════════════ -->
	<section id="about" class="section about-section" data-reveal>
		<div class="container">
			<div class="about-grid">
				<div class="about-image-col" data-reveal-child>
					<div class="about-image-frame">
						<?php if ( has_post_thumbnail() ) : ?>
							<?php the_post_thumbnail( 'portrait', [ 'class' => 'about-portrait', 'alt' => esc_attr__( 'Carrie Wright — Piano Instructor', 'carries-piano-studio' ) ] ); ?>
						<?php else : ?>
							<div class="about-portrait-placeholder">
								<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
									<circle cx="50" cy="35" r="20" stroke="currentColor" stroke-width="1.5"/>
									<path d="M10 90c0-22 18-38 40-38s40 16 40 38" stroke="currentColor" stroke-width="1.5"/>
								</svg>
							</div>
						<?php endif; ?>
						<div class="about-credential-badge">
							<span class="badge-label"><?php esc_html_e( 'B.S. Music Education', 'carries-piano-studio' ); ?></span>
							<span class="badge-school"><?php esc_html_e( 'Southern Methodist University', 'carries-piano-studio' ); ?></span>
						</div>
					</div>
				</div>

				<div class="about-text-col" data-reveal-child>
					<p class="section-eyebrow"><?php esc_html_e( 'About Your Instructor', 'carries-piano-studio' ); ?></p>
					<h2 class="section-title"><?php esc_html_e( 'Music is a lifelong conversation between the hands and the heart.', 'carries-piano-studio' ); ?></h2>

					<p><?php esc_html_e( 'Carrie Wright holds a B.S. in Music Education from Southern Methodist University (1999), with concentrations in piano and clarinet. She has been teaching piano since high school — a passion that has only deepened over the decades.', 'carries-piano-studio' ); ?></p>

					<p><?php esc_html_e( 'Carrie teaches students of all ages and levels, from complete beginners discovering the keyboard for the first time to experienced players looking to refine their technique. Her approach blends classical fundamentals with genuine encouragement, creating a studio where every student feels confident and inspired.', 'carries-piano-studio' ); ?></p>

					<div class="about-stats">
						<div class="stat-item">
							<span class="stat-number">25+</span>
							<span class="stat-label"><?php esc_html_e( 'Years Teaching', 'carries-piano-studio' ); ?></span>
						</div>
						<div class="stat-divider" aria-hidden="true"></div>
						<div class="stat-item">
							<span class="stat-number"><?php esc_html_e( 'All', 'carries-piano-studio' ); ?></span>
							<span class="stat-label"><?php esc_html_e( 'Ages Welcome', 'carries-piano-studio' ); ?></span>
						</div>
						<div class="stat-divider" aria-hidden="true"></div>
						<div class="stat-item">
							<span class="stat-number">2</span>
							<span class="stat-label"><?php esc_html_e( 'Studio Locations', 'carries-piano-studio' ); ?></span>
						</div>
					</div>

					<a href="#contact" class="btn btn-gold"><?php esc_html_e( 'Inquire About Lessons', 'carries-piano-studio' ); ?></a>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     ORNAMENTAL DIVIDER
	════════════════════════════════════════════════════════════════ -->
	<div class="ornament-divider" aria-hidden="true">
		<span class="ornament-line"></span>
		<span class="ornament-glyph">♪</span>
		<span class="ornament-line"></span>
	</div>

	<!-- ═══════════════════════════════════════════════════════════
	     LESSONS
	════════════════════════════════════════════════════════════════ -->
	<section id="lessons" class="section lessons-section" data-reveal>
		<div class="container">
			<div class="section-header text-center" data-reveal-child>
				<p class="section-eyebrow"><?php esc_html_e( 'What to Expect', 'carries-piano-studio' ); ?></p>
				<h2 class="section-title"><?php esc_html_e( 'Lessons Tailored to You', 'carries-piano-studio' ); ?></h2>
				<p class="section-desc"><?php esc_html_e( 'Whether you\'re picking up the piano for the first time or advancing your existing skills, lessons are personalized to match your goals, pace, and musical interests.', 'carries-piano-studio' ); ?></p>
			</div>

			<div class="lessons-grid" data-reveal-child>
				<div class="lesson-card glass-card">
					<div class="lesson-icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
					</div>
					<h3><?php esc_html_e( 'Beginner', 'carries-piano-studio' ); ?></h3>
					<p><?php esc_html_e( 'Start your musical journey from scratch. Learn proper technique, note reading, rhythm, and foundational pieces in a supportive, encouraging environment.', 'carries-piano-studio' ); ?></p>
					<ul class="lesson-features">
						<li><?php esc_html_e( 'No prior experience needed', 'carries-piano-studio' ); ?></li>
						<li><?php esc_html_e( 'Ages 5 and up', 'carries-piano-studio' ); ?></li>
						<li><?php esc_html_e( 'Faber Piano Adventures curriculum', 'carries-piano-studio' ); ?></li>
					</ul>
				</div>

				<div class="lesson-card glass-card featured-card">
					<div class="card-badge"><?php esc_html_e( 'Most Popular', 'carries-piano-studio' ); ?></div>
					<div class="lesson-icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1"/></svg>
					</div>
					<h3><?php esc_html_e( 'Intermediate', 'carries-piano-studio' ); ?></h3>
					<p><?php esc_html_e( 'Refine your technique, expand your repertoire, and develop musicianship. Explore classical, contemporary, and everything in between.', 'carries-piano-studio' ); ?></p>
					<ul class="lesson-features">
						<li><?php esc_html_e( 'Build on existing skills', 'carries-piano-studio' ); ?></li>
						<li><?php esc_html_e( 'Theory & sight-reading', 'carries-piano-studio' ); ?></li>
						<li><?php esc_html_e( 'Performance opportunities', 'carries-piano-studio' ); ?></li>
					</ul>
				</div>

				<div class="lesson-card glass-card">
					<div class="lesson-icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
					</div>
					<h3><?php esc_html_e( 'Advanced & Adult', 'carries-piano-studio' ); ?></h3>
					<p><?php esc_html_e( 'For adult learners returning to piano or experienced students ready to push their artistry. Flexible scheduling includes homeschool and morning slots.', 'carries-piano-studio' ); ?></p>
					<ul class="lesson-features">
						<li><?php esc_html_e( 'Adult & homeschool-friendly', 'carries-piano-studio' ); ?></li>
						<li><?php esc_html_e( 'Thursday morning slots available', 'carries-piano-studio' ); ?></li>
						<li><?php esc_html_e( 'Goal-oriented curriculum', 'carries-piano-studio' ); ?></li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     SCHEDULE / AVAILABILITY
	════════════════════════════════════════════════════════════════ -->
	<section id="schedule" class="section schedule-section dark-section" data-reveal>
		<div class="container">
			<div class="section-header text-center" data-reveal-child>
				<p class="section-eyebrow"><?php esc_html_e( 'Availability', 'carries-piano-studio' ); ?></p>
				<h2 class="section-title"><?php esc_html_e( 'Studio Schedule', 'carries-piano-studio' ); ?></h2>
			</div>

			<div class="schedule-grid" data-reveal-child>
				<div class="schedule-card glass-card">
					<div class="schedule-day"><?php esc_html_e( 'Monday', 'carries-piano-studio' ); ?></div>
					<div class="schedule-time"><?php esc_html_e( 'Afternoon', 'carries-piano-studio' ); ?></div>
					<div class="schedule-note"><?php esc_html_e( 'All ages & levels', 'carries-piano-studio' ); ?></div>
				</div>
				<div class="schedule-card glass-card">
					<div class="schedule-day"><?php esc_html_e( 'Thursday', 'carries-piano-studio' ); ?></div>
					<div class="schedule-time"><?php esc_html_e( 'Morning & Afternoon', 'carries-piano-studio' ); ?></div>
					<div class="schedule-note"><?php esc_html_e( 'Mornings reserved for homeschool students & adults', 'carries-piano-studio' ); ?></div>
				</div>
			</div>

			<p class="schedule-note-global text-center" data-reveal-child>
				<?php esc_html_e( 'Schedule is subject to change. Contact Carrie to check current availability and reserve your spot.', 'carries-piano-studio' ); ?>
			</p>
			<div class="text-center" data-reveal-child>
				<a href="#contact" class="btn btn-gold"><?php esc_html_e( 'Check Availability', 'carries-piano-studio' ); ?></a>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     MUSIC & PERFORMANCES
	════════════════════════════════════════════════════════════════ -->
	<section id="music" class="section music-section" data-reveal>
		<div class="container">
			<div class="section-header text-center" data-reveal-child>
				<p class="section-eyebrow"><?php esc_html_e( 'Listen & Watch', 'carries-piano-studio' ); ?></p>
				<h2 class="section-title"><?php esc_html_e( 'Music & Performances', 'carries-piano-studio' ); ?></h2>
				<p class="section-desc"><?php esc_html_e( 'A glimpse into the studio — student recitals, performances, and the joy of music brought to life.', 'carries-piano-studio' ); ?></p>
			</div>

			<div class="performances-grid" data-reveal-child>
				<?php
				$performances = new WP_Query( [
					'post_type'      => 'performance',
					'posts_per_page' => 3,
					'orderby'        => 'date',
					'order'          => 'DESC',
				] );
				if ( $performances->have_posts() ) :
					while ( $performances->have_posts() ) : $performances->the_post();
						$video_embed = get_post_meta( get_the_ID(), '_cps_video_embed', true );
						?>
						<div class="performance-card glass-card">
							<?php if ( $video_embed ) : ?>
								<div class="performance-video-wrap">
									<?php echo wp_kses_post( $video_embed ); ?>
								</div>
							<?php elseif ( has_post_thumbnail() ) : ?>
								<div class="performance-thumb">
									<?php the_post_thumbnail( 'card-thumbnail' ); ?>
								</div>
							<?php endif; ?>
							<div class="performance-info">
								<h3><?php the_title(); ?></h3>
								<?php the_excerpt(); ?>
							</div>
						</div>
						<?php
					endwhile;
					wp_reset_postdata();
				else :
					?>
					<!-- Placeholder cards shown before any performance CPT entries exist -->
					<div class="performance-card glass-card performance-placeholder">
						<div class="performance-placeholder-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
						</div>
						<div class="performance-info">
							<h3><?php esc_html_e( 'Student Recital 2024', 'carries-piano-studio' ); ?></h3>
							<p><?php esc_html_e( 'Add performance videos via WP Admin → Performances.', 'carries-piano-studio' ); ?></p>
						</div>
					</div>
					<div class="performance-card glass-card performance-placeholder">
						<div class="performance-placeholder-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
						</div>
						<div class="performance-info">
							<h3><?php esc_html_e( 'Spring Concert 2024', 'carries-piano-studio' ); ?></h3>
							<p><?php esc_html_e( 'Add performance videos via WP Admin → Performances.', 'carries-piano-studio' ); ?></p>
						</div>
					</div>
					<div class="performance-card glass-card performance-placeholder">
						<div class="performance-placeholder-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
						</div>
						<div class="performance-info">
							<h3><?php esc_html_e( 'Holiday Recital 2023', 'carries-piano-studio' ); ?></h3>
							<p><?php esc_html_e( 'Add performance videos via WP Admin → Performances.', 'carries-piano-studio' ); ?></p>
						</div>
					</div>
				<?php endif; ?>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     TESTIMONIALS
	════════════════════════════════════════════════════════════════ -->
	<section id="testimonials" class="section testimonials-section dark-section" data-reveal>
		<div class="container">
			<div class="section-header text-center" data-reveal-child>
				<p class="section-eyebrow"><?php esc_html_e( 'What Families Say', 'carries-piano-studio' ); ?></p>
				<h2 class="section-title"><?php esc_html_e( 'Student Stories', 'carries-piano-studio' ); ?></h2>
			</div>

			<div class="testimonials-track-wrap" data-reveal-child>
				<div class="testimonials-track">
					<?php
					$testimonials = new WP_Query( [
						'post_type'      => 'testimonial',
						'posts_per_page' => 6,
						'orderby'        => 'rand',
					] );
					if ( $testimonials->have_posts() ) :
						while ( $testimonials->have_posts() ) : $testimonials->the_post();
							$author_name  = esc_html( get_post_meta( get_the_ID(), '_cps_testimonial_author', true ) ?: get_the_title() );
							$author_role  = esc_html( get_post_meta( get_the_ID(), '_cps_testimonial_role', true ) ?: __( 'Studio Parent', 'carries-piano-studio' ) );
							$star_count   = absint( get_post_meta( get_the_ID(), '_cps_testimonial_stars', true ) ?: 5 );
							?>
							<div class="testimonial-card glass-card">
								<div class="testimonial-stars" aria-label="<?php echo esc_attr( sprintf( __( '%d out of 5 stars', 'carries-piano-studio' ), $star_count ) ); ?>">
									<?php for ( $i = 0; $i < 5; $i++ ) : ?>
										<span class="star <?php echo $i < $star_count ? 'star-filled' : 'star-empty'; ?>" aria-hidden="true">★</span>
									<?php endfor; ?>
								</div>
								<blockquote class="testimonial-quote">
									<p><?php the_content(); ?></p>
								</blockquote>
								<cite class="testimonial-author">
									<span class="author-name"><?php echo $author_name; ?></span>
									<span class="author-role"><?php echo $author_role; ?></span>
								</cite>
							</div>
							<?php
						endwhile;
						wp_reset_postdata();
					else :
						// Placeholder testimonials
						$placeholders = [
							[
								'quote'  => __( 'Carrie has a wonderful gift for meeting students exactly where they are. My daughter started with no experience and now plays beautifully. The patience and encouragement she shows every session is remarkable.', 'carries-piano-studio' ),
								'author' => __( 'Sarah M.', 'carries-piano-studio' ),
								'role'   => __( 'Parent of Student', 'carries-piano-studio' ),
							],
							[
								'quote'  => __( 'As an adult returning to piano after 20 years away, I was nervous. Carrie made it completely comfortable and tailored every lesson to exactly what I needed. Highly recommend!', 'carries-piano-studio' ),
								'author' => __( 'James T.', 'carries-piano-studio' ),
								'role'   => __( 'Adult Student', 'carries-piano-studio' ),
							],
							[
								'quote'  => __( 'My son has been with Carrie for three years. His technique and love for music has grown tremendously. She has a way of making even difficult pieces feel achievable.', 'carries-piano-studio' ),
								'author' => __( 'Michelle K.', 'carries-piano-studio' ),
								'role'   => __( 'Parent of Student', 'carries-piano-studio' ),
							],
							[
								'quote'  => __( 'We drive 30 minutes to lessons because Carrie is simply the best piano teacher we\'ve encountered. Worth every mile. Our homeschool student loves Thursday mornings with her.', 'carries-piano-studio' ),
								'author' => __( 'Rachel D.', 'carries-piano-studio' ),
								'role'   => __( 'Homeschool Parent', 'carries-piano-studio' ),
							],
						];
						foreach ( $placeholders as $p ) :
							?>
							<div class="testimonial-card glass-card">
								<div class="testimonial-stars" aria-label="<?php esc_attr_e( '5 out of 5 stars', 'carries-piano-studio' ); ?>">
									<span class="star star-filled" aria-hidden="true">★</span>
									<span class="star star-filled" aria-hidden="true">★</span>
									<span class="star star-filled" aria-hidden="true">★</span>
									<span class="star star-filled" aria-hidden="true">★</span>
									<span class="star star-filled" aria-hidden="true">★</span>
								</div>
								<blockquote class="testimonial-quote">
									<p><?php echo esc_html( $p['quote'] ); ?></p>
								</blockquote>
								<cite class="testimonial-author">
									<span class="author-name"><?php echo esc_html( $p['author'] ); ?></span>
									<span class="author-role"><?php echo esc_html( $p['role'] ); ?></span>
								</cite>
							</div>
						<?php endforeach; ?>
					<?php endif; ?>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     REPERTOIRE & SUPPLIES
	════════════════════════════════════════════════════════════════ -->
	<section id="repertoire" class="section repertoire-section" data-reveal>
		<div class="container">
			<div class="repertoire-grid">
				<div class="repertoire-text" data-reveal-child>
					<p class="section-eyebrow"><?php esc_html_e( 'Materials', 'carries-piano-studio' ); ?></p>
					<h2 class="section-title"><?php esc_html_e( 'Repertoire & Supplies', 'carries-piano-studio' ); ?></h2>
					<p><?php esc_html_e( 'Carrie uses the Faber Piano Adventures series as the primary curriculum — one of the most respected and comprehensive piano methods available. It provides a clear, musical, and enjoyable progression from beginner through advanced levels.', 'carries-piano-studio' ); ?></p>
					<p><?php esc_html_e( 'Students will also need access to a piano or keyboard at home to practice between sessions. Carrie can advise on suitable instruments for every budget.', 'carries-piano-studio' ); ?></p>

					<div class="supplies-list">
						<div class="supply-item">
							<div class="supply-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
							</div>
							<div>
								<strong><?php esc_html_e( 'Faber Piano Adventures', 'carries-piano-studio' ); ?></strong>
								<span><?php esc_html_e( 'Primary method books — level selected at first lesson', 'carries-piano-studio' ); ?></span>
							</div>
						</div>
						<div class="supply-item">
							<div class="supply-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
							</div>
							<div>
								<strong><?php esc_html_e( 'Piano or Keyboard at Home', 'carries-piano-studio' ); ?></strong>
								<span><?php esc_html_e( 'Required for daily practice. At minimum 61 weighted keys recommended.', 'carries-piano-studio' ); ?></span>
							</div>
						</div>
						<div class="supply-item">
							<div class="supply-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
							</div>
							<div>
								<strong><?php esc_html_e( 'Supplemental Music Folder', 'carries-piano-studio' ); ?></strong>
								<span><?php esc_html_e( 'For sheet music, worksheets, and notes from lessons', 'carries-piano-studio' ); ?></span>
							</div>
						</div>
					</div>
				</div>

				<div class="repertoire-visual" data-reveal-child aria-hidden="true">
					<div class="piano-keys-graphic">
						<div class="piano-key white-key"></div>
						<div class="piano-key black-key"></div>
						<div class="piano-key white-key"></div>
						<div class="piano-key black-key"></div>
						<div class="piano-key white-key"></div>
						<div class="piano-key white-key"></div>
						<div class="piano-key black-key"></div>
						<div class="piano-key white-key"></div>
						<div class="piano-key black-key"></div>
						<div class="piano-key white-key"></div>
						<div class="piano-key black-key"></div>
						<div class="piano-key white-key"></div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     LOCATION
	════════════════════════════════════════════════════════════════ -->
	<section id="location" class="section location-section dark-section" data-reveal>
		<div class="container">
			<div class="section-header text-center" data-reveal-child>
				<p class="section-eyebrow"><?php esc_html_e( 'Where to Find Us', 'carries-piano-studio' ); ?></p>
				<h2 class="section-title"><?php esc_html_e( 'Studio Locations', 'carries-piano-studio' ); ?></h2>
			</div>

			<div class="locations-grid" data-reveal-child>
				<div class="location-card glass-card">
					<div class="location-icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
					</div>
					<h3><?php esc_html_e( 'Home Studio', 'carries-piano-studio' ); ?></h3>
					<p><?php esc_html_e( 'Latta Springs Subdivision off Beatties Ford Road, near Latta Springs Plantation and Francis Bradley Middle School, Charlotte, NC', 'carries-piano-studio' ); ?></p>
					<span class="location-tag"><?php esc_html_e( 'Primary Location', 'carries-piano-studio' ); ?></span>
				</div>
				<div class="location-card glass-card">
					<div class="location-icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
					</div>
					<h3><?php esc_html_e( 'Hawthorne Lane UMC', 'carries-piano-studio' ); ?></h3>
					<p><?php esc_html_e( 'For students closer to Uptown Charlotte. Lessons held at Hawthorne Lane United Methodist Church — contact Carrie for specific room details.', 'carries-piano-studio' ); ?></p>
					<span class="location-tag"><?php esc_html_e( 'Secondary Location', 'carries-piano-studio' ); ?></span>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     CONTACT
	════════════════════════════════════════════════════════════════ -->
	<section id="contact" class="section contact-section" data-reveal>
		<div class="container">
			<div class="contact-grid">
				<div class="contact-info" data-reveal-child>
					<p class="section-eyebrow"><?php esc_html_e( 'Get in Touch', 'carries-piano-studio' ); ?></p>
					<h2 class="section-title"><?php esc_html_e( 'Ready to Start?', 'carries-piano-studio' ); ?></h2>
					<p><?php esc_html_e( 'Reach out to ask about availability, pricing, or to schedule a meet-and-greet. Carrie typically responds within one business day.', 'carries-piano-studio' ); ?></p>

					<div class="contact-methods">
						<a href="mailto:<?php echo esc_attr( get_theme_mod( 'cps_contact_email', 'carriewright1977@me.com' ) ); ?>" class="contact-method">
							<div class="contact-method-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
							</div>
							<div>
								<span class="contact-method-label"><?php esc_html_e( 'Email', 'carries-piano-studio' ); ?></span>
								<span class="contact-method-value"><?php echo esc_html( get_theme_mod( 'cps_contact_email', 'carriewright1977@me.com' ) ); ?></span>
							</div>
						</a>
						<?php if ( $fb = get_theme_mod( 'cps_facebook_url' ) ) : ?>
						<a href="<?php echo esc_url( $fb ); ?>" target="_blank" rel="noopener noreferrer" class="contact-method">
							<div class="contact-method-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
							</div>
							<div>
								<span class="contact-method-label"><?php esc_html_e( 'Facebook', 'carries-piano-studio' ); ?></span>
								<span class="contact-method-value"><?php esc_html_e( 'Message us on Facebook', 'carries-piano-studio' ); ?></span>
							</div>
						</a>
						<?php endif; ?>
					</div>
				</div>

				<div class="contact-form-wrap glass-card" data-reveal-child>
					<?php if ( function_exists( 'wpforms' ) ) : ?>
						<?php wpforms_display( get_theme_mod( 'cps_wpforms_id', '' ) ); ?>
					<?php else : ?>
						<form id="cps-contact-form" class="contact-form" novalidate>
							<?php wp_nonce_field( 'cps-contact', 'cps_contact_nonce' ); ?>

							<div class="form-group">
								<label for="cps-name"><?php esc_html_e( 'Full Name', 'carries-piano-studio' ); ?> <span aria-hidden="true">*</span></label>
								<input type="text" id="cps-name" name="name" autocomplete="name" required>
							</div>

							<div class="form-group">
								<label for="cps-email"><?php esc_html_e( 'Email Address', 'carries-piano-studio' ); ?> <span aria-hidden="true">*</span></label>
								<input type="email" id="cps-email" name="email" autocomplete="email" required>
							</div>

							<div class="form-group">
								<label for="cps-level"><?php esc_html_e( 'Experience Level', 'carries-piano-studio' ); ?></label>
								<select id="cps-level" name="level">
									<option value=""><?php esc_html_e( 'Select a level…', 'carries-piano-studio' ); ?></option>
									<option value="beginner"><?php esc_html_e( 'Complete Beginner', 'carries-piano-studio' ); ?></option>
									<option value="some"><?php esc_html_e( 'Some Prior Experience', 'carries-piano-studio' ); ?></option>
									<option value="intermediate"><?php esc_html_e( 'Intermediate', 'carries-piano-studio' ); ?></option>
									<option value="advanced"><?php esc_html_e( 'Advanced', 'carries-piano-studio' ); ?></option>
									<option value="returning-adult"><?php esc_html_e( 'Returning Adult Learner', 'carries-piano-studio' ); ?></option>
								</select>
							</div>

							<div class="form-group">
								<label for="cps-message"><?php esc_html_e( 'Message', 'carries-piano-studio' ); ?> <span aria-hidden="true">*</span></label>
								<textarea id="cps-message" name="message" rows="5" placeholder="<?php esc_attr_e( 'Tell Carrie a little about yourself or your student…', 'carries-piano-studio' ); ?>" required></textarea>
							</div>

							<button type="submit" class="btn btn-gold btn-full">
								<span class="btn-text"><?php esc_html_e( 'Send Message', 'carries-piano-studio' ); ?></span>
								<span class="btn-loading" aria-hidden="true"></span>
							</button>

							<div class="form-success" role="alert" aria-live="polite" hidden>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
								<p><?php esc_html_e( "Thank you! Carrie will be in touch soon.", 'carries-piano-studio' ); ?></p>
							</div>
							<div class="form-error" role="alert" aria-live="polite" hidden>
								<p><?php esc_html_e( 'Something went wrong. Please email Carrie directly.', 'carries-piano-studio' ); ?></p>
							</div>
						</form>
					<?php endif; ?>
				</div>
			</div>
		</div>
	</section>

</main>

<?php get_footer(); ?>
