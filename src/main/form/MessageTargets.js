Ext.applyIf(Ext.form.MessageTargets, {
	'field-icon-tip' : {

		defaultErrorTipAnchor : 'left',

		mark : function(field, msg) {
			field.el.addClass(field.invalidClass);
			if (!field.errorIcon) {
				var elp = field.getErrorCt();
				if (!elp) {
					// fallback to field title msg if no error container is found (create it?)
					field.el.dom.title = msg;
					return;
				}
				field.errorIcon = elp.createChild({
					cls : 'x-form-invalid-icon'
				});
				if (field.ownerCt) {
					field.mon(field.ownerCt, 'afterlayout', field.alignErrorIcon, field);
					field.mon(field.ownerCt, 'expand', field.alignErrorIcon, field);
					// TODO how to reposition the tooltip?
					//field.alignErrorIcon = field.alignErrorIcon.createSequence
					/*field.mon(field.errorIcon, 'move', function() {
						if (this.errorTip && this.errorTip.isVisible()) {
							// is there a better way to do this?
							this.errorTip.hide();
							this.errorTip.show();//.defer(20, this.errorTip);
						}
					}, field);*/
				}

				// tip offset correction
				var mouseOffset = {
					top : [ -11, 1 ],
					left : [ 0, 0 ],
					bottom : [ -11, 5 ],
					right : [ 2, 0 ]
				};
				var anchor = field.errorTipAnchor || this.defaultErrorTipAnchor;
				field.errorTip = new Ext.ToolTip({
					html : msg,
					target : field.errorIcon,
					showDelay : 100,
					autoHide : false,
					minWidth : 120,
					maxWidth : 280,
					anchor : anchor,
					mouseOffset : mouseOffset[anchor]
				});
				field.mon(field, 'focus', function() {
					if (!this.errorTip.isVisible() && this.el.hasClass(this.invalidClass)) {
						this.errorTip.show();
					}
				}, field);
				field.mon(field, 'blur', function() {
					if (!this.errorIconMouseOver) {
						this.errorTip.hide();
					}
				}, field);
				field.mon(field.errorIcon, 'mouseover', function() {
					this.errorIconMouseOver = true;
				}, field);
				field.mon(field.errorIcon, 'mouseout', function() {
					this.errorIconMouseOver = false;
					if (!this.el.hasClass(this.focusClass)) {
						this.errorTip.hide();
					}
				}, field);
				field.mon(field, 'resize', field.alignErrorIcon, field);
				field.mon(field, 'destroy', function() {
					Ext.destroy(this.errorIcon, this.errorTip);
				}, field);
			}
			field.alignErrorIcon();
			field.errorIcon.show();
			if (field.errorTip && field.errorTip.rendered) {
				field.errorTip.update(msg);
			}
			if (field.el.hasClass(field.focusClass)) {
				field.errorTip.show();
			}
		},

		clear : function(field) {
			if (field.errorIcon) {
				field.errorIcon.dom.qtip = '';
				field.errorIcon.hide();
				field.errorTip.hide();
			}
			field.el.removeClass(field.invalidClass);
		}
	}
});