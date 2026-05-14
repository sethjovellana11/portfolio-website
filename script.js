document.addEventListener('DOMContentLoaded', () => {
	const body = document.body;
	const themeToggle = document.getElementById('theme-toggle');
	const themeToggleLabel = document.getElementById('theme-toggle-label');
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

	const menuToggle = document.getElementById('menu-toggle');
	const navLinksContainer = document.getElementById('primary-navigation');
	const navLinks = navLinksContainer ? navLinksContainer.querySelectorAll('.nav-link') : [];

	const sections = document.querySelectorAll('main section');
	const fadeTargets = document.querySelectorAll('.fade-in');
	const typed = document.getElementById('typed');
	const contactForm = document.getElementById('contact-form');
	const contactStatus = document.getElementById('contact-status');

	function applyTheme(theme) {
		body.dataset.theme = theme;
		if (themeToggleLabel && themeToggle) {
			themeToggleLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
			themeToggle.firstElementChild.textContent = theme === 'dark' ? '🌙' : '☀️';
		}
		localStorage.setItem('preferred-theme', theme);
	}

	const storedTheme = localStorage.getItem('preferred-theme');
	applyTheme(storedTheme || (prefersDark.matches ? 'dark' : 'light'));

	if (themeToggle) {
		themeToggle.addEventListener('click', () => {
			const nextTheme = body.dataset.theme === 'dark' ? 'light' : 'dark';
			applyTheme(nextTheme);
		});
	}

	prefersDark.addEventListener('change', event => {
		if (!localStorage.getItem('preferred-theme')) {
			applyTheme(event.matches ? 'dark' : 'light');
		}
	});

	if (menuToggle && navLinksContainer) {
		menuToggle.addEventListener('click', () => {
			const isOpen = navLinksContainer.classList.toggle('is-open');
			menuToggle.setAttribute('aria-expanded', String(isOpen));
		});

		navLinks.forEach(link => {
			link.addEventListener('click', () => {
				if (navLinksContainer.classList.contains('is-open')) {
					navLinksContainer.classList.remove('is-open');
					menuToggle.setAttribute('aria-expanded', 'false');
				}
			});
		});
	}

	if (typed) {
		const typedWords = [' Full-Stack Web Developer', ' Software Engineer', ' Data Scientist'];
		let wordIndex = 0;
		let charIndex = 0;
		let isDeleting = false;
		let typingDelay = 120;

		const typeLoop = () => {
			const currentWord = typedWords[wordIndex];
			const visibleText = isDeleting ? currentWord.slice(0, charIndex--) : currentWord.slice(0, charIndex++);
			typed.textContent = visibleText;

			if (!isDeleting && charIndex === currentWord.length + 1) {
				isDeleting = true;
				typingDelay = 1800;
			} else if (isDeleting && charIndex === 0) {
				isDeleting = false;
				wordIndex = (wordIndex + 1) % typedWords.length;
				typingDelay = 240;
			} else {
				typingDelay = isDeleting ? 45 : 120;
			}

			setTimeout(typeLoop, typingDelay);
		};

		typeLoop();
	}

	if (fadeTargets.length) {
		const observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.18 });

		fadeTargets.forEach(section => observer.observe(section));
	}

	if (sections.length && navLinks.length) {
		const activeLinkObserver = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					navLinks.forEach(link => link.classList.remove('is-active'));
					const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
					if (active) {
						active.classList.add('is-active');
					}
				}
			});
		}, { threshold: 0.4 });

		sections.forEach(section => activeLinkObserver.observe(section));
	}

	const yearEl = document.getElementById('year');
	if (yearEl) {
		yearEl.textContent = new Date().getFullYear();
	}

	if (contactForm && contactStatus) {
		const submitButton = contactForm.querySelector('button[type="submit"]');
		const defaultButtonText = submitButton ? submitButton.textContent : '';
		const rawAction = contactForm.getAttribute('action') || '';
		const ajaxEndpoint = rawAction.includes('formsubmit.co')
			? rawAction.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/')
			: rawAction;

		contactForm.addEventListener('submit', async event => {
			event.preventDefault();
			contactStatus.textContent = 'Sending message…';
			contactStatus.classList.remove('is-error', 'is-success');

			if (!ajaxEndpoint) {
				contactStatus.textContent = 'This form still needs to be configured. Please email me directly.';
				contactStatus.classList.add('is-error');
				return;
			}

			if (submitButton) {
				submitButton.disabled = true;
				submitButton.textContent = 'Sending…';
			}

			try {
				const formData = new FormData(contactForm);
				const response = await fetch(ajaxEndpoint, {
					method: 'POST',
					headers: { 'Accept': 'application/json' },
					body: formData
				});

				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				contactForm.reset();
				contactStatus.textContent = 'Thanks! Your message is on its way.';
				contactStatus.classList.add('is-success');
			} catch (error) {
				console.error('Contact form submission failed', error);
				contactStatus.textContent = 'Something went wrong. Feel free to email me directly at reuben_jovellana@dlsu.edu.ph.';
				contactStatus.classList.add('is-error');
			} finally {
				if (submitButton) {
					submitButton.disabled = false;
					submitButton.textContent = defaultButtonText;
				}
			}
		});
	}
});
