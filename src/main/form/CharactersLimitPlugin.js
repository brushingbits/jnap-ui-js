/*!
 * jnap-ui - ExtJS extensions
 */
Ext.ns('Ext.ux.jnap.form');

/**
 * @class Ext.ux.jnap.form.CharactersLimitPlugin
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

	constructor : function(config) {
		config = config || {};
		Ext.apply(this, config);
	},

	/**
	 * @param {TextArea} textarea
	 */
	init : function(textarea) {
		if (!textarea instanceof Ext.form.TextArea || !textarea.maxLength) {
			return false;
		}
		this.textarea = textarea;

		// force textarea to enable key events listening
		Ext.apply(textarea, {
			enableKeyEvents : true
		});
		textarea.on('keydown', this.handleCharLimit.createDelegate(this));
		textarea.afterRender = textarea.afterRender.createSequence(this.afterRender, this);
	},

	afterRender : function() {
		var field = this.textarea;
		if (field) {
			Ext.ux.jnap.util.ExtUtils.wrapField(field);
			this.charsLeftEl = field.wrap.createChild({
				tag : 'div',
				cls : this.baseCls
			});
			this.handleCharLimit();
		}
	},

	/**
	 * 
	 * @param {Ext.form.Field} field
	 * @param {Ext.EventObject} evt
	 * @returns
	 */
	handleCharLimit : function(field, evt) {
		if (!field) {
			field = this.textarea;
		}
		var max = field.maxLength;
		var currentValue = field.getValue();
		var charcount = 0;
		if (currentValue) {
			charcount = currentValue.length;
		}
		this.charsLeftEl.update(String.format(this.text, (max - charcount)));
	}
});

Ext.preg('charlimit', Ext.ux.jnap.form.CharactersLimitPlugin);