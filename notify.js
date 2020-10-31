/*
   Based on GyozaGuy's JS script (that seems to be based on 
   electron-notifcation-shim script):

   This JS will catch the errors, send the info back about that throught the
   icp API and show the notification again. Unlike the GyozaGuy's script, mine
   will revert icon to the normal as soon as the user will check the window
   (as soon as the window will be focused).
*/
const ipc = require('electron').ipcRenderer
var NativeNotification = Notification

Notification = function(title, options) {
	var notification = new NativeNotification(title, options)
	ipc.send('receive-notification')
	notification.on('click', () => {
		ipc.send('notification-clicked')
	})
	return notification
}

Notification.prototype = NativeNotification.prototype
Notification.permission = NativeNotification.permission
Notification.requestPermission = NativeNotification.requestPermission.bind(Notification)
