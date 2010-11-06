/*!
 * 
 */
Ext.ns('Ext.ux.jnap.form');

/**
 * @class Ext.ux.jnap.form.FieldHintTypeRenderer
 */
Ext.ux.jnap.form.FieldHintTargetRenderer = {
	'bottom': {
		renderHint: function(hintPlugin) {
			var field = hintPlugin.field;
			var fieldWrap = Ext.ux.jnap.util.ExtUtils.wrapField(field);
			if (fieldWrap) {
				var hintEl = fieldWrap.createChild({
					cls: hintPlugin.baseCls,
					html: field.getHintText()
				});
				field.hintEl = hintEl;
			}
		},

		clearHint: function(hintPlugin) {
		}
	},
	'icontip': {
		renderHint: function(hintPlugin) {

		},

		clearHint: function(hintPlugin) {
		
		}
	}
};

/**
 * @class Ext.ux.jnap.form.FieldHintPlugin
 */
Ext.ux.jnap.form.FieldHintPlugin = Ext.extend(Object, {

	/**
	 * @cfg {String} hintText
	 */
	hintText: '',

	/**
	 * @cfg {String} baseCls
	 */
	baseCls: 'x-field-hint',

	/**
	 * @cfg {Number} hintType
	 */
	hintTarget: 'bottom',

	field: undefined,

	constructor: function(config) {
		config = config || {};
		Ext.apply(this, config);
    },

    /**
     * @param {Ext.form.Field} field
     */
    init: function(field) {
    	// is it a field?
    	if (!field.isFormField) {
    		return false;
    	}
    	this._renderer = Ext.ux.jnap.form.FieldHintTargetRenderer[this.hintTarget];
    	if (!this._renderer) {
    		// no valid renderer
    		return false;
    	}
    	this.field = field;

    	// apply Hint properties to the field
    	Ext.apply(this.field, {
    		getHintText: this.getHintText.createDelegate(this),
    		getHintCls: null,
    		setHintText: null,
    		removeHint: null,
    		showHint: null,
    		hideHint: null
    	});

    	// init
    	this._hintTpl = new Ext.Template(this.hintText, {
    		compiled: true
    	});
    	this._refreshHintText();
    	field.afterRender = field.afterRender.createSequence(this.afterRender, this);
    },

    afterRender: function() {
    	this._renderer.renderHint(this);
    },

    getHintText: function() {
    	return this._hintMsg;
    },

    _refreshHintText: function() {
    	this._hintTpl.set(this.hintText, true);
    	this._hintMsg = this._hintTpl.apply(this.field);
    }
});