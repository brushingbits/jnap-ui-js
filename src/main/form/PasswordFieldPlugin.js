/*!
 * 
 */
Ext.ns('Ext.ux.jnap.form');

/**
 * @class Ext.ux.jnap.form.PasswordFieldPlugin
 * @extends Object
 */
Ext.ux.jnap.form.PasswordFieldPlugin = Ext.extend(Object, {

	capsLockTip : 'Caps Lock is <strong>on</strong>. Since passwords are case sensitive, this may cause you to enter it incorrectly.',

	showCapsLockTip : true,

	minLength : 6,

	maxLength : 14,

	validKeysRegExp : /^([a-zA-Z0-9@#])$/,

	keyFiltering : false,

	lengthLimit : false,

	_field : undefined,

	constructor: function(config) {
		Ext.apply(this, config || {});
    },

	init : function(field) {
		if (!(field instanceof Ext.form.TextField)) {
			return false; // this plugin can be only applied to instances of TextField
		}
		this._field = field;
		field.inputType = 'password';
		if (this.lengthLimit) {
			field.minLength = this.minLength;
			field.maxLength = this.maxLength;
		}
		if (this.keyFiltering) {
			field.maskRe = this.validKeysRegExp;
		}
		if (this.showCapsLockTip) {
			field.enableKeyEvents = true;
			field.afterRender = field.afterRender.createSequence(this.handleCapsLockKey, this);
		}
	},

	handleCapsLockKey : function() {
		this._field.mon(this._field.el, 'keypress', function(evt, textfield) {
			if (this._isCapsLockOn(evt)) {
				if (!this._capsLockTip) {
					this._capsLockTip = new Ext.ToolTip({
						anchor : 'top',
						dismissDelay : 4000,
						hidden : true,
						html : this.capsLockTip,
						maxWidth : 300,
						suppressDefaultEvents : true,
						target : this._field.el
					});
				}
				this._capsLockTip.show();
			} else if (this._capsLockTip && this._capsLockTip.isVisible()) {
				this._capsLockTip.hide();
			}
		}, this, { buffer : 100 });
	},

	_isCapsLockOn : function(evt) {
		var charCode = evt.getCharCode();
		var shiftOn = evt.shiftKey;
		return (charCode >= 97 && charCode <= 122 && shiftOn)
			|| (charCode >= 65 && charCode <= 90 && !shiftOn);
	}

});