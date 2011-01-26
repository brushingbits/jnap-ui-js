/*!
 * jnap-ui - ExtJS extensions
 */
Ext.ns('Ext.ux.jnap.form');

/**
 * @class Ext.ux.jnap.form.CharactersLimitPlugin
 * @extends Object
 * An {@link Ext.form.TextArea} plugin
 */
Ext.ux.jnap.form.CharactersLimitPlugin = Ext.extend(Object, {

	/**
	 * @cfg {String} text
	 */
	text : 'You have <strong>{0}</strong> characters remaining',

	/**
	 * @cfg {String} baseCls
	 */
	baseCls : 'x-field-charlimit-hint',

	/**
	 * @cfg {Boolean} crop
	 */
	crop : false,

	constructor : function(config) {
		config = config || {};
		Ext.apply(this, config);
	},

	/**
	 * @param {Ext.form.TextArea} textarea
	 */
	init : function(textarea) {
		if (!(textarea instanceof Ext.form.TextArea) || !textarea.maxLength) {
			return false;
		}
		this.textarea = textarea;

		// force textarea to enable key events listening
		Ext.apply(textarea, {
			enableKeyEvents : true
		});
		textarea.afterRender = textarea.afterRender.createSequence(this.afterRender, this);
	},

	afterRender : function() {
		var field = this.textarea;
		if (this.text) {
			Ext.ux.jnap.util.ExtUtils.wrapField(field);
			this.charsLeftEl = field.wrap.createChild({
				tag : 'div',
				cls : this.baseCls
			});
		}
		this.handleCharLimit();
		this._bindListeners();
	},

	/**
	 * 
	 */
	handleCharLimit : function() {
		var field = this.textarea;
		var max = field.maxLength;
		var currentValue = field.getValue();
		var charcount = 0;
		if (currentValue) {
			charcount = currentValue.length;
		}
		if (charcount > max && this.crop) {
			field.setValue(currentValue.substring(0, max));
			charcount = max;
		}
		if (this.text) {
			this.charsLeftEl.update(String.format(this.text, (max - charcount)));
		}
	},

	_bindListeners : function() {
		// 'paste' and 'input' are browser custom events
		Ext.each(['keydown', 'paste', 'input'], function(item, i, array) {
			this.textarea.mon(this.textarea.el, item, this.handleCharLimit,	this, {buffer : 100});
		}, this);
	}

});

Ext.preg('charlimit', Ext.ux.jnap.form.CharactersLimitPlugin);