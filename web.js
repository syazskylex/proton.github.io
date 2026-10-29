$(document).ready(async function () {
	await lucide.createIcons();
	
	// Initialize Parallax
	$(".parallax").each(function() {
		let bg = $(this).attr("src");
		if (bg && typeof $(this).parallax === 'function') {
			$(this).parallax({imageSrc: bg});
		}
	});
	
	if ($('#birds').length) await birds();
	if ($(window).width() >= 1024 && $('#admin-sidebar').length) {
		$('#admin-sidebar').removeClass('-translate-x-full').addClass('translate-x-0');
		$('#admin-nav').addClass('ms-84');
		$('#main-content').addClass('left-84').removeClass('left-0').css('width', 'calc(100vw - 350px)');
	}

	$url = window.location.href;
	$url = $url.replace("https://mixswift.com/", "");
	if (!$url.includes('admin')) await openModal("Maintenance", "The system is currently under maintenance. Some features may be unavailable.", { width: '400px' });

	// Initialize scroll animations
	//initScrollAnimations();
	
	// Initialize counter animations
	//initCounterAnimations();
	
	// Initialize lazy loading
	//initLazyLoading();
	
	// Initialize form validation
	//initFormValidation();
	
	// Initialize button ripple effects
	//initRippleEffects();
	
	// Navbar scroll effect
	//initNavbarScroll();

    // Smooth scroll for anchor links
    $(document).on('click', 'a[href^="#"]:not([href="#"])', function(e) {
        const href = $(this).attr('href');
        const target = $(href);
        
        // Only prevent default if target element exists
        if (target.length && href !== '#') {
            e.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 80
            }, 1000);
        }
    });

	//await animate('#loading', 'fadeOut', function () {
		//$('#loading').hide();
	//});
});

// Scroll Animation System - Animate on both scroll up and down with async completion
function initScrollAnimations() {
	if (typeof IntersectionObserver === 'undefined') return;
	
	const observerOptions = {
		root: null,
		rootMargin: '0px 80px -80px 0px',
		threshold: 0.1
	};

	// Helper function to wait for animation to complete
	async function animateElement($element, animationClass) {
		return new Promise((resolve) => {
			// Remove all animation classes first
			$element.removeClass('animate__animated animate__fadeOut animate__fadeInUp');
			
			// Force reflow to ensure classes are removed
			void $element[0].offsetWidth;
			
			// Small delay before adding new animation
			setTimeout(() => {
				$element.addClass('animate__animated ' + animationClass);
				
				// Wait for animation to complete
				const handleAnimationEnd = () => {
					$element.off('animationend', handleAnimationEnd);
					// Remove animate__animated immediately after completion
					$element.removeClass('animate__animated');
					resolve();
				};
				
				$element.on('animationend', handleAnimationEnd);
				
				// Fallback timeout
				setTimeout(() => {
					$element.off('animationend', handleAnimationEnd);
					$element.removeClass('animate__animated');
					resolve();
				}, 800);
			}, 50);
		});
	}

	// Main observer - animate both directions
	const observer = new IntersectionObserver(async function(entries) {
		for (const entry of entries) {
			const $target = $(entry.target);
			
			// Skip if element is part of a custom animation system
			//if ($target.data('proton-element') || $target.data('animated')) {
				//continue;
			//}
			
			// Skip if animation is already in progress
			if ($target.data('animating') === 'true') {
				continue;
			}
			
			$target.data('animating', 'true');
			
			if (entry.isIntersecting) {
				// Element entering viewport - animate in
				$target.css('opacity', '1');
				await animateElement($target, 'animate__fadeInUp');
			} else {
				// Element leaving viewport - animate out
				await animateElement($target, 'animate__fadeOut');
				$target.css('opacity', '0');
			}
			
			$target.data('animating', 'false');
		}
	}, observerOptions);

	// Observe all animatable elements (excluding proton-specific elements)
	$('.card:not([data-proton-element]), .stat-card:not([data-proton-element]), .feature-icon:not([data-proton-element])').each(function() {
		const $el = $(this);
		if (!$el.data('animated')) {
			$el.css({
				'opacity': '0',
				'transition': 'none'
			});
			$el.data('animating', 'false');
			observer.observe(this);
		}
	});

	// Header animations - both directions
	const headerObserver = new IntersectionObserver(async function(entries) {
		for (const entry of entries) {
			const $target = $(entry.target);
			
			// Skip if element is part of a custom animation system
			if ($target.data('proton-element') || $target.data('animated')) {
				continue;
			}
			
			// Skip if animation is already in progress
			if ($target.data('animating') === 'true') {
				continue;
			}
			
			$target.data('animating', 'true');
			
			if (entry.isIntersecting) {
				// Element entering viewport
				$target.css({
					'opacity': '1',
					'transform': 'translateY(0)'
				});
				await animateElement($target, 'animate__fadeInUp');
			} else {
				// Element leaving viewport
				//await animateElement($target, 'animate__fadeOut');
				//$target.css('opacity', '0');
			}
			
			$target.data('animating', 'false');
		}
	}, observerOptions);

	$('h2:not([data-proton-element]):not([data-animated]), h3:not([data-proton-element]):not([data-animated]), .text-center:not([data-proton-element]):not([data-animated]), .section-title:not([data-proton-element]):not([data-animated])').each(function() {
		const $header = $(this);
		if (!$header.data('animated')) {
			$header.css({
				'opacity': '0',
				'transition': 'none'
			});
			$header.data('animating', 'false');
			headerObserver.observe(this);
		}
	});
}

// Counter animation for statistics
function animateCounter(element, start, end, duration) {
	let startTime = null;
	const step = (timestamp) => {
		if (!startTime) startTime = timestamp;
		const progress = Math.min((timestamp - startTime) / duration, 1);
		const value = Math.floor(progress * (end - start) + start);
		element.textContent = value + (element.dataset.suffix || '');
		if (progress < 1) {
			window.requestAnimationFrame(step);
		}
	};
	window.requestAnimationFrame(step);
}

// Initialize counter animations
function initCounterAnimations() {
	if (typeof IntersectionObserver !== 'undefined') {
		const counterObserver = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const element = entry.target;
					const endValue = parseInt(element.dataset.count || element.textContent);
					animateCounter(element, 0, endValue, 2000);
					counterObserver.unobserve(element);
				}
			});
		}, { threshold: 0.5 });

		document.querySelectorAll('.stat-card .text-4xl, [data-count]').forEach(el => {
			counterObserver.observe(el);
		});
	}
}

// Parallax effect on mouse move
/*
$(document).on('mousemove', function(e) {
	const moveX = (e.pageX * -1 / 50);
	const moveY = (e.pageY * -1 / 50);
	$('.parallax-bg').css({
		'transform': `translate(${moveX}px, ${moveY}px)`
	});
});
*/

// Terminal typing effect
function typeWriter(element, text, speed = 50) {
	let i = 0;
	const typing = setInterval(() => {
		if (i < text.length) {
			element.textContent += text.charAt(i);
			i++;
		} else {
			clearInterval(typing);
		}
	}, speed);
}

// Navbar scroll effect
function initNavbarScroll() {
	let lastScroll = 0;
	$(window).scroll(function() {
		const currentScroll = $(this).scrollTop();

		if (currentScroll > 100) {
			$('.navbar').addClass('shadow-lg');
		} else {
			$('.navbar').removeClass('shadow-lg');
		}

		lastScroll = currentScroll;
	});
}

// Lazy load images
function initLazyLoading() {
	if ('IntersectionObserver' in window) {
		const imageObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const img = entry.target;
					if (img.dataset.src) {
						img.src = img.dataset.src;
						img.classList.remove('lazy');
						observer.unobserve(img);
					}
				}
			});
		});

		document.querySelectorAll('img.lazy').forEach(img => {
			imageObserver.observe(img);
		});
	}
}

// Button ripple effect
function initRippleEffects() {
	$('.btn').on('click', function(e) {
		const btn = $(this);
		const ripple = $('<span class="ripple"></span>');
		const diameter = Math.max(btn.width(), btn.height());
		const radius = diameter / 2;

		ripple.css({
			width: diameter,
			height: diameter,
			left: e.pageX - btn.offset().left - radius,
			top: e.pageY - btn.offset().top - radius
		});

		btn.append(ripple);

		setTimeout(() => ripple.remove(), 600);
	});

	// Add CSS for ripple effect
	if (!$('#ripple-style').length) {
		$('head').append(`
			<style id="ripple-style">
				.btn {
					position: relative;
					overflow: hidden;
				}
				.ripple {
					position: absolute;
					border-radius: 50%;
					background: rgba(255, 255, 255, 0.5);
					transform: scale(0);
					animation: ripple-animation 0.6s ease-out;
					pointer-events: none;
				}
				@keyframes ripple-animation {
					to {
						transform: scale(4);
						opacity: 0;
					}
				}
			</style>
		`);
	}
}

// Form validation
function initFormValidation() {
	$('form').on('submit', function(e) {
		const form = $(this);
		// Skip validation for modal forms or forms with data-skip-validation
		if (form.attr('id') === 'modal-form' || form.data('skip-validation')) {
			return;
		}
		const requiredFields = form.find('[required]');
		let isValid = true;

		requiredFields.each(function() {
			if (!$(this).val()) {
				isValid = false;
				$(this).addClass('border-error');
			} else {
				$(this).removeClass('border-error');
			}
		});

		if (!isValid) {
			e.preventDefault();
			showToast('Please fill in all required fields', 'error');
		}
	});

	// Remove error class on input
	$('input, textarea, select').on('input change', function() {
		$(this).removeClass('border-error');
	});
}

async function page(page) {
	window.location.replace(page);
}

async function birds() {
	VANTA.BIRDS({
		el: '#birds',
		mouseControls: true,
		touchControls: true,
		gyroControls: false,
		minHeight: 150.00,
		minWidth: 150.00,
		scale: 1.00,
		scaleMobile: 1.00,
		color1: 0x3C89D1,
		color2: 0x2E6FAF,
		quantity: 4.00,
		birdSize: 1.00,
		wingSpan: 1.00,
		speedLimit: 8.00,
		separation: 100.00,
		alignment: 8.00,
		cohesion: 8.00
	});
}

async function PostForm(page, data) {
	const submitUrl = page;
	data._token = $("#csrf-token").attr('content');
	try {
		return JSON.parse(await $.ajax({
			type: "POST",
			url: submitUrl,
			data: data,
			contentType: 'application/x-www-form-urlencoded',
			dataType: 'text'
		}));
	} catch (error) {
		showToast("AJAX Error:" + error, 'error');
	}
}

async function showToast(message, type = 'info', timeout = 5000) {
	let $container = $('#toast-container');
	if ($container.length === 0) {
		$container = $('<div id="toast-container" class="toast show toast-end toast-bottom bg-transparent w-auto z-20"></div>');
		$('body').append($container);
	}
	const $toast = $(`
        <div class="alert alert-${type} m-0">
            <span>${message}</span>
        </div>
    `);
	$container.append($toast);
	setTimeout(() => {
		$toast.fadeOut(1000, function () {
			$(this).remove();
		});
	}, timeout);
}

async function animate(element, animationName, callback) {
	const node = $(element);
	node.addClass(`animate__animated animate__${animationName}`);
	function handleAnimationEnd() {
		node.removeClass(`animate__animated animate__${animationName}`);
		node.off('animationend', handleAnimationEnd);
		if (typeof callback === 'function') callback();
	}
	node.on('animationend', handleAnimationEnd);
}

async function theme(data) {
	$("html").attr("data-theme", data);
	await PostForm(`admin/theme/${data}`, { theme: data });
}
// Legacy navigation function for older admin panels
async function nav() {
	if($(".sidebar-title").hasClass("d-sm-flex")){
		$(".sidebar").css("width","55px");
		$("#nhide-left").toggleClass("d-none");
		$("#nhide-right").toggleClass("d-none");
		$(".adminpage").css("left","70px");
		$(".adminpage").css("width","calc(100vw - 70px)");
	} else {
		$(".sidebar").css("width","250px");
		$("#nhide-left").toggleClass("d-none");
		$("#nhide-right").toggleClass("d-none");
		$(".adminpage").css("left","270px");
		$(".adminpage").css("width","calc(100vw - 280px)");
	}
	$(".sidebar-title").toggleClass("d-sm-flex");
}

// Utility function: Scroll to section
function scrollToSection(sectionId) {
	const section = document.getElementById(sectionId);
	if (section) {
		section.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
}

// Utility function: Toggle feature details
function toggleFeatureDetails(element) {
	const details = $(element).find('.feature-details');
	details.slideToggle(300);
}

// Utility function: Check if element is in viewport
function isInViewport(element) {
	const rect = element.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}

// Utility function: Debounce
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

// Utility function: Track events for analytics
function trackEvent(category, action, label) {
	console.log(`Event tracked: ${category} - ${action} - ${label}`);
	// Add analytics integration here (Google Analytics, Mixpanel, etc.)
}
async function toggleSidebar() {
	const sidebar = $('#admin-sidebar');
	const nav = $('#admin-nav');
	const content = $('#main-content');
	if ($(window).width() >= 1024) {
		if (sidebar.hasClass('-translate-x-full')) {
			sidebar.removeClass('-translate-x-full').addClass('translate-x-0').css('width', '');
			nav.addClass('ms-84').removeClass('ms-20');
			content.addClass('left-84').removeClass('left-0 left-20').css('width', 'calc(100vw - 350px)');
		} else {
			sidebar.removeClass('translate-x-0').addClass('-translate-x-full').css('width', '');
			nav.removeClass('ms-84 ms-20');
			content.removeClass('left-84 left-20').addClass('left-0').css('width', '100%');
		}
	} else if ($(window).width() < 640) {
		if (sidebar.hasClass('-translate-x-full')) {
			sidebar.removeClass('-translate-x-full').addClass('translate-x-0').css('width', '82px');
			content.addClass('left-20').removeClass('left-0 left-84').css('width', 'calc(100vw - 82px)');
		} else {
			sidebar.removeClass('translate-x-0').addClass('-translate-x-full').css('width', '82px');
			content.removeClass('left-20 left-84').addClass('left-0').css('width', '100%');
		}
	} else {
		if (sidebar.hasClass('-translate-x-full')) {
			sidebar.removeClass('-translate-x-full').addClass('translate-x-0').css('width', '');
		} else {
			sidebar.removeClass('translate-x-0').addClass('-translate-x-full').css('width', '');
		}
	}
}

if ($('#sidebar-toggle').length) {
	$('#sidebar-toggle, #sidebar-close').on('click', function () {
		toggleSidebar();
	});

	$(window).on('resize', function () {
		const sidebar = $('#admin-sidebar');
		const nav = $('#admin-nav');
		const content = $('#main-content');
		
		if ($(window).width() >= 1024) {
			sidebar.removeClass('-translate-x-full').addClass('translate-x-0').css('width', '');
			nav.addClass('ms-84').removeClass('ms-20');
			content.addClass('left-84').removeClass('left-0 left-20').css('width', 'calc(100vw - 350px)');
		} else {
			sidebar.removeClass('translate-x-0').addClass('-translate-x-full').css('width', '');
			nav.removeClass('ms-84 ms-20');
			content.removeClass('left-84 left-20').addClass('left-0').css('width', '100%');
		}
	});
}

async function openModal(title, content, options = {}) {
	const modal = document.getElementById('modal');
	const modalTitle = document.getElementById('modal-title');
	const modalBody = document.getElementById('modal-body');

	modalTitle.textContent = title;
	modalBody.innerHTML = content;

	if (options.width) {
		modal.querySelector('.modal-box').style.maxWidth = options.width;
	}

	modal.showModal();
}

async function closeModal() {
	const modal = document.getElementById('modal');
	modal.close();
}

// Close modal when home button is pressed
$(document).on('keydown', function(e) {
	if (e.keyCode === 36) {
		const modal = document.getElementById('modal');
		if (modal && modal.open) {
			e.preventDefault(); // Prevent page scroll
			closeModal();
		}
	}
});

async function confirmModal(options) {
	// Handle both old format and new format
	let title, message, confirmText, cancelText, confirmClass, onConfirm;
	
	if (typeof options === 'object' && options.title) {
		// New format: options object
		title = options.title;
		message = options.message;
		confirmText = options.confirmText || 'Confirm';
		cancelText = options.cancelText || 'Cancel';
		confirmClass = options.confirmClass || 'btn-primary';
		onConfirm = options.onConfirm;
	} else {
		// Old format: separate parameters
		title = arguments[0];
		message = arguments[1];
		confirmText = arguments[2] || 'Confirm';
		cancelText = arguments[3] || 'Cancel';
	}

	return new Promise((resolve) => {
		const content = `
            <p class="mb-4">${message}</p>
            <div class="flex justify-end gap-2">
                <button id="modal-cancel" class="btn btn-outline">${cancelText}</button>
                <button id="modal-confirm" class="btn ${confirmClass || 'btn-primary'}">${confirmText}</button>
            </div>
        `;

		openModal(title, content);

		setTimeout(() => {
			$('#modal-confirm').on('click', async function () {
				closeModal();
				if (typeof onConfirm === 'function') {
					await onConfirm();
				}
				resolve(true);
			});

			$('#modal-cancel').on('click', function () {
				closeModal();
				resolve(false);
			});
		}, 100);
	});
}

async function alertModal(title, message, buttonText = 'OK') {
	return new Promise((resolve) => {
		const content = `
            <p class="mb-4">${message}</p>
            <div class="flex justify-end">
                <button id="modal-ok" class="btn btn-primary">${buttonText}</button>
            </div>
        `;

		openModal(title, content);

		setTimeout(() => {
			$('#modal-ok').on('click', function () {
				closeModal();
				resolve(true);
			});
		}, 100);
	});
}

async function formModal(options) {
	// Handle both old format (title, fields, submitCallback, options) and new format (options object)
	let title, fields, submitCallback, submitText, cancelText;
	
	if (typeof options === 'object' && options.title) {
		// New format: single options object
		title = options.title;
		fields = options.fields || [];
		submitCallback = options.onSubmit;
		submitText = options.submitText || 'Submit';
		cancelText = options.cancelText || 'Cancel';
	} else {
		// Old format: separate parameters (for backward compatibility)
		title = arguments[0];
		fields = arguments[1] || [];
		submitCallback = arguments[2];
		const opts = arguments[3] || {};
		submitText = opts.submitText || 'Submit';
		cancelText = opts.cancelText || 'Cancel';
	}

	let formHtml = '<form id="modal-form" class="space-y-4">';

	fields.forEach(field => {
		formHtml += `<div class="form-control w-full">`;
		formHtml += `<label class="label"><span class="label-text">${field.label}${field.required ? ' *' : ''}</span></label>`;

		if (field.type === 'textarea') {
			formHtml += `<textarea name="${field.name}" class="textarea textarea-bordered w-full" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>`;
		} else if (field.type === 'select') {
			const onchange = field.onchange ? `onchange="${field.onchange}"` : '';
			formHtml += `<select name="${field.name}" class="select select-bordered w-full" ${field.required ? 'required' : ''} ${onchange}>`;
			field.options.forEach(opt => {
				// Check both opt.selected and match against field.value
				const isSelected = opt.selected || (field.value != null && opt.value == field.value);
				formHtml += `<option value="${opt.value}" ${isSelected ? 'selected' : ''}>${opt.label}</option>`;
			});
			formHtml += `</select>`;
		} else if (field.type === 'checkbox') {
			formHtml += `<input type="checkbox" name="${field.name}" class="checkbox" ${field.value ? 'checked' : ''} />`;
		} else {
			const step = field.step ? `step="${field.step}"` : '';
			const pattern = field.pattern ? `pattern="${field.pattern}"` : '';
			const onchange = field.onchange ? `onchange="${field.onchange}"` : '';
			const oninput = field.oninput ? `oninput="${field.oninput}"` : '';
			const id = field.id ? `id="${field.id}"` : '';
			formHtml += `<input type="${field.type || 'text'}" name="${field.name}" class="input input-bordered w-full" placeholder="${field.placeholder || ''}" value="${field.value || ''}" ${field.required ? 'required' : ''} ${step} ${pattern} ${onchange} ${oninput} ${id} />`;
		}

		formHtml += `</div>`;
	});

	formHtml += `
        <div class="flex justify-end gap-2 mt-6">
            <button type="button" id="modal-form-cancel" class="btn btn-outline">${cancelText}</button>
            <button type="submit" id="modal-form-submit" class="btn btn-primary">${submitText}</button>
        </div>
    </form>`;

	openModal(title, formHtml);

	setTimeout(() => {
		$('#modal-form').on('submit', async function (e) {
			e.preventDefault();
			const formData = {};
			$(this).serializeArray().forEach(item => {
				formData[item.name] = item.value;
			});
			
			// Handle checkboxes separately
			fields.forEach(field => {
				if (field.type === 'checkbox') {
					formData[field.name] = $(`input[name="${field.name}"]`).is(':checked');
				}
			});

			if (typeof submitCallback === 'function') {
				try {
					await submitCallback(formData);
				} catch (error) {
					console.error('Form submit error:', error);
				}
			}

			closeModal();
		});

		$('#modal-form-cancel').on('click', function () {
			closeModal();
		});
	}, 100);
}

// Service Worker registration for PWA
if ('serviceWorker' in navigator && location.protocol === 'https:') {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').then(registration => {
			console.log('[PWA] Service Worker registered:', registration.scope);
		}).catch(registrationError => {
			console.warn('[PWA] Service Worker registration failed:', registrationError);
		});
	});
} else if ('serviceWorker' in navigator && location.hostname === 'localhost') {
	// Allow on localhost for testing
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').then(registration => {
			console.log('[PWA] Service Worker registered (localhost):', registration.scope);
		}).catch(registrationError => {
			console.warn('[PWA] Service Worker registration failed:', registrationError);
		});
	});
}