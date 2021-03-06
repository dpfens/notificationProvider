"use strict";
(function(w) {
	var notifications = isNotifiable(),
	preferences = {
		notifications: localStorage.getItem("notifications") === "true" || false,
	};
	navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

	/*
	 * @returns {void} toggles User preferences for Notifications
	 */
	function toggle() {
		preferences.notifications = !preferences.notifications;
		localStorage.setItem("notifications", preferences.notifications.toString() );

		// request permission for Notifications if supported, Notifications are toggled, and permissions hasn't already been obtained
		if (notifications && preferences.notifications && (notifications.permission === "default" || notifications.permission === "denied" || (notifications.checkPermission && notifications.checkPermission() != 0 ) ) ) {
			notifications.requestPermission();
		}
	}

	/*
	 * @returns {Page Visibility API} the Page Visibility API, or null
	 */
	function isHidden() {
		var prop = getHiddenProp();
		if (!prop) return false;

		return document[prop];
	}

	/*
	 * @returns {string} the browser's property name of the Page Visibility API, or null
	 */
	function getHiddenProp() {
		var prefixes = ['webkit', 'moz', 'ms', 'o'];

		// if 'hidden' is natively supported just return it
		if ('hidden' in document) return 'hidden';

		// otherwise loop over all the known prefixes until we find one
		for (var i = 0; i < prefixes.length; i++) {
			if ((prefixes[i] + 'Hidden') in document)
				return prefixes[i] + 'Hidden';
		}
		// otherwise it's not supported
		return null;
	}

	/*
	 * @returns {Notification API} the Notifications API, or null
	 */
	function isNotifiable() {
		var prop = getNotificationProp();
		if (!prop) return false;

		return w[prop];
	}

	/*
	 * @return {Boolean} if has SessionStorage and LocalStorage support
	 */
	function hasStorage() {
		return typeof Storage !== "undefined";
	}
	/*
	 * @returns {string} the browser's property name of the Notifications API, or null
	 */
	function getNotificationProp() {
		var prefixes = ['webkit', 'moz', 'ms', 'o'];

		// if 'hidden' is natively supported just return it
		if ('Notification' in w) return 'Notification';

		// otherwise loop over all the known prefixes until we find one
		for (var i = 0; i < prefixes.length; i++) {
			if ((prefixes[i] + 'Notification') in w)
				return prefixes[i] + 'Notification';
		}
		// otherwise it's not supported
		return null;
	}

	/*
	 * @params {string} icon Specify the URL of the icon for notifications
	 * @returns {Object} icon The interface to the notificationFactory
	 */
	function Factory(icon, opts) {
		var options = opts || {},
		vibrationPattern = options.vibrationPattern,
		handler = {
			onShow : options.onshow,
			onDisplay: options.ondisplay,
			onClick : options.onclick,
			onClose : options.onclose,
			onError : options.onerror,
		};

		return {
			notify: notify
		};

		/*
		 * @params {string} title Specify title of notification
		 * @params {object} options Specify optional parameters
		 * @returns {Notification} a notification instance
		 */
		function notify(title, opts) {
			var options = opts || {},
			currentPageTitle = document.title;

			// if vibrate API && vibration duration specified in factory creation
			if(navigator.vibrate && vibrationPattern) {
				navigator.vibrate(vibrationPattern);
			}

			// if Page Visibility API
			if (isHidden() && preferences.notifications) {
				var flashMessage = function() {
						if (document.title === currentPageTitle) {
							document.title = title;
						} else {
							document.title = currentPageTitle;
						}
				},
				flashingMessage = setInterval(flashMessage, 1000),

				messageSeen = function() {
					clearInterval(flashingMessage);
					document.title = currentPageTitle;
					document.removeEventListener("visibilitychange", messageSeen);
				};
				document.addEventListener("visibilitychange", messageSeen);
			}
			// create new Notification if supported
			if (notifications && preferences.notifications && (notifications.permission === "granted" || notifications.checkPermission && notifications.checkPermission() == 0 ) ) {
				return sendNotification(title, options);
			}
			return null;
			/*
			 * @params {string} title Specify title of notification
			 * @params {object} options Specify optional parameters
			 * @returns {Notification} a notification instance
			 */
			function sendNotification(title, opts) {
				var options = opts || {},
				body = options.body || '',
				tags = options.tags || '',
				data = options.data || {},
				notification = null;
				if(notifications.createNotification) {
					notification = notifications.createNotification(icon, title, body);
					notification.show();
				} else {
					notification = new notifications(title, {
						icon: icon,
						body: body,
						tags: tags,
						data: data
					});
				}
				notification.onerror = handler.onError;
				notification.ondisplay = handler.onDisplay;
				notification.onshow = handler.onShow;
				notification.onclick = handler.onClick;
				notification.onclose = handler.onClose;
				return notification;
			}

		}

	}

	w.notificationProvider = {
		Factory: Factory,
		toggle: toggle
	};
})(window);
