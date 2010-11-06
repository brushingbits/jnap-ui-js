Ext.ns('Ext.ux.jnap.form');

Ext.ux.jnap.form.TextCaseTransform = {
	'upper' : {
		style: 'uppercase',

		changeCase: function(value) {
			return value ? value.toUpperCase() : value;
		}
	},
	'lower' : {
		style: 'lowercase',

		changeCase: function(value) {
			return value ? value.toLowerCase() : value;
		}
	}
};

/**
 * @class Ext.ux.jnap.form.TextCasePlugin
 */
Ext.ux.jnap.form.TextCasePlugin = Ext.extend(Object, {

	mode : 'upper',

	_mapping : {

	},

	field: undefined,

	constructor: function(config) {
		config = config || {};
		Ext.apply(this, config);
    },

	init : function(field) {
		// is it a field?
		if (!field.isFormField) {
			return false;
		}
		this.field = field;
		field.afterRender = field.afterRender.createSequence(this.afterRender, this);
	},

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