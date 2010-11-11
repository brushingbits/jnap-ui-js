Ext.ns('Ext.ux.jnap');

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
		Ext.apply(this, {
			hideMode: 'display'
		});
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

		// init template
		this.tpl = new Ext.XTemplate(
			'<div class="{cls} {type}">',
				'<span class="{cls}-icon"></span>',
				'<tpl if="hasTitle"><h3 class="{cls}-title">{title}</h3></tpl>',
				'<p class="{cls}-msg">{msg}</p>',
				'<tpl if="closeable"><span class="{cls}-close"></span></tpl>',
			'</div>', {
				compiled: true,
				disableFormats: true
			}
		);
	},

	// private
	onRender : function(ct, position) {
		var tplArgs = {
			cls: this.baseCls,
			type: this.type,
			hasTitle: this.title != null && String.trim(this.title).length > 0,
			title: this.title,
			msg: this.msg,
			closeable: this.closeable
		};
		this.el = position
				? this.tpl.insertBefore(position, tplArgs, true)
				: this.tpl.append(ct, tplArgs, true);
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
	 * @returns
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

	update : function(htmlOrConfig) {
		
	},

	onHide : function() {
		var me = this.el;
		if (this._dismissTimer) {
			window.clearTimeout(this._dismissTimer);
		}
		me.stopFx();
		if (this.animateOnHide) {
			me.ghost('t', {
				remove : this.destroyOnHide,
				callback : function() {
					if (this.destroyOnHide) {
						this.destroy();
					}
				}
			});
		} else {
			me.setVisible(false);
			if (this.destroyOnHide) {
				this.destroy();
			}
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
				duration : 0.5,
				concurrent : true,
				callback : this._setAutoDismiss.createDelegate(this)
			});
		} else {
			this.el.setVisible(true);
			this._setAutoDismiss();
		}
	},

	_setAutoDismiss : function() {
		if (this.dismissDelay) {
			window.clearTimeout(this._dismissTimer);
			this._dismissTimer = this.hide.defer(this.dismissDelay, this);
		}
	},

	/**
	 * 
	 * @returns
	 */
	onDestroy : function() {
		if (this.rendered) {
			Ext.destroyMembers(this, '_textEl', '_titleEl', '_closeEl');
		}
		if (this._dismissTimer) {
			window.clearTimeout(this._dismissTimer);
		}
		Ext.ux.jnap.NotificationMessage.superclass.onDestroy.call(this);
	},

	/**
	 * @private
	 */
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

	/**
	 * @private
	 */
	_removeCloseEl : function() {
		if (this._closeEl) {
			this._closeEl.remove();
			this._closeElToolTip.destroy();
			this._closeElToolTip = null;
			delete this._closeEl;
			delete this._closeElToolTip;
		}
	}

});
Ext.reg('notificationmsg', Ext.ux.jnap.NotificationMessage);

/**
 * @class Ext.ux.jnap.NotificationMessagePlugin
 * @extends Object
 */
Ext.ux.jnap.NotificationMessagePlugin = Ext.extend(Object, {

	/**
	 * @cfg {Object} defaults
	 */
	defaults : {
		type : Ext.ux.jnap.NotificationMessageType.CLEAN
	},

	/**
	 * @cfg {String} targetSelector
	 * 
	 */
	targetSelector : 'div.{0}-body',

	init : function(container) {
		if (!container instanceof Ext.Container) {
			return false;
		}
		this.container = container;
		this.container.afterRender = this.container.afterRender.createSequence(this.afterRender, this);
	},

	afterRender : function() {
		this._containerEl = this.container.el;
		if (this.targetSelector) {
			this._containerEl = this.container.el.child(String.format(this.targetSelector,
					this.container.baseCls, this.container.bodyCls, this.container.extraCls));
		}
		this.container.showNotificationMsg = this.showNotificationMsg.createDelegate(this);
	},

	/**
	 * 
	 * @param msg
	 */
	showNotificationMsg : function(msg) {
		Ext.applyIf(msg, this.defaults);
		Ext.apply(msg, {
			destroyOnHide : false
		});
		if (!this.msg) {
			this.msg = new Ext.ux.jnap.NotificationMessage(msg);
		} else {
			this.msg.update(msg);
		}
		if (!this.msg.isVisible()) {
			Ext.ux.jnap.NotificationMgr.notify({
				msg : this.msg,
				position : Ext.ux.jnap.NotificationMgr.TARGET_TOP_CENTER,
				positionOffset : [0, -6],
				target : this._containerEl,
				width : 'auto'
			});
		}
	}

});