Ext.applyIf(Ext.form.MessageTargets, {
	'field-icon-tip': {
		tipAnchor: 'left',
		mark: function(field, msg) {
			field.el.addClass(field.invalidClass);
			var alreadyExists = true;
			if (!field.errorIcon) {
				alreadyExists = false;
				var elp = field.getErrorCt();
				if (!elp) {
					field.el.dom.title = msg;
					return;
				}
				field.errorIcon = elp.createChild({cls: 'x-form-invalid-icon'});
				if (field.ownerCt) {
					field.ownerCt.on('afterlayout', field.alignErrorIcon, field);
					field.ownerCt.on('expand', field.alignErrorIcon, field);
				}
				
				var mouseOffset = {
					top: [-11, 1],
					left: [0, 0],
					bottom: [-11, 5],
					right: [2, 0]
				};
				var anchor = this.tipAnchor;
				field.errorTip = new Ext.ToolTip({
					html: msg,
					target: field.errorIcon,
					showDelay: 150,
					autoHide: false,
					minWidth: 120,
					maxWidth: 280,
					anchor: anchor,
					mouseOffset: mouseOffset[anchor]
				});
				field.on('focus', function() {
					if (!this.errorTip.isVisible() && this.el.hasClass(this.invalidClass)) {
						this.errorTip.show();
					}
				});
				field.on('blur', function() {
					if (!this.errorIconMouseOver) {
						this.errorTip.hide();
					}
				});
				field.errorIcon.on('mouseover', function() {
					this.errorIconMouseOver = true;
				}, field);
				field.errorIcon.on('mouseout', function() {
					this.errorIconMouseOver = false;
					if (!this.el.hasClass(this.focusClass)) {
						this.errorTip.hide();
					}
				}, field);
				field.on('resize', field.alignErrorIcon, field);
				field.on('destroy', function() {
					Ext.destroy(this.errorIcon);
					Ext.destroy(this.errorTip);
				}, field);
			}
			field.alignErrorIcon();
			field.errorIcon.show();
			if (alreadyExists) {
				field.errorTip.update(msg);
			}
			if (field.el.hasClass(field.focusClass)) {
				field.errorTip.show();
			}
		},
		clear: function(field) {
			if (field.errorIcon) {
				field.errorIcon.dom.qtip = '';
				field.errorIcon.hide();
				field.errorTip.hide();
			}
			field.el.removeClass(field.invalidClass);
		}
	}
});