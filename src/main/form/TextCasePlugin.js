/*!
 * 
 */
Ext.ns('Ext.ux.jnap.form');

/**
 * @class Ext.ux.jnap.form.TextCaseTransform
 * @singleton
 */
Ext.ux.jnap.form.TextCaseTransform = {

	/**
	 * @type String
	 */
	upper : {
		style : 'uppercase',

		changeCase : function(value) {
			return value ? value.toUpperCase() : value;
		}
	},

	/**
	 * @type String
	 */
	lower : {
		style : 'lowercase',

		changeCase : function(value) {
			return value ? value.toLowerCase() : value;
		}
	}
};

/**
 * @class Ext.ux.jnap.form.TextCasePlugin
 * @extends Object
 * A plugin that can be attached to form fields (all instances of {@link Ext.form.Field})
 * to transform the field text case.
 * 
 * @constructor
 * Create a new plugin instance
 * @param {Object} config The config object
 */
Ext.ux.jnap.form.TextCasePlugin = Ext.extend(Object, {

	/**
	 * @cfg {String} mode
	 * The mode indicates which case transformation the plugin must perform. There are two modes
	 * available by default: <code>'upper'</code> and <code>'lower'</code>. New text case 
	 * transformation can be added, see {@link Ext.ux.jnap.form.TextCaseTransform}.
	 * (defaults to <code>'upper'</code>).
	 */
	mode : 'upper',

	/**
	 * The field reference, which the plugin has been applied to.
	 * @type Ext.form.Field
	 */
	field : undefined,

	constructor : function(config) {
		config = config || {};
		Ext.apply(this, config);
    },

    // private
	init : function(field) {
		// is it a field?
		if (!field.isFormField) {
			return false;
		}
		this.field = field;
		field.afterRender = field.afterRender.createSequence(this.afterRender, this);
	},

	// private
	afterRender : function() {
		var caseHandler = Ext.ux.jnap.form.TextCaseTransform[this.mode];
		var field = this.field;
		if (caseHandler.style) {
			field.getEl().applyStyles({
				textTransform : caseHandler.style
			});
		}
		field.mon(field.getEl(), 'blur', function(evt, el, opt) {
			this.setValue(caseHandler.changeCase(this.getValue()));
		}, field);
	}

});