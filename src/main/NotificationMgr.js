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

	// ajax loading message support objects
	var _currentAjaxLoadingMsg = null;
	var _ajaxLoadingMsgOwner = new Array();
	var _shouldShowLoadingMsg = true;

	// singleton object
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
		},

		/**
		 * 
		 */
		defaultAjaxLoadingMsgText : 'Please wait, loading...',

		/**
		 * 
		 */
		defaultAjaxLoadingMsgStyle : 'clear',

		/**
		 * 
		 * @param conn
		 * @param options
		 * @returns
		 */
		showAjaxLoadingMsg : function(conn, options) {
			_ajaxLoadingMsgOwner.push(conn);
			if (!_currentAjaxLoadingMsg) {
				var loadingMsg = Ext.ux.jnap.NotificationMgr.defaultAjaxLoadingMsgText;
				_currentAjaxLoadingMsg = Ext.ux.jnap.NotificationMgr.notify({
					msg : {
						msg : String.format('<p class="{1}">{0}</p>', loadingMsg, 'x-loading'),
						type : Ext.ux.jnap.NotificationMgr.defaultAjaxLoadingMsgStyle,
						extraCls : 'no-icon',
						animateOnShow : false,
						animateOnHide : false
					},
					width : 200,
					position : Ext.ux.jnap.NotificationMgr.TARGET_TOP_LEFT
				});
			}
		},

		/**
		 * 
		 * @param conn
		 * @param response
		 * @param options
		 * @returns
		 */
		hideAjaxLoadingMsg : function(conn, response, options) {
			_ajaxLoadingMsgOwner.pop();
			if (_ajaxLoadingMsgOwner.length == 0 &&
					(_currentAjaxLoadingMsg != null && _currentAjaxLoadingMsg.isVisible())) {
				_currentAjaxLoadingMsg.hide();
				_currentAjaxLoadingMsg = null;
			}
		},

		/**
		 * 
		 * @returns
		 */
		registerDefaultLoadingMsgOnAjax : function() {
			var scope = Ext.ux.jnap.NotificationMgr;
			Ext.Ajax.on('beforerequest', scope.showAjaxLoadingMsg, scope);
			var defaultHideOpts = { buffer : 200 };
			Ext.Ajax.on('requestcomplete', scope.hideAjaxLoadingMsg, scope, defaultHideOpts);
			Ext.Ajax.on('requestexception', scope.hideAjaxLoadingMsg, scope, defaultHideOpts);
		}

	};
}();