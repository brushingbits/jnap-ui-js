
Ext.ns('Ext.ux.jnap.form');

/**
 * @class Ext.ux.jnap.form.ClearFieldPlugin
 * @extends Object
 */
Ext.ux.jnap.form.ClearFieldPlugin = Ext.extend(Object, {

	/**
	 * @cfg {String} baseCls
	 */
	baseCls : 'x-field-clear',

	/**
	 * @cfg {String} clearValue
	 */
	clearValue : '',

	/**
	 * @cfg {String} clearTip
	 */
	clearTip : 'Click to clear the field',

	/**
	 * @cfg {Boolean} animateOnShow
	 */
	animateOnShow : true,

	/**
	 * @cfg {Boolean} animateOnHide
	 */
	animateOnHide : true,

	constructor : function(config) {
		config = config || {};
		Ext.apply(this, config);
	},

	/**
	 * @param {Ext.form.Field} field
	 */
	init : function(field) {
		if (!field instanceof Ext.form.Field) {
			return false;
		}
		this.field = field;
		field.afterRender = field.afterRender.createSequence(this.afterRender, this);
	},

	afterRender : function() {
		this._createClearTrigger();
		this.field.mon(this.field.el, 'mouseover', this.onMouseOver, this, { buffer : 20 });
		this.field.mon(this.field.el, 'mouseout', this.onMouseOut, this, { buffer : 20 });
		this.field.mon(this.field, 'afterlayout', this._doTriggerPosition, this);
		this.field.mon(this.field, 'destroy', this.onDestroy, this);
	},

	onMouseOver : function() {
		if (!this._triggerEl.isVisible()) {
			if (this.animateOnShow) {
				this._triggerEl.fadeIn({ endOpacity : 0.65, duration : 0.2});
			} else {
				this._triggerEl.show();
			}
		}
	},

	onMouseOut : function() {
		if (!this._triggerEl.hasClass(this.baseCls + '-over')) {
			if (this.animateOnHide) {
				this._triggerEl.fadeOut({ duration : 0.2 });
			} else {
				this._triggerEl.hide();
			}
			this._triggerTip.hide();
		}
	},

	onDestroy : function() {
		Ext.destroyMembers(this, '_triggerEl', '_triggerTip');
	},

	// protected
	onClick : function() {
		this.field.setValue(this.clearValue);
		this.field.focus();
	},

	// private
	_createClearTrigger : function() {
		this._triggerEl = this.field.el.parent().createChild({
			tag : 'span',
			cls : this.baseCls
		}, this.field.el);
		this._triggerEl.addClassOnOver(this.baseCls + '-over');
		this._triggerEl.setVisibilityMode(Ext.Element.VISIBILITY);
		this.field.mon(this._triggerEl, 'click', this.onClick, this);
		this._doTriggerPosition();
		
		// clear trigger tip
		this._triggerTip = new Ext.ToolTip({
			target: this._triggerEl,
			html: this.clearTip
		});
	},

	// private
	_doTriggerPosition : function() {
		this._triggerEl.setStyle('zIndex', this.field.el.getStyle('zIndex') + 1);
		this._triggerEl.anchorTo(this.field.el, 't-tr', [-10, 3]);
	}

});