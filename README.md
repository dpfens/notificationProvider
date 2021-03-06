# notificationProvider
Wrapper for JS Notifications

notificationProvider is a simple script for JS Web Notifications.  The script includes fallbacks for browsers not supporting notifications using the Page Visibility API and uses Vibration API for mobile devices.

## Usage

... Include the script on your page
... Create a notification Factory using `notificationProvider.Factory`
... Use `notificationProvider.toggle` to toggle user preferences and to request their permission to use Web Notifications (if their browser supports it).
... When the time comes to notify a user, use the `notify(title, options)` method on your instantiated `Factory` to send the notification.

## API
* `Factory(icon, options)` - Instantiated a factory to send types of notifications. The icon string must be a URL of the icon for the Web Notifications. The `options` Object can contain a `vibrationPattern`, or  `onclick`, `onshow`, `ondisplay`, `onclose`, or `onerror` function that will be attached to all notifications created from that factory instance
* `toggle()` - Toggles user user's preferences to receive notifications.
