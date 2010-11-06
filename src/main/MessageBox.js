Ext.ns('Ext.ux.jnap');

Ext.ux.jnap.MessageBoxType = {

	/**
	 * 
	 */
	TYPE_INFO: 'info',
	
	/**
	 * 
	 */
	TYPE_WARNING: 'warning',

	/**
	 * 
	 */
	TYPE_ERROR: 'error',

	/**
	 * 
	 */
	TYPE_SUCCESS: 'success',

	/**
	 * 
	 */
	TYPE_CLEAR: 'clear'
};

/**
 * @class Ext.ux.jnap.MessageBox
 * @extends Ext.BoxComponent
 */
Ext.ux.jnap.MessageBox = Ext.extend(Ext.BoxComponent, {

	animateOnShow: true,

	animateOnHide: true,

	/**
	 * @cfg {String} baseCls
	 * The base CSS class to apply to the message box element (defaults to 'x-msg-box')
	 */
	baseCls: 'x-message-box',

	/**
	 * @cfg {String} extraCls
	 * An extra CSS class to apply to the message box element (defaults to undefined)
	 */
	extraCls: undefined,
	
	/**
	 * @cfg {Boolean} closeable
	 */
	closeable: false,
	
	/**
	 * @cfg {String} closeTitle
	 */
	closeTitle: 'Dismiss message',

	/**
	 * @cfg {Boolean} destroyOnHide
	 */
	destroyOnHide: true,

    /**
     * @cfg {Number} dismissDelay Delay in milliseconds before the message box automatically 
     * hides. To disable automatic hiding, set dismissDelay = 0 (this is the default value).
     */
	dismissDelay : 0,
	
	/**
	 * @cfg {String} msg
	 */
	msg: '',
	
	/**
	 * @cfg {String} title
	 */
	title: null,

	/**
	 * @cfg {String} type
	 */
	type: Ext.ux.jnap.MessageBoxType.INFO,

	// private
	initComponent: function() {
		Ext.ux.jnap.MessageBox.superclass.initComponent.call(this);
		Ext.applyIf(this, {
			hideMode: 'display'
		});
		this.addEvents(
				'msgupdate',
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
	onRender: function(ct, position) {
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
		if (this.dismissDelay) {
			this._dismissTimer = this.hide.defer(this.dismissDelay, this);
		}
	},

	/**
	 * @param {String} msg
	 * @returns
	 */
	setMsg: function(msg) {
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
	setTitle: function(title) {
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

	setType: function(type) {
		this.el.removeClass(this.type);
		this.el.addClass(type);
		this.type = type;
	},

	/**
	 * @param {Boolean} closeable
	 */
	setCloseable: function(closeable) {
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

	onHide: function() {
		var me = this.el;
		if (this._dismissTimer) {
			window.clearTimeout(this._dismissTimer);
		}
		me.stopFx();
		if (this.animateOnHide) {
			me.ghost('t', {
				remove: true
			});
		} else {
			me.setVisible(false);
		}
	},

	onShow: function() {
		if (this.animateOnShow) {
			this.el.slideIn('t');
		} else {
			this.el.setVisible(true);
		}
	},

	/**
	 * 
	 * @returns
	 */
	onDestroy: function() {
		if (this.rendered) {
			Ext.destroyMembers(this, '_textEl', '_titleEl', '_closeEl');
		}
		if (this._dismissTimer) {
			window.clearTimeout(this._dismissTimer);
		}
		Ext.ux.jnap.MessageBox.superclass.onDestroy.call(this);
	},

	/**
	 * @private
	 */
	_configCloseEl: function() {
		if (this._closeEl) {
			this._closeEl.addClassOnOver(this.baseCls + '-close-hover');
			this._closeEl.on('click', function(evt, el, obj) {
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
	_removeCloseEl: function() {
		if (this._closeEl) {
			this._closeEl.remove();
			this._closeElToolTip.destroy();
			this._closeElToolTip = null;
			delete this._closeEl;
			delete this._closeElToolTip;
		}
	}

});