/*!
 * 
 */
Ext.ns('Ext.ux.jnap');

/**
 * @class Ext.ux.jnap.NotificationMessageType
 * @singleton
 * <p>An <code>Enum</code> type class representing the notification message built-in types. You
 * can add your own constants to this class like this:</p>
 * <p>
 * <code>
 * Ext.apply(Ext.ux.jnap.NotificationMessageType, {
 *     MY_TYPE : 'mytype'
 * });
 * </code>
 * </p>
 */
Ext.ux.jnap.NotificationMessageType = {

	/**
	 * 
	 */
	INFO : 'info',
	
	/**
	 * 
	 */
	WARNING : 'warning',

	/**
	 * 
	 */
	ERROR : 'error',

	/**
	 * 
	 */
	SUCCESS : 'success',

	/**
	 * 
	 */
	CLEAR : 'clear',

	/**
	 * 
	 */
	CLEAR_DARK : 'dark'
};

/**
 * @class Ext.ux.jnap.NotificationMessage
 * @extends Ext.BoxComponent
 */
Ext.ux.jnap.NotificationMessage = Ext.extend(Ext.BoxComponent, {

	/**
	 * @cfg {Boolean} animateOnShow
	 */
	animateOnShow : true,

	/**
	 * @cfg {Boolean} animateOnShow
	 */
	animateOnHide : true,

	/**
	 * @cfg {String} baseCls
	 * The base CSS class to apply to the message box element (defaults to 'x-notification-msg')
	 */
	baseCls : 'x-notification-msg',

	/**
	 * @cfg {String} extraCls
	 * An extra CSS class to apply to the message box element (defaults to undefined)
	 */
	extraCls : undefined,
	
	/**
	 * @cfg {Boolean} closeable
	 */
	closeable : false,
	
	/**
	 * @cfg {String} closeTitle
	 */
	closeTitle : 'Dismiss message',

	/**
	 * @cfg {Boolean} destroyOnHide
	 */
	destroyOnHide : true,

	/**
	 * @cfg {Number} dismissDelay Delay in milliseconds before the message box automatically 
	 * hides. To disable automatic hiding, set dismissDelay = 0 (this is the default value).
	 */
	dismissDelay : 0,

	/**
	 * @cfg {String} icon
	 */
	icon : undefined,

	/**
	 * @cfg {String} iconCls
	 */
	iconCls : undefined,

	/**
	 * @cfg {String} msg
	 */
	msg : '',
	
	/**
	 * @cfg {String} title
	 */
	title : null,

	/**
	 * @cfg {String} type
	 */
	type : Ext.ux.jnap.NotificationMessageType.CLEAR,

	// private
	initComponent : function() {
		Ext.ux.jnap.NotificationMessage.superclass.initComponent.call(this);
		this.addEvents(
			/**
			 * @event
			 */
			'msgupdate',
			/**
			 * @event
			 */
			'titleupdate'
		);
	},

	// private
	onRender : function(ct, position) {
		// define tpl if not yet
		if (!this.tpl) {
			this.tpl = new Ext.XTemplate(
				'<div class="{cls} {cls}-{type}">',
				'<span class="{cls}-icon"></span>',
				'<tpl if="hasTitle"><h3 class="{cls}-title">{title}</h3></tpl>',
				'<p class="{cls}-msg">{msg}</p>',
				'<tpl if="closeable"><span class="{cls}-close"></span></tpl>',
				'</div>', {
					compiled: true,
					disableFormats: true
				}
			);
		}
		this.el = position
				? this.tpl.insertBefore(position, this._getTplArgs(), true)
				: this.tpl.append(ct, this._getTplArgs(), true);
		this.el.setVisibilityMode(Ext.Element.DISPLAY);
		if (this.extraCls) {
			this.el.addClass(this.extraCls);
		}
		if (this.id) {
			this.el.dom.id = this.id;
		}

		if (this.title) {
			this._titleEl = this.el.first('h3');
		}
		this._msgEl = this.el.first('p');
		if (this.closeable) {
			this._closeEl = this.el.first('span.' + this.baseCls + '-close');
			this._configCloseEl();
		}

		// schedule auto dismiss
		if (!this.hidden) {
			this._setAutoDismiss();
		}
	},

	/**
	 * @param {String} msg
	 * @returns
	 */
	setMsg : function(msg) {
		this.msg = msg;
		if (this.rendered) {
			this._msgEl.update(this.msg);
			this.fireEvent('msgupdate', this, this.msg);
		}
		return this;
	},

	/**
	 * @param {String} title
	 * @return
	 */
	setTitle : function(title) {
		this.title = title;
		if (this.rendered) {
			if (title != null) {
				if (!this._titleEl) {
					this._titleEl = this.el.insertFirst({
						tag: 'h3',
						cls: this.baseCls + '-title'
					});
				}
				this._titleEl.update(this.title);
			} else if (this._titleEl) {
				this._titleEl.remove();
				delete this._titleEl;
			}
			this.fireEvent('titleupdate', this, this.title);
		}
		return this;
	},

	/**
	 * @param type
	 */
	setType : function(type) {
		this.el.removeClass(this.type);
		this.el.addClass(type);
		this.type = type;
	},

	/**
	 * @param {Boolean} closeable
	 */
	setCloseable : function(closeable) {
		// if its closeable and the close element doesnt exists, then create it
		if (closeable && !this._closeEl) {
			this._closeEl = this.el.append({
				tag: 'span',
				cls: this.baseCls + '-close'
			});
			this._configCloseEl();
		}
		// if its not closeable and the element exists, remove it
		if (!closeable && this._closeEl) {
			this._removeCloseEl();
		}
		this.closeable = closeable;
	},

	/**
	 * 
	 * @param htmlOrConfig
	 */
	update : function(htmlOrConfig) {
		if (Ext.isString(htmlOrConfig)) {
			this.setMsg(htmlOrConfig);
		} else if (Ext.isObject(htmlOrConfig)) {
			if (htmlOrConfig.msg) {
				this.setMsg(htmlOrConfig.msg);
			}
			if (htmlOrConfig.title) {
				this.setTitle(htmlOrConfig.title);
			}
			if (htmlOrConfig.type) {
				this.setType(htmlOrConfig.type);
			}
		}
	},

	onHide : function() {
		var me = this.el;
		if (this._dismissTimer) {
			window.clearTimeout(this._dismissTimer);
		}
		me.stopFx();
		if (this.animateOnHide) {
			me.ghost('t', {
				useDisplay : true,
				callback : this._doOnHide.createDelegate(this)
			});
		} else {
			me.setVisible(false);
			this._doOnHide();
		}
	},

	onShow : function() {
		if (this.animateOnShow) {
			this.el.syncFx();
			this.el.slideIn('t', {
				easing : 'easeNone',
				duration : 0.3,
				concurrent : true
			}).fadeIn({
				duration : 0.8,
				concurrent : true,
				endOpacity : 0.9,
				scope : this,
				callback : this._setAutoDismiss.createDelegate(this)
			});
		} else {
			this.el.setVisible(true);
			this._setAutoDismiss();
		}
	},

	onDestroy : function() {
		if (this.rendered) {
			this._removeCloseEl();
			Ext.destroyMembers(this, '_textEl', '_titleEl');
		}
		if (this._dismissTimer) {
			window.clearTimeout(this._dismissTimer);
		}
		Ext.ux.jnap.NotificationMessage.superclass.onDestroy.call(this);
	},

	// private
	_getTplArgs : function() {
		return {
			cls: this.baseCls,
			type: this.type,
			hasTitle: this.title != null && String.trim(this.title).length > 0,
			title: this.title,
			msg: this.msg,
			closeable: this.closeable
		};
	},

	// private
	_doOnHide : function() {
		if (this._closeElTooTip) {
			this._closeElTooTip.hide();
		}
		if (this.destroyOnHide) {
			this.destroy();
		}
	},

	// private
	_setAutoDismiss : function() {
		if (this.dismissDelay) {
			window.clearTimeout(this._dismissTimer);
			this._dismissTimer = this.hide.defer(this.dismissDelay, this);
		}
	},

	// private
	_configCloseEl : function() {
		if (this._closeEl) {
			this._closeEl.addClassOnOver(this.baseCls + '-close-hover');
			this.mon(this._closeEl, 'click', function(evt, el, obj) {
				this.hide();
			}, this);
			this._closeElTooTip = new Ext.ToolTip({
				target: this._closeEl,
				html: this.closeTitle
			});
		}
	},

	// private
	_removeCloseEl : function() {
		if (this._closeEl) {
			this._closeEl.remove();
			delete this._closeEl;
		}
		if (this._closeElToolTip) {
			this._closeElToolTip.destroy();
			delete this._closeElToolTip;
		}
	}

});
Ext.reg('notificationmsg', Ext.ux.jnap.NotificationMessage);

/**
 * @class Ext.ux.jnap.NotificationMessagePlugin
 * @extends Object
 * A plugin that adds a notification message ({@link Ext.ux.jnap.NotificationMessage}) as a behavior
 * of the plugin container. The method {@link #showNotificationMsg} is injected on the container and
 * ... TODO
 */
Ext.ux.jnap.NotificationMessagePlugin = Ext.extend(Object, {

	/**
	 * @cfg {Object} defaults
	 * An object representing the {@link Ext.ux.jnap.NotificationMessage} default config options
	 * for this plugin. Defaults to <code>{}</code>.
	 */
	defaults : {},

	/**
	 * @cfg {String} targetSelector
	 * <p>A string representing a selector (see {@link Ext.DomQuery}) that will be used to select
	 * the element which will be the container for the notification message. If <code>undefined</code>
	 * the <code>container.el</code> will be used (where <code>container</code> is the component 
	 * that the plugin was added to). Defaults to <code>'div.{baseCls}-body'</code>.</p>
	 * <p>Note: you can use the container's config options as template variables.</p>
	 */
	targetSelector : 'div.{baseCls}-body',

	/**
	 * @cfg {String|Number} width
	 * The width of the message's container relative to it's parent container (defined by
	 * {@link #targetSelector}). You can use a String (like the CSS width property) or a
	 * Number (then the default unit will be used). Defaults to <code>'98%'</code>.
	 */
	width : '98%',

	/**
	 * @cfg {Array} positionOffset
	 */
	positionOffset : [0, -6],

	constructor : function(config) {
		config = config || {};
		Ext.apply(this, config);
	},

	// private
	init : function(container) {
		if (!container instanceof Ext.Container) {
			return false;
		}
		this.container = container;
		this.container.afterRender = this.container.afterRender.createSequence(this.afterRender, this);
	},

	// private
	afterRender : function() {
		this._containerEl = this.container.el;
		if (this.targetSelector) {
			this._containerEl = this.container.el.child(
					new Ext.Template(this.targetSelector).apply(this.container));
		}
		this.container.showNotificationMsg = this.showNotificationMsg.createDelegate(this);
	},

	/**
	 * This method will display the notification message using the provided configuration. It'll
	 * be injected on the container itself, so you must call it directly from the component instance
	 * you've added the plugin.
	 * 
	 * @param {String|Object} msg A {@link Ext.ux.jnap.NotificationMessage} config object or a
	 * <code>String</code> representing the {@link Ext.ux.jnap.NotificationMessage#msg}.
	 */
	showNotificationMsg : function(msg) {
		if (Ext.isString(msg)) {
			msg = {
				msg : msg
			};
		}
		Ext.applyIf(msg, this.defaults);
		var justCreated = false;
		if (!this.msg) {
			// the NotificationMessage on this plugin will be unique and always reused
			// so force destroyOnHide = false
			Ext.apply(msg, {
				destroyOnHide : false
			});
			this.msg = new Ext.ux.jnap.NotificationMessage(msg);
			justCreated = true;
		}
		if (!justCreated) {
			this.msg.update(msg);
		}
		Ext.ux.jnap.NotificationMgr.notify({
			msg : this.msg,
			position : Ext.ux.jnap.NotificationMgr.TARGET_TOP_CENTER,
			positionOffset : this.positionOffset,
			target : this._containerEl,
			width : this.width
		});
	}

});
Ext.preg('notificationmsg', Ext.ux.jnap.NotificationMessagePlugin);