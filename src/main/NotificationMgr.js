/**
 * @class Ext.ux.jnap.NotificationMgr
 * @singleton
 */
Ext.ux.jnap.NotificationMgr = function() {

	var _targets = new Ext.util.MixedCollection();

	var _createNotificationContainer = function(target) {
		return target.createChild({
			tag : 'div',
			cls : 'x-notification-msg-container'
		});
	};

	return {

		TARGET_TOP_LEFT : 'tl-tl',

		TARGET_TOP_CENTER : 't-t',

		TARGET_TOP_RIGHT : 'tl-tr',
		
		TARGET_BOTTOM_LEFT : 'bl-bl',
		
		TARGET_BOTTOM_CENTER : 'b-b',
		
		TARGET_BOTTOM_RIGHT : 'br-br',

		/**
		 * 
		 * @param target
		 * @param msg
		 * @return {Ext.ux.jnap.NotificationMessage}
		 */
		notify : function(config) {
			config = config || {};
			Ext.applyIf(config, {
				msg : {},
				width : 350,
				position : Ext.ux.jnap.NotificationMgr.TARGET_TOP_CENTER,
				positionOffset : [0, 0],
				target : Ext.getBody()
			});
			var pos = config.position;
			var target = config.target;
			target.id = target.id || Ext.id(target);
			var targetId = target.id;
			if (target == Ext.getBody()) {
				targetId += '-' + config.position;
			}
			var targetCont = _targets.get(targetId);
			if (!targetCont) {
				targetCont = config.container || _createNotificationContainer(target);
				_targets.add(targetId, targetCont);
			}
			var msg = config.msg;
			if (!(msg instanceof Ext.ux.jnap.NotificationMessage)) {
				Ext.applyIf(msg, { xtype : 'notificationmsg' });
				msg = Ext.create(msg);
			}
			// configure initial width
			targetCont.setWidth(config.width);
			if (!msg.rendered) {
				msg.render(targetCont);
			}
			// adjust width if message's width is greater than container's
			if (msg.getWidth() && targetCont.getWidth() < msg.getWidth()) {
				targetCont.setWidth(msg.getWidth());
			}
			msg.show();
			targetCont.anchorTo(target, config.position, config.positionOffset, false, true);
			return msg;
		}

	};
}();