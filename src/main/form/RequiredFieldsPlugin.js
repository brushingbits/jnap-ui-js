/*!
 * 
 */
Ext.ns('Ext.ux.jnap.form');

/**
 * @class Ext.ux.jnap.form.RequiredFieldsPlugin
 * @extends Object
 * An {@link Ext.form.FormPanel} plugin that adds a mark to the required (allowBlank = false)
 * fields label. A hint can be added to the form too, to indicate the presence of required fields.
 * See the config options documentation for details.
 */
Ext.ux.jnap.form.RequiredFieldsPlugin = Ext.extend(Object, {

	/**
	 * @cfg {String} mark
	 * The string to be used as a mark of a required field (allowBlank = false). Defaults to
	 * '<span class=\'{0}\'>*</span>' where the <code>{0}</code> token is replaced by {@link #markCls}.
	 */
	mark : '<span class=\'{0}\'>*</span>',

	/**
	 * @cfg {String} markPosition
	 * The side of the field's label to render the required mark. Valid values are 'left' or 'right'.
	 * Anything different from those will cause the symbol to be right aligned. Defaults to 'right'.
	 */
	markPosition : 'right',

	/**
	 * @cfg {String} markCls
	 * The CSS class used to apply to the mark. Defaults to 'x-field-required'.
	 */
	markCls : 'x-field-required',

	/**
	 * @cfg {Boolean} showHint
	 * <code>true</code> if a hint text should be added to the form to indicate the presence of
	 * required fields (see {@link #hintText}). Defaults to <code>true</code>.
	 */
	showHint : true,

	/**
	 * @cfg {String} hintText
	 * The text used to inform that the fields marked with {@link #mark} are required. It can be
	 * omitted, see {@link #showHint}. Defaults to 'Fields marked with {0} are required' where the
	 * <code>{0}</code> token is replaced by {@link #mark}.
	 */
	hintText : 'Fields marked with {0} are required',

	/**
	 * @cfg {String|Ext.Element|Ext.Component} hintTarget
	 * A {@link Ext.Element} reference, a {Ext.Component} or a String (element or component id)
	 * which the {@link #hintText} and {@link #hintCls} will be applied to. If none specified but
	 * the {@link #showHint} is true, then a {@link Ext.BoxComponent} will be added to the end
	 * of the form. Defaults to <code>undefined</code>.
	 */
	hintTarget : undefined,

	/**
	 * @cfg {String} hintTextCls
	 * The CSS class used to apply to the hint text container. See {@link #showHint} and {@link #hintText}.
	 * Defaults to <code>'x-field-required-hint'</code>.
	 */
	hintTextCls : 'x-field-required-hint',

	constructor : function(config) {
		config = config || {};
		Ext.apply(this, config);
	},

	// private
	init : function(form) {
		// the plugin can only be attached to a FormPanel (or it subclasses)
		if (!form instanceof Ext.form.FormPanel) {
			return false;
		}
		var hasRequiredField = false;
		var requiredMark = String.format(this.mark, this.markCls);
		var requiredMarkPosition = this.markPosition;
		Ext.each(form.find(), function(item) {
			if (item.allowBlank === false) {
				if (requiredMarkPosition == 'left') {
					item.fieldLabel = requiredMark + item.fieldLabel;
				} else {
					item.fieldLabel = item.fieldLabel + requiredMark;
				}
				hasRequiredField = true;
			}
		});
		
		// should a hint be added to the form?
		if (hasRequiredField && this.showHint) {
			var formattedHint = String.format(this.hintText, requiredMark);
			if (this.hintTarget) {
				var target = this.hintTarget;
				if (Ext.isString(this.hintTarget)) {
					target = Ext.get(this.hintTarget);
					if (!target) {
						target = Ext.getCmp(this.hintTarget);
					}
				}
				// is target a valid object (Element or Component)?
				if (target && target.addClass && target.update) {
					target.addClass(this.hintTextCls);
					target.update(formattedHint);
				}
			} else {
				form.add({
					xtype : 'box',
					autoEl : {
						tag : 'div',
						cls : this.hintTextCls
					},
					html : formattedHint
				});
			}
		}
		return true;
	}

});

Ext.preg('requiredfields', Ext.ux.jnap.form.RequiredFieldsPlugin);