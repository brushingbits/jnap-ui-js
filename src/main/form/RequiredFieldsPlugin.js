
Ext.ns('Ext.ux.jnap.form');
/**
 * @class Ext.ux.jnap.form.RequiredFieldsHintPlugin
 */
Ext.ux.jnap.form.RequiredFieldsHintPlugin = Ext.extend(Object, {

	/**
	 * @cfg {String} symbol
	 */
	symbol: '<span class=\'{symbolCls}\'>*</span>',

	/**
	 * @cfg {String} symbolPosition
	 */
	symbolPosition: 'right',

	/**
	 * @cfg {String} symbolCls
	 */
	symbolCls: 'x-field-required',

	/**
	 * @cfg {Boolean} showHint
	 */
	showHint: true,

	/**
	 * @cfg {String} hintText
	 */
	hintText: 'Fields marked with {symbol} are required',

	/**
	 * @cfg {HTMLElement|String} hintTarget
	 */
	hintTarget: null,

	hintTextCls: 'x-field-required-hint',

	constructor: function(config) {
		config = config || {};
		Ext.apply(this, config);
    },

    /**
     * @param {FormPanel} form
     */
    init: function(form) {
    	// the plugin can only be attached to a FormPanel (or it subclasses)
    	if (form instanceof Ext.form.FormPanel) {
    		var hasRequiredField = false;
    		if (!this._requiredSymbolTpl) {
    			this._requiredSymbolTpl = new Ext.Template(this.symbol, {
    				compiled: true,
    				disableFormats: true
    			});
    		}
    		var requiredSymbol = this._requiredSymbolTpl.apply(this);
    		var requiredSymbolPosition = this.symbolPosition;
    		Ext.each(form.find(), function (item) {
    			if (item.allowBlank === false) {
    				if (requiredSymbolPosition == 'right') {
    					item.fieldLabel = item.fieldLabel + requiredSymbol;
    				} else {
    					item.fieldLabel = requiredSymbol + item.fieldLabel;
    				}
    				hasRequiredField = true;
            	}
    		});
    		if (hasRequiredField && this.showHint) {
    			var hintTextHtml = new Ext.Template(this.hintText).apply({symbol: requiredSymbol});
    			if (this.hintTarget) {
    				this.hintTarget.addClass(this.hintTextCls);
    				this.hintTarget.update(hintTextHtml);
    			} else {
    				form.add({
    					xtype: 'box',
    					autoEl: {
    						tag: 'div',
    						cls: this.hintTextCls
    					},
    					html: hintTextHtml
    				});
    			}
    		}
    	}
    },

    onDestroy: function() {
    	if (this._requiredSymbolTpl) {
    		delete this._requiredSymbolTpl;
    	}
    }
});
